"""
Response models for the Todo application API
"""
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

class ErrorResponse(BaseModel):
    """Standard error response model"""
    error: str
    code: Optional[str] = None
    details: Optional[dict] = None

class UserResponse(BaseModel):
    """User response model"""
    id: uuid.UUID
    email: str
    username: str
    created_at: datetime
    updated_at: datetime
    is_active: bool

class TaskResponse(BaseModel):
    """Task response model"""
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str] = None
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None

class TaskCreateRequest(BaseModel):
    """Task creation request model"""
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None

class TaskUpdateRequest(BaseModel):
    """Task update request model"""
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_completed: bool
    tags: Optional[List[str]] = None