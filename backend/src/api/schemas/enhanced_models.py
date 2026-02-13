"""
Enhanced Pydantic models with comprehensive validation.

Provides strict input validation, sanitization, and detailed error messages.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict
from enum import Enum


class PriorityLevel(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(str, Enum):
    """Task status values."""
    PENDING = "pending"
    COMPLETED = "completed"


class TaskCreateRequest(BaseModel):
    """Request model for creating a task."""

    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)"
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Task description (max 2000 characters)"
    )
    due_date: Optional[datetime] = Field(
        None,
        description="Task due date in ISO 8601 format"
    )
    start_date: Optional[datetime] = Field(
        None,
        description="Task start date in ISO 8601 format"
    )
    priority: PriorityLevel = Field(
        default=PriorityLevel.MEDIUM,
        description="Task priority level"
    )
    tags: List[str] = Field(
        default_factory=list,
        max_length=10,
        description="Task tags (max 10)"
    )

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate and sanitize title."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        # Remove excessive whitespace
        return ' '.join(v.split())

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate and sanitize tags."""
        if len(v) > 10:
            raise ValueError("Maximum 10 tags allowed")
        # Remove duplicates and empty tags
        return list(set(tag.strip() for tag in v if tag.strip()))

    @field_validator('due_date')
    @classmethod
    def validate_due_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Validate due date is not in the past."""
        if v and v < datetime.utcnow():
            raise ValueError("Due date cannot be in the past")
        return v


class TaskUpdateRequest(BaseModel):
    """Request model for updating a task."""

    model_config = ConfigDict(str_strip_whitespace=True)

    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)"
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Task description (max 2000 characters)"
    )
    due_date: Optional[datetime] = Field(
        None,
        description="Task due date in ISO 8601 format"
    )
    start_date: Optional[datetime] = Field(
        None,
        description="Task start date in ISO 8601 format"
    )
    priority: Optional[PriorityLevel] = Field(
        None,
        description="Task priority level"
    )
    is_completed: Optional[bool] = Field(
        None,
        description="Task completion status"
    )
    tags: Optional[List[str]] = Field(
        None,
        max_length=10,
        description="Task tags (max 10)"
    )

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate and sanitize title."""
        if v is not None:
            if not v.strip():
                raise ValueError("Title cannot be empty")
            return ' '.join(v.split())
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Validate and sanitize tags."""
        if v is not None:
            if len(v) > 10:
                raise ValueError("Maximum 10 tags allowed")
            return list(set(tag.strip() for tag in v if tag.strip()))
        return v


class TaskResponse(BaseModel):
    """Response model for task data."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    priority: str
    is_completed: bool
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime


class ChatMessageRequest(BaseModel):
    """Request model for chat messages."""

    model_config = ConfigDict(str_strip_whitespace=True)

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Chat message (1-2000 characters)"
    )
    conversation_id: Optional[str] = Field(
        None,
        description="Existing conversation ID to continue"
    )

    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate and sanitize message."""
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        # Remove excessive whitespace
        return ' '.join(v.split())


class ChatMessageResponse(BaseModel):
    """Response model for chat messages."""

    response: str = Field(..., description="AI assistant response")
    conversation_id: str = Field(..., description="Conversation identifier")
    message_id: str = Field(..., description="Message identifier")
    tool_calls: Optional[List[dict]] = Field(
        None,
        description="Tools invoked by AI"
    )
    created_at: datetime = Field(..., description="Message timestamp")


class HealthCheckResponse(BaseModel):
    """Response model for health checks."""

    status: str = Field(..., description="Overall health status")
    timestamp: str = Field(..., description="Check timestamp")
    version: str = Field(default="3.0.0", description="API version")
    checks: dict = Field(default_factory=dict, description="Dependency checks")


class ErrorResponse(BaseModel):
    """Standard error response model (RFC 7807)."""

    type: str = Field(..., description="Error type URI")
    title: str = Field(..., description="Error title")
    status: int = Field(..., description="HTTP status code")
    detail: str = Field(..., description="Error detail message")
    instance: str = Field(..., description="Request path")
    correlation_id: Optional[str] = Field(
        None,
        description="Correlation ID for tracking"
    )


class PaginationParams(BaseModel):
    """Pagination parameters."""

    skip: int = Field(
        default=0,
        ge=0,
        description="Number of items to skip"
    )
    limit: int = Field(
        default=50,
        ge=1,
        le=100,
        description="Number of items to return (max 100)"
    )


class TaskFilterParams(BaseModel):
    """Task filtering parameters."""

    status: Optional[TaskStatus] = Field(
        None,
        description="Filter by status"
    )
    priority: Optional[PriorityLevel] = Field(
        None,
        description="Filter by priority"
    )
    tag: Optional[str] = Field(
        None,
        max_length=50,
        description="Filter by tag"
    )
    search: Optional[str] = Field(
        None,
        max_length=200,
        description="Search in title and description"
    )
    due_before: Optional[datetime] = Field(
        None,
        description="Filter tasks due before this date"
    )
    due_after: Optional[datetime] = Field(
        None,
        description="Filter tasks due after this date"
    )


class TaskListResponse(BaseModel):
    """Response model for task lists."""

    tasks: List[TaskResponse]
    total: int = Field(..., description="Total number of tasks")
    skip: int = Field(..., description="Number of items skipped")
    limit: int = Field(..., description="Number of items returned")
    has_more: bool = Field(..., description="Whether more items exist")
