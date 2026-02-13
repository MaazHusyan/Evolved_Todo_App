"""Message model for AI chat feature."""

from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON, String


class Message(SQLModel, table=True):
    """
    Represents a single message in a conversation.

    Messages are immutable once created. The role field indicates
    whether the message is from the user or the AI assistant.
    """

    __tablename__ = "messages"

    id: UUID = Field(
        default_factory=uuid4, primary_key=True, description="Unique message identifier"
    )

    conversation_id: str = Field(
        foreign_key="conversations.id", index=True, description="Parent conversation"
    )

    role: str = Field(
        max_length=20, description="Message sender: 'user' or 'assistant'"
    )

    content: str = Field(description="Message text content")

    tool_calls: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON),
        description="Metadata about AI tool invocations",
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow, index=True, description="Message timestamp"
    )

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")

    @property
    def is_user_message(self) -> bool:
        """Check if message is from user."""
        return self.role == "user"

    @property
    def is_assistant_message(self) -> bool:
        """Check if message is from assistant."""
        return self.role == "assistant"
