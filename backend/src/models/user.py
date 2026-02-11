"""
User model for the Todo application
"""
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel

class UserBase(SQLModel):
    email: str = Field(unique=True, nullable=False, index=True)
    name: str = Field(nullable=False)
    email_verified: bool = Field(default=False)
    image: Optional[str] = Field(default=None)

class User(UserBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    password_hash: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"

class UserRegistration(BaseModel):
    """Model for user registration data"""
    email: str
    username: str
    password: str