import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def verify_connection():
    # Ensure async driver is used
    db_url = DATABASE_URL
    if db_url and db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        db_url = db_url.replace("sslmode=require", "ssl=require")

    print(f"Testing connection to: {db_url.split('@')[1] if '@' in db_url else 'LOCAL/UNKNOWN'}")

    try:
        # Create engine (same logic as base.py roughly)
        engine = create_async_engine(db_url, echo=False)

        async with engine.begin() as conn:
            # Run a simple query
            result = await conn.execute(text("SELECT 1"))
            print("✅ Connection successful! SELECT 1 returned:", result.scalar())

            # Check for tables
            result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = result.fetchall()
            print("📊 Found tables:", [t[0] for t in tables])

        await engine.dispose()
        print("Backend is successfully connected to Neon PostgreSQL.")

    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        # Print more detail if available
        if hasattr(e, 'orig'):
            print(f"Original error: {e.orig}")

if __name__ == "__main__":
    if not DATABASE_URL:
        print("❌ DATABASE_URL not found in environment")
    else:
        asyncio.run(verify_connection())
