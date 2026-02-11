import pytest
import os
from unittest.mock import patch, AsyncMock, MagicMock
import sys
from pathlib import Path

# Add the project root to sys.path to resolve absolute imports from 'src'
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Set the database URL to use aiosqlite for testing
os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///:memory:'

from fastapi.testclient import TestClient
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
import asyncio
from contextlib import asynccontextmanager

# Import app components after setting environment
from src.main import app as original_app
from src.models.base import get_async_session


def create_test_app():
    """Create a test version of the app with mocked database"""
    # Create in-memory SQLite engine
    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False  # Turn off echo for tests
    )

    # Override the startup event to prevent database connection
    @asynccontextmanager
    async def lifespan_override(app):
        # Create tables in memory db
        async with test_engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        yield
        # Cleanup happens automatically with in-memory db

    test_app = original_app
    test_app.router.lifespan_context = lifespan_override

    # Create a dependency override for session
    async def override_get_async_session():
        async with AsyncSession(test_engine) as session:
            yield session

    test_app.dependency_overrides[get_async_session] = override_get_async_session

    return test_app


def test_login_flow():
    """Integration test for the login flow"""
    # Create a test app
    test_app = create_test_app()

    with TestClient(test_app) as client:
        # Register a new user
        registration_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "testpassword123"
        }

        register_response = client.post("/api/auth/register", json=registration_data)
        assert register_response.status_code == 200

        # Verify registration worked
        register_data = register_response.json()
        assert "token" in register_data
        assert "user" in register_data
        assert register_data["user"]["email"] == "test@example.com"

        # Now try to login with the registered user
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }

        login_response = client.post("/api/auth/login", json=login_data)
        assert login_response.status_code == 200

        login_result = login_response.json()
        assert "token" in login_result
        assert "user" in login_result
        assert login_result["user"]["email"] == "test@example.com"


def test_failed_login():
    """Test login with incorrect credentials"""
    test_app = create_test_app()

    with TestClient(test_app) as client:
        # Try to login with non-existent user
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }

        login_response = client.post("/api/auth/login", json=login_data)
        assert login_response.status_code == 401

        error_data = login_response.json()
        assert "detail" in error_data


def test_logout():
    """Test session endpoint (logout functionality)"""
    test_app = create_test_app()

    with TestClient(test_app) as client:
        # The current implementation uses Better Auth's session endpoint
        session_response = client.get("/api/auth/session")
        assert session_response.status_code == 200

        session_data = session_response.json()
        assert "session" in session_data
        assert "user" in session_data