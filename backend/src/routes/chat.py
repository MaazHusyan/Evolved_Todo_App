"""Chat API endpoints for AI assistant interaction."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlmodel import Session, create_engine, select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models.base import SessionDep, engine as async_engine
from ..auth.middleware import get_current_user
from ..models import Conversation, Message
from ..services.conversation_service import get_or_create_conversation
from ..services.message_service import get_recent_messages, save_message
from ..ai.client import groq_client
import asyncio
from collections import defaultdict
from time import time
import os


# Create router
chat_router = APIRouter(prefix="/api/chat", tags=["chat"])


# Rate limiting storage (in-memory for MVP, use Redis in production)
rate_limit_storage: Dict[UUID, List[float]] = defaultdict(list)
RATE_LIMIT_PER_MINUTE = 60  # Default rate limit


# Create sync engine for chat operations to avoid async/greenlet conflicts
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")
if DATABASE_URL.startswith("sqlite+aiosqlite"):
    DATABASE_URL = DATABASE_URL.replace("sqlite+aiosqlite", "sqlite")
sync_engine = create_engine(DATABASE_URL, echo=True)


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""

    message: str
    stream: bool = False

    def validate_message(self) -> tuple[bool, Optional[str]]:
        """
        Validate message content.

        Returns:
            tuple: (is_valid, error_message)
        """
        # Check if message is empty
        if not self.message or not self.message.strip():
            return False, "Message cannot be empty. Please type a message to send."

        # Check message length (max 2000 characters)
        if len(self.message) > 2000:
            return (
                False,
                f"Message is too long ({len(self.message)} characters). Please keep messages under 2000 characters.",
            )

        return True, None


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""

    message: str
    conversation_id: UUID
    message_id: UUID
    created_at: datetime


def check_rate_limit(user_id: UUID) -> None:
    """
    Check if user has exceeded rate limit.

    Args:
        user_id: User identifier

    Raises:
        HTTPException: If rate limit exceeded
    """
    now = time()
    minute_ago = now - 60

    # Clean old timestamps
    rate_limit_storage[user_id] = [
        ts for ts in rate_limit_storage[user_id] if ts > minute_ago
    ]

    # Check limit
    if len(rate_limit_storage[user_id]) >= RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )

    # Add current request
    rate_limit_storage[user_id].append(now)


def get_or_create_conversation_sync(session: Session, user_id: UUID) -> Conversation:
    """Sync version of get_or_create_conversation."""
    statement = select(Conversation).where(Conversation.user_id == str(user_id))
    result = session.execute(statement)
    conversation = result.scalar_one_or_none()

    if conversation:
        return conversation

    # Create new conversation if none exists
    conversation = Conversation(user_id=str(user_id))
    session.add(conversation)
    session.commit()

    return conversation


def save_message_sync(
    session: Session,
    conversation_id: UUID,
    role: str,
    content: str,
    tool_calls: Optional[Dict[str, Any]] = None,
) -> Message:
    """Sync version of save_message."""
    if role not in ("user", "assistant"):
        raise ValueError(f"Invalid role: {role}. Must be 'user' or 'assistant'")

    message = Message(
        conversation_id=str(conversation_id),
        role=role,
        content=content,
        tool_calls=tool_calls,
    )

    session.add(message)
    session.commit()

    return message


def get_recent_messages_sync(
    session: Session, conversation_id: UUID, limit: int = 50
) -> List[Message]:
    """Sync version of get_recent_messages."""
    from sqlmodel import desc

    statement = (
        select(Message)
        .where(Message.conversation_id == str(conversation_id))
        .order_by(desc(Message.created_at))
        .limit(limit)
    )

    result = session.execute(statement)
    messages = result.scalars().all()

    # Reverse to get chronological order (oldest first)
    return list(reversed(messages))


@chat_router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    token_data: dict = Depends(get_current_user),
) -> ChatResponse:
    """
    Send a message to the AI assistant.

    This endpoint handles the complete chat flow using sync database operations
    to avoid async/greenlet conflicts with the OpenAI Agents SDK.
    Uses Gemini API via OpenAI-compatible interface.
    """
    try:
        # Validate message
        is_valid, error_msg = request.validate_message()
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg
            )

        user_id = UUID(token_data["user_id"])

        # Check rate limit
        check_rate_limit(user_id)

        # Step 1: All database operations using sync session
        conversation_id = None
        messages_history = []

        with Session(sync_engine) as session:
            try:
                # Get or create conversation
                conversation = get_or_create_conversation_sync(session, user_id)
                conversation_id = conversation.id

                # Save user message
                user_message = save_message_sync(
                    session, conversation.id, role="user", content=request.message
                )

                # Get recent message history for context
                recent_messages = get_recent_messages_sync(
                    session,
                    conversation.id,
                    limit=groq_client.get_context_window_size(),
                )

                # Format messages for AI
                messages_history = [
                    {"role": msg.role, "content": msg.content}
                    for msg in recent_messages
                ]
            except Exception as db_error:
                print(f"DB Error in chat (step 1): {db_error}")
                session.rollback()
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Database temporarily unavailable. Please try again in a moment.",
                )

        # Step 2: AI API call using Groq-compatible implementation
        try:
            from ..ai.agent_sdk_groq_fix import process_message_groq

            assistant_content = await process_message_groq(
                user_id=user_id,
                message=request.message,
                conversation_history=messages_history,
            )
            tool_calls = None
        except Exception as ai_error:
            # Handle AI API errors
            error_str = str(ai_error).lower()
            print(f"AI API Error: {ai_error}")
            if "rate limit" in error_str or "quota" in error_str:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="AI service is currently busy. Please try again in a moment.",
                )
            elif "timeout" in error_str:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="AI service took too long to respond. Please try again.",
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Unable to process your message: {str(ai_error)[:100]}",
                )

        # Step 3: Save assistant message using sync session
        assistant_message = None
        with Session(sync_engine) as session:
            try:
                assistant_message = save_message_sync(
                    session,
                    conversation_id,
                    role="assistant",
                    content=assistant_content,
                    tool_calls=tool_calls,
                )

                # Update conversation timestamp
                conversation = session.execute(
                    select(Conversation).where(Conversation.id == str(conversation_id))
                ).scalar_one_or_none()

                if conversation:
                    conversation.update_timestamp()
                    session.add(conversation)

                session.commit()
            except Exception as db_error:
                print(f"Failed to save assistant message: {db_error}")
                session.rollback()

        return ChatResponse(
            message=assistant_content,
            conversation_id=conversation_id,
            message_id=assistant_message.id if assistant_message else conversation_id,
            created_at=assistant_message.created_at
            if assistant_message
            else datetime.utcnow(),
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)[:100]}",
        )


@chat_router.get("/history")
async def get_chat_history(
    token_data: dict = Depends(get_current_user),
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Get chat history for the current user."""
    try:
        user_id = UUID(token_data["user_id"])

        with Session(sync_engine) as session:
            # Get or create conversation
            conversation = get_or_create_conversation_sync(session, user_id)

            # Get recent messages
            messages = get_recent_messages_sync(session, conversation.id, limit=limit)

            # Format response
            return [
                {
                    "id": str(msg.id),
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                    "tool_calls": msg.tool_calls,
                }
                for msg in messages
            ]

    except Exception as e:
        print(f"History error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred retrieving chat history",
        )


async def chat_stream_generator(
    user_id: UUID,
    message: str,
    conversation_id: UUID,
):
    """Generate streaming response for chat."""
    try:
        # Get conversation messages
        messages_history = []
        with Session(sync_engine) as session:
            recent_messages = get_recent_messages_sync(
                session,
                conversation_id,
                limit=groq_client.get_context_window_size(),
            )
            messages_history = [
                {"role": msg.role, "content": msg.content} for msg in recent_messages
            ]

        # Add user message to history
        messages_history.append({"role": "user", "content": message})

        # Stream response using Groq-compatible implementation
        from ..ai.agent_sdk_groq_fix import stream_message_groq

        full_response = ""
        async for chunk in stream_message_groq(user_id, message, messages_history):
            full_response += chunk
            yield f"data: {chunk}\n\n"

        yield "data: [DONE]\n\n"

        # Save assistant message
        with Session(sync_engine) as session:
            assistant_message = save_message_sync(
                session,
                conversation_id,
                role="assistant",
                content=full_response,
            )

            # Update conversation timestamp
            conversation = session.execute(
                select(Conversation).where(Conversation.id == str(conversation_id))
            ).scalar_one_or_none()

            if conversation:
                conversation.update_timestamp()
                session.add(conversation)
                session.commit()

    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n"


@chat_router.post("/message/stream")
async def send_message_stream(
    request: ChatRequest,
    token_data: dict = Depends(get_current_user),
):
    """
    Send a message to the AI assistant with streaming response.

    Streams the assistant's response token by token for better UX.
    """
    # Validate message
    is_valid, error_msg = request.validate_message()
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    user_id = UUID(token_data["user_id"])

    # Check rate limit
    check_rate_limit(user_id)

    # Get or create conversation
    with Session(sync_engine) as session:
        conversation = get_or_create_conversation_sync(session, user_id)
        conversation_id = conversation.id

        # Save user message
        save_message_sync(
            session, conversation.id, role="user", content=request.message
        )
        session.commit()

    return StreamingResponse(
        chat_stream_generator(user_id, request.message, conversation_id),
        media_type="text/event-stream",
    )


@chat_router.delete("/clear")
async def clear_chat_history(
    token_data: dict = Depends(get_current_user),
):
    """Clear all chat messages for the current user."""
    try:
        user_id = UUID(token_data["user_id"])

        with Session(sync_engine) as session:
            # Get all conversations for user
            statement = select(Conversation).where(Conversation.user_id == str(user_id))
            result = session.execute(statement)
            conversations = result.scalars().all()

            # Delete all messages and conversations
            for conversation in conversations:
                # Delete messages first
                msg_statement = select(Message).where(
                    Message.conversation_id == str(conversation.id)
                )
                msg_result = session.execute(msg_statement)
                messages = msg_result.scalars().all()
                for msg in messages:
                    session.delete(msg)

                # Delete conversation
                session.delete(conversation)

            session.commit()

        return {"message": "Chat history cleared successfully"}

    except Exception as e:
        print(f"Clear chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred clearing chat history",
        )


@chat_router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str,
    token_data: dict = Depends(get_current_user),
):
    """Delete a specific message."""
    try:
        user_id = UUID(token_data["user_id"])

        with Session(sync_engine) as session:
            # Get the message
            statement = select(Message).where(Message.id == message_id)
            result = session.execute(statement)
            message = result.scalar_one_or_none()

            if not message:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Message not found",
                )

            # Verify ownership via conversation
            conv_statement = select(Conversation).where(
                Conversation.id == message.conversation_id,
                Conversation.user_id == str(user_id),
            )
            conv_result = session.execute(conv_statement)
            conversation = conv_result.scalar_one_or_none()

            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to delete this message",
                )

            # Delete the message
            session.delete(message)
            session.commit()

        return {"message": "Message deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete message error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred deleting the message",
        )
