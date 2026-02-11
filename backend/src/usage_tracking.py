"""Usage tracking for chat interactions.

This module tracks chat usage patterns, message metrics, and provides
analytics for understanding user behavior and system performance.
"""

import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from uuid import UUID, uuid4
from dataclasses import dataclass, field, asdict
from collections import defaultdict
import threading
import os


@dataclass
class ChatSession:
    """Represents a chat session."""

    session_id: str
    user_id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    message_count: int = 0
    total_tokens: int = 0
    tools_used: List[str] = field(default_factory=list)


@dataclass
class MessageRecord:
    """Record of a chat message."""

    message_id: str
    session_id: str
    user_id: str
    role: str
    content_length: int
    tokens_used: int
    response_time_ms: float
    tools_used: List[str]
    timestamp: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)


class UsageTracker:
    """Track chat usage and metrics."""

    def __init__(self, max_sessions: int = 10000):
        self._lock = threading.Lock()
        self._sessions: Dict[str, ChatSession] = {}
        self._messages: List[MessageRecord] = []
        self._tool_usage: Dict[str, int] = defaultdict(int)
        self._user_daily_usage: Dict[str, Dict[str, int]] = defaultdict(
            lambda: {
                "messages": 0,
                "tokens": 0,
                "sessions": 0,
            }
        )
        self._message_timing: List[float] = []
        self._max_sessions = max_sessions

    def start_session(self, user_id: str) -> str:
        """Start a new chat session."""
        session_id = str(uuid4())
        session = ChatSession(
            session_id=session_id,
            user_id=user_id,
            started_at=datetime.utcnow(),
        )

        with self._lock:
            self._sessions[session_id] = session
            self._user_daily_usage[user_id]["sessions"] += 1

            # Cleanup old sessions
            if len(self._sessions) > self._max_sessions:
                oldest = min(self._sessions.values(), key=lambda s: s.started_at)
                del self._sessions[oldest.session_id]

        return session_id

    def end_session(self, session_id: str) -> Optional[ChatSession]:
        """End a chat session."""
        with self._lock:
            if session_id in self._sessions:
                session = self._sessions[session_id]
                session.ended_at = datetime.utcnow()
                return session
        return None

    def record_message(
        self,
        session_id: str,
        user_id: str,
        role: str,
        content_length: int,
        tokens_used: int,
        response_time_ms: float,
        tools_used: List[str],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Record a chat message."""
        message_id = str(uuid4())
        record = MessageRecord(
            message_id=message_id,
            session_id=session_id,
            user_id=user_id,
            role=role,
            content_length=content_length,
            tokens_used=tokens_used,
            response_time_ms=response_time_ms,
            tools_used=tools_used,
            timestamp=datetime.utcnow(),
            metadata=metadata or {},
        )

        with self._lock:
            self._messages.append(record)

            # Update session stats
            if session_id in self._sessions:
                session = self._sessions[session_id]
                session.message_count += 1
                session.total_tokens += tokens_used

            # Update tool usage
            for tool in tools_used:
                self._tool_usage[tool] += 1

            # Update user daily usage
            today = datetime.utcnow().strftime("%Y-%m-%d")
            self._user_daily_usage[user_id]["messages"] += 1
            self._user_daily_usage[user_id]["tokens"] += tokens_used

            # Track timing
            self._message_timing.append(response_time_ms)

        return message_id

    def get_usage_summary(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get usage summary.

        Args:
            user_id: Optional user ID to filter results
        """
        with self._lock:
            now = datetime.utcnow()

            if user_id:
                user_usage = self._user_daily_usage.get(user_id, {})
                user_messages = [m for m in self._messages if m.user_id == user_id]
                user_sessions = [
                    s for s in self._sessions.values() if s.user_id == user_id
                ]

                recent_messages = [
                    m for m in user_messages if m.timestamp > now - timedelta(hours=24)
                ]
                avg_response_time = (
                    sum(m.response_time_ms for m in recent_messages)
                    / len(recent_messages)
                    if recent_messages
                    else 0
                )

                return {
                    "user_id": user_id,
                    "total_messages": len(user_messages),
                    "total_tokens": sum(m.tokens_used for m in user_messages),
                    "total_sessions": len(user_sessions),
                    "message_count_24h": len(recent_messages),
                    "avg_response_time_ms": avg_response_time,
                    "daily_usage": dict(self._user_daily_usage.get(user_id, {})),
                }

            # Overall stats
            recent_messages = [
                m for m in self._messages if m.timestamp > now - timedelta(hours=24)
            ]
            total_messages = len(self._messages)
            total_tokens = sum(m.tokens_used for m in self._messages)
            active_users = len(set(m.user_id for m in self._messages))

            avg_response_time = (
                sum(m.response_time_ms for m in recent_messages) / len(recent_messages)
                if recent_messages
                else 0
            )

            return {
                "total_messages": total_messages,
                "total_tokens": total_tokens,
                "active_users": active_users,
                "active_sessions": len(self._sessions),
                "message_count_24h": len(recent_messages),
                "avg_response_time_ms": avg_response_time,
                "p95_response_time_ms": self._percentile(self._message_timing, 95)
                if self._message_timing
                else 0,
                "tool_usage": dict(self._tool_usage),
                "unique_users_today": len(set(m.user_id for m in recent_messages)),
            }

    def get_tool_usage_stats(self) -> Dict[str, int]:
        """Get tool usage statistics."""
        with self._lock:
            return dict(self._tool_usage)

    def get_user_activity(self, user_id: str) -> List[Dict[str, Any]]:
        """Get recent activity for a user."""
        with self._lock:
            user_messages = [
                {
                    "message_id": m.message_id,
                    "role": m.role,
                    "content_length": m.content_length,
                    "tokens": m.tokens_used,
                    "response_time_ms": m.response_time_ms,
                    "tools": m.tools_used,
                    "timestamp": m.timestamp.isoformat(),
                }
                for m in self._messages
                if m.user_id == user_id
            ][-50:]  # Last 50 messages

            return user_messages

    def get_response_time_stats(self) -> Dict[str, float]:
        """Get response time statistics."""
        with self._lock:
            if not self._message_timing:
                return {"avg": 0, "p50": 0, "p95": 0, "p99": 0}

            sorted_times = sorted(self._message_timing)
            n = len(sorted_times)

            return {
                "avg": sum(sorted_times) / n,
                "p50": sorted_times[int(n * 0.50)],
                "p95": sorted_times[int(n * 0.95)],
                "p99": sorted_times[int(n * 0.99)],
            }

    @staticmethod
    def _percentile(data: List[float], percentile: int) -> float:
        """Calculate percentile of data."""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]


# Global usage tracker
usage_tracker = UsageTracker()


def track_chat_usage(
    session_id: str,
    user_id: str,
    role: str,
    content: str,
    response_time_ms: float,
    tools_used: List[str],
    tokens_used: int = 0,
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """Track a chat message.

    Args:
        session_id: Chat session ID
        user_id: User ID
        role: Message role (user/assistant)
        content: Message content
        response_time_ms: Response time in milliseconds
        tools_used: List of tools used
        tokens_used: Number of tokens used
        metadata: Additional metadata

    Returns:
        Message ID
    """
    return usage_tracker.record_message(
        session_id=session_id,
        user_id=user_id,
        role=role,
        content_length=len(content),
        tokens_used=tokens_used,
        response_time_ms=response_time_ms,
        tools_used=tools_used,
        metadata=metadata,
    )


def start_user_session(user_id: str) -> str:
    """Start a new session for a user."""
    return usage_tracker.start_session(user_id)


def end_user_session(session_id: str) -> Optional[ChatSession]:
    """End a user session."""
    return usage_tracker.end_session(session_id)
