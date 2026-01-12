"""
Migration runner for the Todo application
"""
import asyncio
from sqlmodel import SQLModel
from ..base import engine

async def create_db_and_tables():
    """Create all database tables"""
    print("Creating database tables...")
    async with engine.begin() as conn:
        # Create all tables defined in SQLModel metadata
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_db_and_tables())