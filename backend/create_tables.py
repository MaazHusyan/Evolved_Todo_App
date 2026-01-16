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

async def create_tables():
    print("🚀 Initializing Database Schema...")

    engine = create_async_engine(DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        print("Creating Better Auth tables...")

        # User Table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS "user" (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
                image TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        """))

        # Session Table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS "session" (
                id TEXT PRIMARY KEY,
                "expiresAt" TIMESTAMP NOT NULL,
                "token" TEXT NOT NULL UNIQUE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "ipAddress" TEXT,
                "userAgent" TEXT,
                "userId" TEXT NOT NULL REFERENCES "user"(id)
            );
        """))

        # Account Table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS "account" (
                id TEXT PRIMARY KEY,
                "accountId" TEXT NOT NULL,
                "providerId" TEXT NOT NULL,
                "userId" TEXT NOT NULL REFERENCES "user"(id),
                "accessToken" TEXT,
                "refreshToken" TEXT,
                "accessTokenExpiresAt" TIMESTAMP,
                "refreshTokenExpiresAt" TIMESTAMP,
                scope TEXT,
                password TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        """))

        # Verification Table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS "verification" (
                id TEXT PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP,
                "updatedAt" TIMESTAMP
            );
        """))

        print("Creating Application tables...")

        # Task Table (Matches backend/src/models/task.py - keeping snake_case as backend prefers it)
        # Note: We need to reference "user"(id) which is fine.
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS "task" (
                id UUID PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                is_completed BOOLEAN DEFAULT FALSE,
                user_id TEXT NOT NULL REFERENCES "user"(id),
                due_date TIMESTAMP,
                priority TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        """))

    await engine.dispose()
    print("✅ All tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_tables())
