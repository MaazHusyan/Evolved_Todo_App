"""Performance monitoring for the chat API.

This module provides monitoring and metrics collection for tracking
API performance, errors, and usage statistics.
"""

import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from uuid import UUID
from collections import defaultdict, deque
from dataclasses import dataclass, field
import threading
from contextlib import asynccontextmanager


@dataclass
class RequestMetrics:
    """Metrics for a single request."""

    request_id: str
    user_id: Optional[str]
    endpoint: str
    method: str
    start_time: float
    end_time: Optional[float] = None
    status_code: Optional[int] = None
    error_message: Optional[str] = None
    tokens_used: Optional[int] = None
    response_time_ms: Optional[float] = None

    @property
    def duration_ms(self) -> float:
        """Calculate request duration in milliseconds."""
        if self.end_time is None:
            return 0
        return (self.end_time - self.start_time) * 1000


class PerformanceMonitor:
    """Thread-safe performance monitoring for the chat API."""

    def __init__(self, max_history: int = 1000):
        self._lock = threading.Lock()
        self._requests: deque = deque(maxlen=max_history)
        self._user_stats: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {
                "request_count": 0,
                "total_response_time": 0,
                "errors": 0,
                "last_request": None,
            }
        )
        self._endpoint_stats: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {
                "request_count": 0,
                "total_response_time": 0,
                "errors": 0,
            }
        )
        self._errors: deque = deque(maxlen=100)
        self._start_time = time.time()

    def record_request(
        self,
        request_id: str,
        user_id: Optional[str],
        endpoint: str,
        method: str,
        status_code: Optional[int] = None,
        error_message: Optional[str] = None,
        tokens_used: Optional[int] = None,
    ) -> None:
        """Record a completed request."""
        with self._lock:
            metrics = RequestMetrics(
                request_id=request_id,
                user_id=user_id,
                endpoint=endpoint,
                method=method,
                start_time=time.time(),
                status_code=status_code,
                error_message=error_message,
                tokens_used=tokens_used,
            )
            self._requests.append(metrics)

            # Update user stats
            if user_id:
                self._user_stats[user_id]["request_count"] += 1
                if status_code and status_code >= 400:
                    self._user_stats[user_id]["errors"] += 1
                self._user_stats[user_id]["last_request"] = (
                    datetime.utcnow().isoformat()
                )

            # Update endpoint stats
            self._endpoint_stats[endpoint]["request_count"] += 1
            if status_code and status_code >= 400:
                self._endpoint_stats[endpoint]["errors"] += 1

            # Record error
            if error_message:
                self._errors.append(
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "request_id": request_id,
                        "user_id": user_id,
                        "endpoint": endpoint,
                        "error": error_message,
                    }
                )

    def get_metrics(self) -> Dict[str, Any]:
        """Get overall metrics."""
        with self._lock:
            total_requests = len(self._requests)
            error_count = sum(
                1 for r in self._requests if r.status_code and r.status_code >= 400
            )
            response_times = [r.duration_ms for r in self._requests if r.end_time]

            return {
                "uptime_seconds": time.time() - self._start_time,
                "total_requests": total_requests,
                "error_count": error_count,
                "error_rate": error_count / total_requests if total_requests > 0 else 0,
                "avg_response_time_ms": sum(response_times) / len(response_times)
                if response_times
                else 0,
                "p95_response_time_ms": self._percentile(response_times, 95)
                if response_times
                else 0,
                "p99_response_time_ms": self._percentile(response_times, 99)
                if response_times
                else 0,
                "active_users": len(self._user_stats),
                "endpoints": dict(self._endpoint_stats),
            }

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get statistics for a specific user."""
        with self._lock:
            return dict(self._user_stats.get(user_id, {}))

    def get_recent_errors(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent errors."""
        with self._lock:
            return list(self._errors)[-limit:]

    def get_endpoint_stats(self) -> Dict[str, Dict[str, Any]]:
        """Get statistics per endpoint."""
        with self._lock:
            return dict(self._endpoint_stats)

    def get_user_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most active users."""
        with self._lock:
            sorted_users = sorted(
                self._user_stats.items(),
                key=lambda x: x[1]["request_count"],
                reverse=True,
            )[:limit]
            return [
                {
                    "user_id": user_id,
                    "request_count": stats["request_count"],
                    "errors": stats["errors"],
                }
                for user_id, stats in sorted_users
            ]

    @staticmethod
    def _percentile(data: List[float], percentile: int) -> float:
        """Calculate percentile of data."""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]


# Global monitor instance
monitor = PerformanceMonitor()


@asynccontextmanager
async def track_request(
    request_id: str,
    user_id: Optional[str],
    endpoint: str,
    method: str,
):
    """Context manager for tracking request metrics."""
    start_time = time.time()
    status_code = None
    error_message = None

    try:
        yield
        status_code = 200
    except Exception as e:
        error_message = str(e)[:200]
        raise
    finally:
        end_time = time.time()
        duration_ms = (end_time - start_time) * 1000

        # Update in-memory stats (would be database in production)
        with monitor._lock:
            metrics = RequestMetrics(
                request_id=request_id,
                user_id=user_id,
                endpoint=endpoint,
                method=method,
                start_time=start_time,
                end_time=end_time,
                status_code=status_code,
                error_message=error_message,
            )
            monitor._requests.append(metrics)

            # Update user stats
            if user_id:
                monitor._user_stats[user_id]["request_count"] += 1
                monitor._user_stats[user_id]["total_response_time"] += duration_ms
                if error_message:
                    monitor._user_stats[user_id]["errors"] += 1
                monitor._user_stats[user_id]["last_request"] = (
                    datetime.utcnow().isoformat()
                )

            # Update endpoint stats
            monitor._endpoint_stats[endpoint]["request_count"] += 1
            monitor._endpoint_stats[endpoint]["total_response_time"] += duration_ms
            if error_message:
                monitor._endpoint_stats[endpoint]["errors"] += 1


class UsageTracker:
    """Track API usage for rate limiting and billing."""

    def __init__(self, window_seconds: int = 60, max_requests: int = 60):
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self._user_requests: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=max_requests)
        )
        self._lock = threading.Lock()

    def is_rate_limited(self, user_id: str) -> bool:
        """Check if user is rate limited."""
        with self._lock:
            now = time.time()
            window_start = now - self.window_seconds

            # Clean old requests
            user_requests = self._user_requests[user_id]
            while user_requests and user_requests[0] < window_start:
                user_requests.popleft()

            # Check limit
            return len(user_requests) >= self.max_requests

    def record_request(self, user_id: str) -> None:
        """Record a request for a user."""
        with self._lock:
            self._user_requests[user_id].append(time.time())

    def get_remaining_requests(self, user_id: str) -> int:
        """Get remaining requests for user in current window."""
        with self._lock:
            now = time.time()
            window_start = now - self.window_seconds

            user_requests = self._user_requests[user_id]
            while user_requests and user_requests[0] < window_start:
                user_requests.popleft()

            return max(0, self.max_requests - len(user_requests))

    def get_usage_stats(self, user_id: str) -> Dict[str, Any]:
        """Get usage statistics for a user."""
        with self._lock:
            now = time.time()
            window_start = now - self.window_seconds

            user_requests = self._user_requests[user_id]
            recent_requests = [t for t in user_requests if t >= window_start]

            return {
                "requests_in_window": len(recent_requests),
                "max_requests": self.max_requests,
                "window_seconds": self.window_seconds,
                "remaining": max(0, self.max_requests - len(recent_requests)),
            }


# Global usage tracker
usage_tracker = UsageTracker()


def check_rate_limit(user_id: str) -> tuple[bool, Dict[str, Any]]:
    """Check if user is rate limited.

    Returns:
        tuple: (is_limited, usage_info)
    """
    is_limited = usage_tracker.is_rate_limited(user_id)
    usage_info = usage_tracker.get_usage_stats(user_id)
    return is_limited, usage_info


def record_api_request(user_id: str) -> None:
    """Record an API request for a user."""
    usage_tracker.record_request(user_id)
