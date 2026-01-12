"""
User model for the Todo application
"""
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel

class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False)
    username: str = Field(unique=True, nullable=False)

class UserRegistration(BaseModel):
    email: str
    username: str
    password: str

class User(UserBase, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    is_active: bool = Field(default=True, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"