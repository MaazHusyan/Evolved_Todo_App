"""
Main application file for the Todo application
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .api.tasks import router as tasks_router
from .routes.chat import chat_router
from .models.base import create_db_and_tables
from .api.logging_config import log_info
import os
import time
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

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

# Mount MCP server for AI tool integration
from .todo_mcp.server import mcp_server
from .todo_mcp.tools import register_tools

# Register tools with MCP server
register_tools(mcp_server.get_server())


# Mount MCP SSE endpoint
@app.get("/mcp/sse")
async def mcp_sse_endpoint(request: Request):
    """MCP Server-Sent Events endpoint for AI tool communication."""
    from mcp.server.sse import SseServerTransport
    from starlette.responses import StreamingResponse

    transport = SseServerTransport("/mcp/messages/")

    async def message_handler(message):
        """Handle incoming MCP messages."""
        return await mcp_server.get_server().handle_message(message)

    # Return SSE stream
    return StreamingResponse(
        transport.connect_sse(request.scope, request.receive, request.send),
        media_type="text/event-stream",
    )


@app.get("/")
async def root():
    """Root endpoint for health check"""
    return {"message": "Todo API is running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "todo-api"}


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
