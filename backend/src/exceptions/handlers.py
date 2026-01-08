"""
Custom exception handlers for the todo application.
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Union
import logging


logger = logging.getLogger(__name__)


class TodoException(Exception):
    """Base exception class for todo application."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class UserNotFoundException(TodoException):
    """Raised when a user is not found."""
    def __init__(self, user_id: int):
        super().__init__(f"User with id {user_id} not found", 404)


class TodoItemNotFoundException(TodoException):
    """Raised when a todo item is not found."""
    def __init__(self, todo_id: int):
        super().__init__(f"Todo item with id {todo_id} not found", 404)


class UserNotAuthorizedException(TodoException):
    """Raised when a user is not authorized to perform an action."""
    def __init__(self, message: str = "User not authorized"):
        super().__init__(message, 403)


class DuplicateEmailException(TodoException):
    """Raised when trying to create a user with an existing email."""
    def __init__(self):
        super().__init__("A user with this email already exists", 409)


class InvalidCredentialsException(TodoException):
    """Raised when login credentials are invalid."""
    def __init__(self):
        super().__init__("Incorrect email or password", 401)


class ValidationException(TodoException):
    """Raised when input validation fails."""
    def __init__(self, message: str):
        super().__init__(f"Validation error: {message}", 400)


# Exception handlers
async def todo_exception_handler(request: Request, exc: TodoException) -> JSONResponse:
    """Handle custom todo exceptions."""
    logger.error(f"TodoException: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions."""
    logger.error(f"HTTPException: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle validation exceptions."""
    logger.error(f"Validation error: {str(exc)}")
    return JSONResponse(
        status_code=422,
        content={"detail": f"Validation error: {str(exc)}"}
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle general exceptions."""
    logger.error(f"General error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred"}
    )