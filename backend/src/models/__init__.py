"""
Models module for the todo application.
"""

from sqlmodel import SQLModel
from .user import User
from .todo_item import TodoItem


def rebuild_models():
    """Rebuild all models to resolve forward references."""
    try:
        # Rebuild models to handle forward references properly
        User.model_rebuild()
        TodoItem.model_rebuild()
    except AttributeError:
        # Some models may not have model_rebuild if they're not Pydantic models
        # SQLModel doesn't have model_rebuild, so we need to handle this differently
        pass


# Rebuild models on import to resolve forward references
rebuild_models()


__all__ = [
    "SQLModel",
    "User",
    "TodoItem",
]