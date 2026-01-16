"""
Base model and database connection setup
"""
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from fastapi import Depends
import os


# Define Base class for models to inherit from
Base = SQLModel

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./todo_app.db")

# Ensure async driver is used for PostgreSQL
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    DATABASE_URL = DATABASE_URL.replace("sslmode=require", "ssl=require")

# Create the async engine
# Use different settings for SQLite vs PostgreSQL
if "sqlite" in DATABASE_URL:
    # SQLite-specific settings
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
        # SQLite doesn't support many connection pool settings
        poolclass=None
    )
else:
    # PostgreSQL-specific settings
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
        # Connection pooling settings for PostgreSQL/Neon
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True,
        pool_recycle=300
    )

async def create_db_and_tables():
    """Create database tables asynchronously"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

# Dependency for async database session
async def get_async_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session

def get_session_dep():
    return Depends(get_async_session)

SessionDep = Depends(get_async_session)