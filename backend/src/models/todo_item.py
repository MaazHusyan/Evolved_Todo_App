"""
TodoItem model for the todo application.
"""
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from .user import User


class TodoItemBase(SQLModel):
    title: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="user.id", index=True)


class TodoItem(TodoItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user
    user: "User" = Relationship(back_populates="todos")


class TodoItemCreate(SQLModel):
    title: str  # Make title required for creation
    description: Optional[str] = None
    is_completed: bool = False  # Default to False for new todos


class TodoItemUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None


class TodoItemRead(TodoItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # user: Optional["User"] = None  # Removed to avoid circular reference issues