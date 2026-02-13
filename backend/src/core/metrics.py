"""
Prometheus metrics for application monitoring.

Provides:
- Request duration histograms
- Request counter by endpoint and status
- Active requests gauge
- Custom business metrics
"""

from typing import Callable
import time

from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Request metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_REQUESTS = Gauge(
    'http_requests_active',
    'Number of active HTTP requests'
)

# Business metrics
TASKS_CREATED = Counter(
    'tasks_created_total',
    'Total number of tasks created',
    ['user_id']
)

TASKS_COMPLETED = Counter(
    'tasks_completed_total',
    'Total number of tasks completed',
    ['user_id']
)

TASKS_DELETED = Counter(
    'tasks_deleted_total',
    'Total number of tasks deleted',
    ['user_id']
)

CHAT_MESSAGES = Counter(
    'chat_messages_total',
    'Total number of chat messages',
    ['user_id', 'role']
)

AI_TOOL_CALLS = Counter(
    'ai_tool_calls_total',
    'Total number of AI tool calls',
    ['tool_name', 'status']
)

AI_RESPONSE_DURATION = Histogram(
    'ai_response_duration_seconds',
    'AI response duration in seconds',
    ['tool_name']
)

DATABASE_QUERY_DURATION = Histogram(
    'database_query_duration_seconds',
    'Database query duration in seconds',
    ['operation']
)

# Error metrics
ERROR_COUNT = Counter(
    'errors_total',
    'Total number of errors',
    ['error_type', 'endpoint']
)


class MetricsMiddleware(BaseHTTPMiddleware):
    """
    Middleware to collect Prometheus metrics for all requests.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and collect metrics.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/handler in chain

        Returns:
            HTTP response
        """
        # Skip metrics endpoint itself
        if request.url.path == "/metrics":
            return await call_next(request)

        # Increment active requests
        ACTIVE_REQUESTS.inc()

        # Start timer
        start_time = time.time()

        try:
            # Process request
            response = await call_next(request)

            # Record metrics
            duration = time.time() - start_time

            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code
            ).inc()

            REQUEST_DURATION.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)

            return response

        except Exception as exc:
            # Record error
            ERROR_COUNT.labels(
                error_type=type(exc).__name__,
                endpoint=request.url.path
            ).inc()
            raise

        finally:
            # Decrement active requests
            ACTIVE_REQUESTS.dec()


def get_metrics() -> bytes:
    """
    Get Prometheus metrics in text format.

    Returns:
        Metrics in Prometheus text format
    """
    return generate_latest()


def get_metrics_content_type() -> str:
    """
    Get content type for Prometheus metrics.

    Returns:
        Content type string
    """
    return CONTENT_TYPE_LATEST


# Convenience functions for business metrics
def record_task_created(user_id: str) -> None:
    """Record task creation metric."""
    TASKS_CREATED.labels(user_id=user_id).inc()


def record_task_completed(user_id: str) -> None:
    """Record task completion metric."""
    TASKS_COMPLETED.labels(user_id=user_id).inc()


def record_task_deleted(user_id: str) -> None:
    """Record task deletion metric."""
    TASKS_DELETED.labels(user_id=user_id).inc()


def record_chat_message(user_id: str, role: str) -> None:
    """Record chat message metric."""
    CHAT_MESSAGES.labels(user_id=user_id, role=role).inc()


def record_ai_tool_call(tool_name: str, status: str, duration: float) -> None:
    """Record AI tool call metric."""
    AI_TOOL_CALLS.labels(tool_name=tool_name, status=status).inc()
    AI_RESPONSE_DURATION.labels(tool_name=tool_name).observe(duration)


def record_database_query(operation: str, duration: float) -> None:
    """Record database query metric."""
    DATABASE_QUERY_DURATION.labels(operation=operation).observe(duration)
