"""Conversation model for AI chat feature."""
from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship


class Conversation(SQLModel, table=True):
    """
    Represents a chat session between a user and the AI assistant.

    In Phase III, each user has one continuous conversation.
    Future phases may support multiple conversation threads.
    """
    __tablename__ = "conversations"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        description="Unique conversation identifier"
    )

    user_id: str = Field(
        foreign_key="user.id",
        index=True,
        description="Owner of this conversation"
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When conversation was created"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last message timestamp"
    )

    # Relationships
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    def update_timestamp(self) -> None:
        """Update the updated_at timestamp when new message added."""
        self.updated_at = datetime.utcnow()
