"""Message service for managing chat messages."""

from uuid import UUID
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlmodel import select, desc
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models import Message


async def get_recent_messages(
    session: AsyncSession, conversation_id: UUID, limit: int = 50
) -> List[Message]:
    """
    Retrieve the most recent messages for a conversation.

    Messages are returned in chronological order (oldest first) to maintain
    proper conversation flow. The limit parameter controls the context window
    size for AI processing.

    Args:
        session: Database session
        conversation_id: Conversation identifier
        limit: Maximum number of messages to retrieve (default: 50)

    Returns:
        List[Message]: Recent messages in chronological order

    Example:
        >>> messages = await get_recent_messages(session, conversation_id, limit=50)
        >>> for msg in messages:
        ...     print(f"{msg.role}: {msg.content}")
    """
    # Query messages ordered by creation time (newest first)
    # Convert UUID to string for SQLite compatibility
    statement = (
        select(Message)
        .where(Message.conversation_id == str(conversation_id))
        .order_by(desc(Message.created_at))
        .limit(limit)
    )

    result = await session.execute(statement)
    messages = result.scalars().all()

    # Reverse to get chronological order (oldest first)
    return list(reversed(messages))


async def save_message(
    session: AsyncSession,
    conversation_id: UUID,
    role: str,
    content: str,
    tool_calls: Optional[Dict[str, Any]] = None,
) -> Message:
    """
    Save a new message to the conversation.

    Messages are immutable once created. The role must be either 'user' or
    'assistant'. Tool calls are stored as JSONB for flexible metadata.

    Args:
        session: Database session
        conversation_id: Parent conversation identifier
        role: Message sender ('user' or 'assistant')
        content: Message text content
        tool_calls: Optional metadata about AI tool invocations

    Returns:
        Message: The created message

    Raises:
        ValueError: If role is not 'user' or 'assistant'

    Example:
        >>> message = await save_message(
        ...     session,
        ...     conversation_id,
        ...     role="user",
        ...     content="Create a task for tomorrow"
        ... )
    """
    if role not in ("user", "assistant"):
        raise ValueError(f"Invalid role: {role}. Must be 'user' or 'assistant'")

    # Convert UUID to string for SQLite compatibility
    message = Message(
        conversation_id=str(conversation_id),
        role=role,
        content=content,
        tool_calls=tool_calls,
    )

    session.add(message)
    await session.commit()
    # Note: Not calling session.refresh() to avoid greenlet conflicts
    # The message object already has all the data we need

    return message
