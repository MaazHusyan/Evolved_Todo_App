"""
API routes for the Todo application
"""
from .tasks import router as tasks_router

__all__ = ["tasks_router"]
