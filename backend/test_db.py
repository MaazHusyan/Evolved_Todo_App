import os
from src.models.base import engine
import asyncio


async def test_connection():
    print("✅ Testing database connection...")
    try:
        async with engine.begin() as conn:
            result = await conn.execute("SELECT 1")
            print("✅ Database connection successful!")
            print("📋 Database tables:")
            result = await conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
            tables = [row[0] for row in result]
            print("📋 Tables found:", tables)
    except Exception as e:
        print("❌ Database connection failed!")
        print("🐛 Error:", e)


asyncio.run(test_connection())
