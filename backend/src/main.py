"""
Main application entry point for the todo application.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlmodel import SQLModel
from .database import engine
from .api.v1.api_router import api_router
from .exceptions.handlers import (
    TodoException,
    todo_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from .utils.responses import handle_error
import os
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup and shutdown events.
    """
    # Startup
    logger.info("Starting up the application...")
    try:
        # Create database tables
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down the application...")
    await engine.dispose()


# Create FastAPI app with lifespan
app = FastAPI(
    title="Todo Application API",
    description="A multi-user todo application with authentication and authorization",
    version="1.0.0",
    lifespan=lifespan
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost,http://localhost:3000,http://localhost:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Expose authorization header to frontend
    expose_headers=["Access-Control-Allow-Origin"]
)


# Include API routes
app.include_router(api_router, prefix="/api/v1")


# Register exception handlers
app.exception_handler(TodoException)(todo_exception_handler)
app.exception_handler(RequestValidationError)(validation_exception_handler)


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the application is running.
    """
    return {"status": "healthy", "message": "Todo application is running"}


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint for the application.
    """
    return {"message": "Welcome to the Todo Application API", "version": "1.0.0"}


# Catch-all for unhandled exceptions
@app.middleware("http")
async def exception_handler(request: Request, call_next):
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(f"Unhandled exception: {e}")
        return handle_error(str(e), 500)
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True
    )