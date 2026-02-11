import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.pool import StaticPool
from sqlmodel.ext.asyncio.session import AsyncSession
from unittest.mock import patch, AsyncMock
import sys
from pathlib import Path
import os

# Add the project root to sys.path to resolve absolute imports from 'src'
project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.main import app
from src.models.base import get_async_session, SessionDep, create_db_and_tables
from src.auth.utils import create_token, verify_token


@pytest_asyncio.fixture(scope="function")
async def engine():
    # Create an in-memory SQLite database for testing
    # Use sqlite+aiosqlite for async engine
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    yield engine

    # Cleanup
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(engine):
    # Mock the startup event to prevent actual database connection
    original_on_event = app.router.on_event

    async def mock_startup():
        pass  # Don't run the actual startup logic

    app.router.on_event("startup")(mock_startup)

    async def _get_session_override():
        async with AsyncSession(engine) as session:
            yield session

    app.dependency_overrides[get_async_session] = _get_session_override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

    # Restore original on_event
    app.router.on_event = original_on_event


@pytest.mark.asyncio
async def test_register_endpoint(client):
    """Test user registration endpoint"""
    registration_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword123",
    }

    response = client.post("/api/register", json=registration_data)
    assert response.status_code == 200

    data = response.json()
    assert "id" in data
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


@pytest.mark.asyncio
async def test_login_endpoint_success(client):
    """Test successful login"""
    # First register a user
    registration_data = {
        "email": "login_test@example.com",
        "username": "logintestuser",
        "password": "testpassword123",
    }

    register_response = client.post("/api/register", json=registration_data)
    assert register_response.status_code == 200

    # Now try to login
    login_data = {"email": "login_test@example.com", "password": "testpassword123"}

    response = client.post("/api/login", json=login_data)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data


@pytest.mark.asyncio
async def test_login_endpoint_invalid_credentials(client):
    """Test login with invalid credentials"""
    login_data = {"email": "nonexistent@example.com", "password": "wrongpassword"}

    response = client.post("/api/login", json=login_data)
    assert response.status_code == 401

    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_logout_endpoint(client):
    """Test logout endpoint"""
    response = client.post("/api/logout")
    assert response.status_code == 200

    data = response.json()
    assert data["message"] == "Logged out successfully"


@pytest.mark.asyncio
async def test_protected_route_without_token(client):
    """Test accessing protected route without token"""
    # This should fail since we need authentication
    user_id = "123e4567-e89b-12d3-a456-426614174000"  # Example UUID
    response = client.get(f"/api/users/{user_id}")
    assert response.status_code == 401  # Unauthorized


def test_token_verification_utility():
    """Test the token utility functions"""
    payload = {"sub": "123e4567-e89b-12d3-a456-426614174000"}

    # Create a token
    token = create_token(payload["sub"])
    assert token is not None

    # Verify the token
    decoded_payload = verify_token(token)
    assert decoded_payload is not None
    assert decoded_payload["sub"] == payload["sub"]
