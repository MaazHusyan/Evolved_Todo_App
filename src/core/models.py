from uuid import UUID, uuid4
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from enum import StrEnum
from datetime import datetime

class Priority(StrEnum):
    """Urgency level for tasks."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(BaseModel):
    """Domain model representing a Todo Task."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="")
    priority: Priority = Field(default=Priority.MEDIUM)
    tags: List[str] = Field(default_factory=list)
    is_completed: bool = Field(default=False)
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)

class TaskCreate(BaseModel):
    """Model for creating a new Task."""
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="")
    priority: Priority = Field(default=Priority.MEDIUM)
    tags: List[str] = Field(default_factory=list)

class TaskUpdate(BaseModel):
    """Model for updating an existing Task."""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    priority: Optional[Priority] = None
    tags: Optional[List[str]] = None
    is_completed: Optional[bool] = None
    due_date: Optional[datetime] = None
