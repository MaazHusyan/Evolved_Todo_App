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
    id: str
    email: str
    name: str
    email_verified: bool
    image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TaskResponse(BaseModel):
    """Task response model"""
    id: uuid.UUID
    user_id: str
    title: str
    description: Optional[str] = None
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None

class TaskCreateRequest(BaseModel):
    """Task creation request model"""
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None

class TaskUpdateRequest(BaseModel):
    """Task update request model"""
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_completed: bool