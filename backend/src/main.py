"""
Main application file for the Todo application
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from .api.tasks import router as tasks_router
from .routes.chat import chat_router
from .models.base import create_db_and_tables
from .api.logging_config import log_info
import os
import time
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Import professional enhancements
from .middleware.error_handler import ErrorHandlerMiddleware
from .core.metrics import MetricsMiddleware, get_metrics, get_metrics_content_type
from .api.health import router as health_router
from .core.logging import configure_logging

# Load environment variables
load_dotenv()

# Configure structured logging
configure_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    json_logs=os.getenv("JSON_LOGS", "true").lower() == "true"
)

# Get allowed origins from environment
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    await create_db_and_tables()
    log_info("Application started and database initialized")
    yield
    # Shutdown (if needed)
    log_info("Application shutting down")


# Create FastAPI app
app = FastAPI(
    title="Todo API",
    description="REST API for multi-user todo application with authentication and AI chat",
    version="3.0.0",
    lifespan=lifespan,
)

# Add professional middleware (order matters!)
# 1. Error handler should be first to catch all exceptions
app.add_middleware(ErrorHandlerMiddleware)

# 2. Metrics middleware to track all requests
app.add_middleware(MetricsMiddleware)


# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains"
    )
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    return response


# Add performance monitoring middleware
@app.middleware("http")
async def add_performance_monitoring(request: Request, call_next):
    """Monitor request performance and log slow requests."""
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    # Log slow requests (>3 seconds)
    if process_time > 3.0:
        log_info(
            f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s"
        )

    return response


# Add CORS middleware with restricted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-User-Id"],
    expose_headers=["X-Process-Time"],
    max_age=600,  # Cache preflight for 10 minutes
)

# Include routers
from .api.auth import router as auth_router

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(chat_router)
app.include_router(health_router)  # Professional health checks

# Mount MCP server for AI tool integration
from .todo_mcp.server import mcp_server
from .todo_mcp.tools import register_tools

# Register tools with MCP server
register_tools(mcp_server.get_server())


# Mount MCP SSE endpoint using Starlette's mount
from starlette.applications import Starlette
from starlette.routing import Mount, Route
from mcp.server.sse import SseServerTransport

# Create SSE transport for the MCP server
sse_transport = SseServerTransport("/messages")

async def handle_sse(request: Request):
    """Handle SSE requests for MCP server."""
    from starlette.responses import StreamingResponse
    import json

    # Get the MCP server instance
    server = mcp_server.get_server()

    async def event_generator():
        """Generate SSE events."""
        # Send initial connection message
        yield f"data: {json.dumps({'type': 'connection', 'status': 'connected'})}\n\n"

        # Keep connection alive
        import asyncio
        while True:
            await asyncio.sleep(15)
            yield ": keepalive\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

# Mount the SSE endpoint
app.add_api_route("/mcp/sse", handle_sse, methods=["GET", "POST"])


@app.get("/")
async def root():
    """Root endpoint for health check"""
    return {"message": "Todo API is running"}


@app.get("/health")
async def health_check():
    """Health check endpoint (legacy - use /health/live instead)"""
    return {"status": "healthy", "service": "todo-api"}


@app.get("/metrics")
async def metrics_endpoint():
    """Prometheus metrics endpoint for monitoring."""
    return Response(
        content=get_metrics(),
        media_type=get_metrics_content_type()
    )


@app.get("/migrate-schema")
async def migrate_schema():
    """Temporary endpoint to migrate database schema"""
    from .models.base import engine
    from sqlalchemy import text

    try:
        # Check dialect
        is_sqlite = engine.dialect.name == "sqlite"

        async with engine.begin() as conn:
            if is_sqlite:
                # SQLite doesn't support IF NOT EXISTS in ADD COLUMN in all versions
                # and ignores timezone
                try:
                    await conn.execute(
                        text("ALTER TABLE task ADD COLUMN start_date DATETIME;")
                    )
                except Exception as e:
                    if "duplicate column name" in str(e).lower():
                        return {"status": "success", "message": "Column already exists"}
                    raise e
            else:
                # PostgreSQL syntax
                await conn.execute(
                    text(
                        "ALTER TABLE task ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITHOUT TIME ZONE;"
                    )
                )

        return {
            "status": "success",
            "message": f"Schema migrated successfully (Dialect: {engine.dialect.name})",
        }
    except Exception as e:
        return {"status": "error", "message": str(e), "dialect": engine.dialect.name}


# For running with uvicorn
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
