import pytest
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.pool import StaticPool
from unittest.mock import AsyncMock, MagicMock
import uuid
from datetime import datetime
import sys
from pathlib import Path

# Add the project root to sys.path to resolve absolute imports from 'src'
project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.services.user_service import UserService
from src.models.user import User, UserRegistration
from src.auth.utils import hash_password


@pytest.fixture
def mock_session():
    """Create a mock database session"""
    session = AsyncMock(spec=AsyncSession)
    session.exec = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    return session


@pytest.mark.asyncio
async def test_create_user(mock_session):
    """Test creating a user"""
    user_service = UserService(mock_session)

    user_registration = UserRegistration(
        email="test@example.com",
        username="testuser",
        password="testpassword"
    )

    # Call the method
    result = await user_service.create_user(user_registration)

    # Assertions
    assert result.email == "test@example.com"
    assert result.name == "testuser"  # username maps to name field
    # Check that the password was hashed
    assert result.password_hash != "testpassword"

    # Verify session methods were called
    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()
    mock_session.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_get_user_by_email(mock_session):
    """Test getting a user by email"""
    user_service = UserService(mock_session)

    # Create a mock user
    mock_user = User(
        id=str(uuid.uuid4()),
        email="test@example.com",
        name="testuser",
        password_hash=hash_password("testpassword"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Mock the exec method to return the user
    mock_exec_result = MagicMock()
    mock_exec_result.first.return_value = mock_user
    mock_session.exec.return_value = mock_exec_result

    # Call the method
    result = await user_service.get_user_by_email("test@example.com")

    # Assertions
    assert result is not None
    assert result.email == "test@example.com"


@pytest.mark.asyncio
async def test_get_user_by_username(mock_session):
    """Test getting a user by username"""
    user_service = UserService(mock_session)

    # Create a mock user
    mock_user = User(
        id=str(uuid.uuid4()),
        email="test@example.com",
        name="testuser",
        password_hash=hash_password("testpassword"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Mock the exec method to return the user
    mock_exec_result = MagicMock()
    mock_exec_result.first.return_value = mock_user
    mock_session.exec.return_value = mock_exec_result

    # Call the method
    result = await user_service.get_user_by_username("testuser")

    # Assertions
    assert result is not None
    assert result.name == "testuser"


@pytest.mark.asyncio
async def test_verify_password():
    """Test password verification"""
    user_service = UserService(None)  # Session not needed for this method

    plain_password = "testpassword"
    hashed_password = hash_password(plain_password)

    # Correct password should return True
    assert user_service.verify_password(plain_password, hashed_password) is True

    # Wrong password should return False
    assert user_service.verify_password("wrongpassword", hashed_password) is False


@pytest.mark.asyncio
async def test_get_user_by_id(mock_session):
    """Test getting a user by ID"""
    user_service = UserService(mock_session)

    user_id = str(uuid.uuid4())

    # Create a mock user
    mock_user = User(
        id=user_id,
        email="test@example.com",
        name="testuser",
        password_hash=hash_password("testpassword"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Mock the exec method to return the user
    mock_exec_result = MagicMock()
    mock_exec_result.first.return_value = mock_user
    mock_session.exec.return_value = mock_exec_result

    # Call the method
    result = await user_service.get_user_by_id(user_id)

    # Assertions
    assert result is not None
    assert result.id == user_id