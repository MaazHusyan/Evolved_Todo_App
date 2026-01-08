"""
Database connection setup for the todo application.
"""
from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
import os
from contextlib import asynccontextmanager

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional


# Get database URL from environment variables
original_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./todo_dev.db")  # Use SQLite for development

# Convert to asyncpg format if it's a PostgreSQL URL
if original_url.startswith("postgresql://"):
    # Replace with asyncpg driver
    converted_url = original_url.replace("postgresql://", "postgresql+asyncpg://")
    # Remove unsupported parameters for asyncpg
    if "channel_binding=" in converted_url or "sslmode=" in converted_url:
        import urllib.parse
        parsed = urllib.parse.urlparse(converted_url)
        query_params = urllib.parse.parse_qs(parsed.query)
        # Remove unsupported parameters
        query_params.pop('channel_binding', None)
        query_params.pop('sslmode', None)
        # Reconstruct URL without unsupported parameters
        new_query = urllib.parse.urlencode(query_params, doseq=True)
        DATABASE_URL = urllib.parse.urlunparse((
            parsed.scheme, parsed.netloc, parsed.path,
            parsed.params, new_query, parsed.fragment
        ))
    else:
        DATABASE_URL = converted_url
elif original_url.startswith("postgresql+asyncpg://"):
    # Remove unsupported parameters if present
    if "channel_binding=" in original_url or "sslmode=" in original_url:
        import urllib.parse
        parsed = urllib.parse.urlparse(original_url)
        query_params = urllib.parse.parse_qs(parsed.query)
        query_params.pop('channel_binding', None)
        query_params.pop('sslmode', None)
        new_query = urllib.parse.urlencode(query_params, doseq=True)
        DATABASE_URL = urllib.parse.urlunparse((
            parsed.scheme, parsed.netloc, parsed.path,
            parsed.params, new_query, parsed.fragment
        ))
    else:
        DATABASE_URL = original_url
else:
    DATABASE_URL = original_url


# Create async engine
engine: AsyncEngine = create_async_engine(DATABASE_URL)


# Create async session maker
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get async session
    """
    async with AsyncSessionLocal() as session:
        yield session


@asynccontextmanager
async def get_db_session():
    """
    Context manager for database sessions
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_db_and_tables():
    """
    Create database tables
    """
    from .models import SQLModel
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)