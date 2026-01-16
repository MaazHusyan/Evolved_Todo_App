"""
Main application file for the Todo application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.tasks import router as tasks_router
from .models.base import create_db_and_tables
from .api.logging_config import log_info
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Todo API",
    description="REST API for multi-user todo application with authentication",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # In production, replace with specific frontend URL
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks_router)

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

@app.get("/migrate-schema")
async def migrate_schema():
    """Temporary endpoint to migrate database schema"""
    from .models.base import engine
    from sqlalchemy import text
    try:
        # Check dialect
        is_sqlite = engine.dialect.name == 'sqlite'

        async with engine.begin() as conn:
            if is_sqlite:
                # SQLite doesn't support IF NOT EXISTS in ADD COLUMN in all versions
                # and ignores timezone
                try:
                    await conn.execute(text("ALTER TABLE task ADD COLUMN start_date DATETIME;"))
                except Exception as e:
                    if "duplicate column name" in str(e).lower():
                        return {"status": "success", "message": "Column already exists"}
                    raise e
            else:
                # PostgreSQL syntax
                await conn.execute(text("ALTER TABLE task ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITHOUT TIME ZONE;"))

        return {"status": "success", "message": f"Schema migrated successfully (Dialect: {engine.dialect.name})"}
    except Exception as e:
        return {"status": "error", "message": str(e), "dialect": engine.dialect.name}

# For running with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
