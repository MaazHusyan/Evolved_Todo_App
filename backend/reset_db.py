import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fix connection string for asyncpg
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    DATABASE_URL = DATABASE_URL.replace("sslmode=require", "ssl=require")

async def reset_db():
    print("🚀 Resetting Database...")

    engine = create_async_engine(DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        # Drop all tables
        print("Dropping tables...")
        await conn.execute(text('DROP TABLE IF EXISTS "verification" CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS "account" CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS "session" CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS "task" CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS "user" CASCADE'))

    await engine.dispose()
    print("✅ Database reset complete.")

if __name__ == "__main__":
    asyncio.run(reset_db())
