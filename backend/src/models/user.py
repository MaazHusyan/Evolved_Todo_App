"""
User model for the todo application.
"""
from typing import TYPE_CHECKING, Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
import enum

if TYPE_CHECKING:
    from .todo_item import TodoItem


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    username: Optional[str] = Field(default=None, unique=True, index=True)
    is_active: bool = Field(default=True)
    role: UserRole = Field(default=UserRole.USER)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to todo items
    todos: List["TodoItem"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class UserCreate(UserBase):
    password: str


class UserUpdate(SQLModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime