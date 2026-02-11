"""Conversation service for managing chat sessions."""

from uuid import UUID
from typing import Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models import Conversation


async def get_or_create_conversation(
    session: AsyncSession, user_id: UUID
) -> Conversation:
    """
    Get existing conversation for user or create a new one.

    In Phase III, each user has exactly one continuous conversation.
    This function implements the single-conversation-per-user pattern.

    Args:
        session: Database session
        user_id: User identifier

    Returns:
        Conversation: Existing or newly created conversation

    Example:
        >>> conversation = await get_or_create_conversation(session, user_id)
        >>> print(conversation.id)
    """
    # Try to find existing conversation for this user
    # Convert UUID to string for comparison (user_id is stored as str in DB)
    statement = select(Conversation).where(Conversation.user_id == str(user_id))
    result = await session.execute(statement)
    conversation = result.scalar_one_or_none()

    if conversation:
        return conversation

    # Create new conversation if none exists
    conversation = Conversation(user_id=str(user_id))
    session.add(conversation)
    await session.commit()
    # Note: Not calling session.refresh() to avoid greenlet conflicts

    return conversation
