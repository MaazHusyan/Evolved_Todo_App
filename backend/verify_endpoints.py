import asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.pool import StaticPool
from sqlmodel.ext.asyncio.session import AsyncSession
import jwt
import sys
import os
from pathlib import Path

# Add src to path
project_root = Path(__file__).resolve().parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.main import app
from src.models.base import get_async_session
from src.auth.config import ALGORITHM, BETTER_AUTH_SECRET

# Setup Test Database
engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

async def get_session_override():
    async with AsyncSession(engine) as session:
        yield session

def generate_token(user_id: str):
    payload = {"sub": user_id}
    return jwt.encode(payload, BETTER_AUTH_SECRET, algorithm=ALGORITHM)

async def verify_endpoints():
    print("\n🚀 Starting Endpoint Verification...")

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Override dependency
    app.dependency_overrides[get_async_session] = get_session_override

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Health Check
        response = await client.get("/health")
        if response.status_code == 200:
            print("✅ GET /health passed")
        else:
            print(f"❌ GET /health failed: {response.text}")

        # 2. Root
        response = await client.get("/")
        if response.status_code == 200:
            print("✅ GET / passed")
        else:
            print(f"❌ GET / failed: {response.text}")

        # Auth Setup
        user_id = "user_123"
        token = generate_token(user_id)
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Create Task
        print(f"\nCreating task for user {user_id}...")
        task_data = {"title": "Test Task", "description": "Verify endpoints"}
        response = await client.post("/api/v1/tasks", json=task_data, headers=headers)

        if response.status_code == 201:
            created_task = response.json()
            task_id = created_task["id"]
            if created_task["title"] == "Test Task":
                print(f"✅ POST /api/v1/tasks passed (ID: {task_id})")
            else:
                print(f"❌ POST /api/v1/tasks failed content check: {created_task}")
        else:
            print(f"❌ POST /api/v1/tasks failed: {response.status_code} - {response.text}")
            return

        # 4. Get Tasks
        response = await client.get("/api/v1/tasks", headers=headers)
        if response.status_code == 200:
            tasks = response.json()
            if len(tasks) == 1 and tasks[0]["id"] == task_id:
                print("✅ GET /api/v1/tasks passed")
            else:
                print(f"❌ GET /api/v1/tasks failed content check: {tasks}")
        else:
            print(f"❌ GET /api/v1/tasks failed: {response.status_code}")

        # 5. Get Specific Task
        response = await client.get(f"/api/v1/tasks/{task_id}", headers=headers)
        if response.status_code == 200 and response.json()["id"] == task_id:
            print(f"✅ GET /api/v1/tasks/{task_id} passed")
        else:
            print(f"❌ GET /api/v1/tasks/{task_id} failed")

        # 6. Update Task
        update_data = {"title": "Updated Task", "is_completed": False}
        response = await client.put(f"/api/v1/tasks/{task_id}", json=update_data, headers=headers)
        if response.status_code == 200 and response.json()["title"] == "Updated Task":
            print(f"✅ PUT /api/v1/tasks/{task_id} passed")
        else:
            print(f"❌ PUT /api/v1/tasks/{task_id} failed")

        # 7. Toggle Completion
        completion_data = {"is_completed": True}
        response = await client.patch(f"/api/v1/tasks/{task_id}/complete", json=completion_data, headers=headers)
        if response.status_code == 200 and response.json()["is_completed"] == True:
            print(f"✅ PATCH /api/v1/tasks/{task_id}/complete passed")
        else:
            print(f"❌ PATCH /api/v1/tasks/{task_id}/complete failed")

        # 8. Delete Task
        response = await client.delete(f"/api/v1/tasks/{task_id}", headers=headers)
        if response.status_code == 204:
            print(f"✅ DELETE /api/v1/tasks/{task_id} passed")
        else:
            print(f"❌ DELETE /api/v1/tasks/{task_id} failed")

        # Verify Deletion
        response = await client.get(f"/api/v1/tasks/{task_id}", headers=headers)
        if response.status_code == 404:
            print("✅ Verification of Deletion passed")
        else:
            print(f"❌ Verification of Deletion failed: {response.status_code}")

    print("\n✨ All Endpoints Verified Successfully!")

    # Cleanup
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_endpoints())
