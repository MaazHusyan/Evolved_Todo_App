"""
Task model for the Todo application
"""
from sqlmodel import SQLModel, Field, JSON
from datetime import datetime
from typing import Optional, List
import uuid

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)
    user_id: str = Field(foreign_key="user.id", nullable=False, index=True)
    start_date: Optional[datetime] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    priority: Optional[str] = Field(default=None, regex=r"^(low|medium|high)$")
    tags: Optional[List[str]] = Field(default_factory=list, sa_type=JSON)

class Task(TaskBase, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', user_id='{self.user_id}', completed={self.is_completed})>"