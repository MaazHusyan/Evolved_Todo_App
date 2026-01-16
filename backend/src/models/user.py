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
    email_verified: bool = Field(default=False, sa_column_kwargs={"name": "emailVerified"})
    image: Optional[str] = Field(default=None)

class User(UserBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, sa_column_kwargs={"name": "createdAt"})
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, sa_column_kwargs={"name": "updatedAt"})

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"