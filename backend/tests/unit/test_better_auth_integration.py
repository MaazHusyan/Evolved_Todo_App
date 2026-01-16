import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.pool import StaticPool
from sqlmodel.ext.asyncio.session import AsyncSession
import jwt
from pathlib import Path
import sys
import os

# Add src to path
project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.main import app
from src.models.base import get_async_session, SessionDep
from src.auth.utils import verify_token
from src.auth.config import ALGORITHM, BETTER_AUTH_SECRET

@pytest_asyncio.fixture(scope="function")
async def engine():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def client(engine):
    async def _get_session_override():
        async with AsyncSession(engine) as session:
            yield session

    app.dependency_overrides[get_async_session] = _get_session_override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

def generate_test_token(user_id: str):
    """Generate a test token signed with the secret"""
    payload = {"sub": user_id}
    return jwt.encode(payload, BETTER_AUTH_SECRET, algorithm=ALGORITHM)

def test_verify_token_logic():
    """Test that the verify_token function correctly decodes a valid token"""
    user_id = "test_user_123"
    token = generate_test_token(user_id)

    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == user_id

def test_verify_token_invalid():
    """Test that verify_token rejects invalid tokens"""
    invalid_token = "invalid.token.structure"
    assert verify_token(invalid_token) is None

    # Test token signed with wrong secret
    wrong_token = jwt.encode({"sub": "user"}, "wrong_secret", algorithm=ALGORITHM)
    assert verify_token(wrong_token) is None

@pytest.mark.asyncio
async def test_get_tasks_unauthorized(client):
    """Test accessing tasks without token fails"""
    response = client.get("/api/v1/tasks")
    assert response.status_code == 403 or response.status_code == 401

@pytest.mark.asyncio
async def test_get_tasks_authorized(client):
    """Test accessing tasks with valid token succeeds"""
    user_id = "test_user_456"
    token = generate_test_token(user_id)

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/tasks", headers=headers)

    # Should return 200 OK with empty list (since DB is empty)
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_create_task(client):
    """Test creating a task with valid token"""
    user_id = "test_user_789"
    token = generate_test_token(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    task_data = {"title": "New Integration Task"}

    response = client.post("/api/v1/tasks", json=task_data, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Integration Task"
    assert data["user_id"] == user_id
