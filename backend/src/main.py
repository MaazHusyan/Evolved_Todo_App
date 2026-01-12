"""
Main application file for the Todo application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.tasks import router as tasks_router
from .api.users import router as users_router
from .models.base import create_db_and_tables
from .api.logging_config import log_info
import asyncio

# Create FastAPI app
app = FastAPI(
    title="Todo API",
    description="REST API for multi-user todo application with authentication",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks_router)
app.include_router(users_router)

@app.on_event("startup")
async def on_startup():
    """Initialize database tables on startup"""
    await create_db_and_tables()
    log_info("Application started and database initialized")

@app.get("/")
async def root():
    """Root endpoint for health check"""
    return {"message": "Todo API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "todo-api"}

# For running with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)