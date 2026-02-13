"""
Custom exception hierarchy for the application.

Provides structured error handling with proper HTTP status codes
and user-friendly error messages.
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppException):
    """Raised when input validation fails."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class AuthenticationError(AppException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class AuthorizationError(AppException):
    """Raised when user lacks permission for an action."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class NotFoundError(AppException):
    """Raised when a requested resource is not found."""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": resource, "identifier": identifier},
        )


class ConflictError(AppException):
    """Raised when a resource conflict occurs."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            details=details,
        )


class RateLimitError(AppException):
    """Raised when rate limit is exceeded."""

    def __init__(self, retry_after: int = 60):
        super().__init__(
            message="Rate limit exceeded. Please try again later.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details={"retry_after": retry_after},
        )


class DatabaseError(AppException):
    """Raised when database operation fails."""

    def __init__(self, message: str = "Database operation failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class ExternalServiceError(AppException):
    """Raised when external service call fails."""

    def __init__(self, service: str, message: str = "External service unavailable"):
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"service": service},
        )


class AIServiceError(ExternalServiceError):
    """Raised when AI service (OpenAI) fails."""

    def __init__(self, message: str = "AI service temporarily unavailable"):
        super().__init__(service="OpenAI", message=message)


class MCPError(AppException):
    """Raised when MCP tool execution fails."""

    def __init__(self, tool: str, message: str):
        super().__init__(
            message=f"MCP tool '{tool}' failed: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"tool": tool},
        )


# Error response models for OpenAPI documentation
class ErrorResponse:
    """Standard error response format (RFC 7807 Problem Details)."""

    def __init__(
        self,
        type: str,
        title: str,
        status: int,
        detail: str,
        instance: str,
        correlation_id: Optional[str] = None,
        **kwargs,
    ):
        self.type = type
        self.title = title
        self.status = status
        self.detail = detail
        self.instance = instance
        self.correlation_id = correlation_id
        self.extra = kwargs

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON response."""
        response = {
            "type": self.type,
            "title": self.title,
            "status": self.status,
            "detail": self.detail,
            "instance": self.instance,
        }
        if self.correlation_id:
            response["correlation_id"] = self.correlation_id
        if self.extra:
            response.update(self.extra)
        return response


def create_error_response(
    exception: AppException,
    instance: str,
    correlation_id: Optional[str] = None,
) -> ErrorResponse:
    """
    Create a standardized error response from an exception.

    Args:
        exception: The application exception
        instance: The request path that caused the error
        correlation_id: Optional correlation ID for tracking

    Returns:
        ErrorResponse object
    """
    error_type = exception.__class__.__name__
    return ErrorResponse(
        type=f"https://api.evolve-todo.com/errors/{error_type}",
        title=error_type.replace("Error", " Error"),
        status=exception.status_code,
        detail=exception.message,
        instance=instance,
        correlation_id=correlation_id,
        **exception.details,
    )
