"""
API response utilities for the todo application.
Provides standardized response formats.
"""
from typing import Any, Dict, Optional
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class ApiResponse(BaseModel):
    """Standard API response format."""
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[str] = None


class PaginationInfo(BaseModel):
    """Pagination information for paginated responses."""
    page: int
    size: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel):
    """Paginated API response format."""
    success: bool
    data: Any
    message: Optional[str] = None
    pagination: Optional[PaginationInfo] = None


def create_success_response(
    data: Any = None,
    message: str = "Request successful"
) -> Dict[str, Any]:
    """Create a standard success response."""
    return {
        "success": True,
        "data": data,
        "message": message
    }


def create_error_response(
    error: str,
    message: str = "Request failed"
) -> Dict[str, Any]:
    """Create a standard error response."""
    return {
        "success": False,
        "error": error,
        "message": message
    }


def create_paginated_response(
    data: Any,
    page: int,
    size: int,
    total: int,
    message: str = "Paginated request successful"
) -> Dict[str, Any]:
    """Create a paginated response."""
    total_pages = (total + size - 1) // size  # Ceiling division

    return {
        "success": True,
        "data": data,
        "message": message,
        "pagination": {
            "page": page,
            "size": size,
            "total": total,
            "total_pages": total_pages
        }
    }


def handle_error(
    detail: str,
    status_code: int = 400
) -> JSONResponse:
    """Helper to create error responses."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": detail,
            "message": "Request failed"
        }
    )


def handle_success(
    data: Any = None,
    message: str = "Operation successful",
    status_code: int = 200
) -> JSONResponse:
    """Helper to create success responses."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "data": data,
            "message": message
        }
    )


# Specific response helpers
def created_response(
    data: Any = None,
    message: str = "Resource created successfully"
) -> JSONResponse:
    """Helper for 201 Created responses."""
    return handle_success(data, message, 201)


def no_content_response(
    message: str = "Operation completed successfully"
) -> JSONResponse:
    """Helper for 204 No Content responses."""
    return JSONResponse(
        status_code=204,
        content={
            "success": True,
            "message": message
        }
    )


def bad_request_response(detail: str) -> JSONResponse:
    """Helper for 400 Bad Request responses."""
    return handle_error(detail, 400)


def unauthorized_response(detail: str = "Not authenticated") -> JSONResponse:
    """Helper for 401 Unauthorized responses."""
    return handle_error(detail, 401)


def forbidden_response(detail: str = "Access denied") -> JSONResponse:
    """Helper for 403 Forbidden responses."""
    return handle_error(detail, 403)


def not_found_response(detail: str = "Resource not found") -> JSONResponse:
    """Helper for 404 Not Found responses."""
    return handle_error(detail, 404)