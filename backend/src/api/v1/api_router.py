"""
API router for the todo application.
"""
from fastapi import APIRouter
from . import auth, todos


api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(todos.router, prefix="/todos", tags=["todos"])