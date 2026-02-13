"""
Global error handler middleware for FastAPI.

Catches all exceptions and returns standardized error responses
with proper logging and correlation ID tracking.
"""

import traceback
from typing import Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from ..core.exceptions import AppException, create_error_response
from ..core.logging import Logger, get_correlation_id, set_correlation_id

logger = Logger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle all exceptions globally.

    Provides:
    - Standardized error responses (RFC 7807)
    - Correlation ID tracking
    - Structured error logging
    - Stack trace logging for debugging
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and handle any exceptions.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain

        Returns:
            HTTP response (normal or error)
        """
        # Set correlation ID from header or generate new one
        correlation_id = request.headers.get("X-Correlation-ID")
        if not correlation_id:
            correlation_id = get_correlation_id()
        else:
            set_correlation_id(correlation_id)

        try:
            # Process request
            response = await call_next(request)

            # Add correlation ID to response headers
            response.headers["X-Correlation-ID"] = correlation_id

            return response

        except AppException as exc:
            # Handle known application exceptions
            logger.error(
                "application_error",
                error_type=type(exc).__name__,
                error_message=exc.message,
                status_code=exc.status_code,
                path=request.url.path,
                method=request.method,
                details=exc.details,
            )

            error_response = create_error_response(
                exception=exc,
                instance=request.url.path,
                correlation_id=correlation_id,
            )

            return JSONResponse(
                status_code=exc.status_code,
                content=error_response.to_dict(),
                headers={"X-Correlation-ID": correlation_id},
            )

        except ValueError as exc:
            # Handle validation errors
            logger.error(
                "validation_error",
                error_message=str(exc),
                path=request.url.path,
                method=request.method,
            )

            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "type": "https://api.evolve-todo.com/errors/ValidationError",
                    "title": "Validation Error",
                    "status": status.HTTP_400_BAD_REQUEST,
                    "detail": str(exc),
                    "instance": request.url.path,
                    "correlation_id": correlation_id,
                },
                headers={"X-Correlation-ID": correlation_id},
            )

        except Exception as exc:
            # Handle unexpected exceptions
            logger.critical(
                "unhandled_exception",
                error_type=type(exc).__name__,
                error_message=str(exc),
                path=request.url.path,
                method=request.method,
                stack_trace=traceback.format_exc(),
            )

            # Don't expose internal error details in production
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "type": "https://api.evolve-todo.com/errors/InternalServerError",
                    "title": "Internal Server Error",
                    "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "detail": "An unexpected error occurred. Please try again later.",
                    "instance": request.url.path,
                    "correlation_id": correlation_id,
                },
                headers={"X-Correlation-ID": correlation_id},
            )
