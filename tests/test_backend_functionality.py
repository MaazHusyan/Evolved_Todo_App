import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from backend.src.models.task import Task, TaskBase
from backend.src.services.task_service import TaskService


# Test the TaskService directly since API testing with mocked dependencies is complex
@pytest.mark.asyncio
async def test_task_service_create_task():
    """Test TaskService create_task method"""
    mock_session = AsyncMock(spec=AsyncSession)
    service = TaskService(mock_session)

    # user_id must be a string, not UUID
    task_data = TaskBase(
        title="Test Task",
        description="Test Description",
        user_id=str(uuid4()),
        due_date=None,
        priority="medium",
    )

    with (
        patch.object(mock_session, "add"),
        patch.object(mock_session, "commit"),
        patch.object(mock_session, "refresh"),
    ):
        result = await service.create_task(task_data)
        assert hasattr(result, "title")
        assert result.title == "Test Task"


@pytest.mark.asyncio
async def test_task_service_get_task_by_id():
    """Test TaskService get_task_by_id method"""
    mock_session = AsyncMock(spec=AsyncSession)
    service = TaskService(mock_session)

    task_id = uuid4()
    user_id = str(uuid4())  # Convert to string

    # Mock the exec method on the session
    mock_exec_result = MagicMock()
    mock_exec_result.first.return_value = None
    mock_session.exec = AsyncMock(return_value=mock_exec_result)

    result = await service.get_task_by_id(task_id, user_id)
    assert result is None


@pytest.mark.asyncio
async def test_task_service_get_tasks_by_user():
    """Test TaskService get_tasks_by_user method"""
    mock_session = AsyncMock(spec=AsyncSession)
    service = TaskService(mock_session)

    user_id = str(uuid4())  # Convert to string

    # Mock the exec method on the session
    mock_exec_result = MagicMock()
    mock_exec_result.all.return_value = []
    mock_session.exec = AsyncMock(return_value=mock_exec_result)

    result = await service.get_tasks_by_user(user_id)
    assert result == []


@pytest.mark.asyncio
async def test_task_service_update_task():
    """Test TaskService update_task method"""
    mock_session = AsyncMock(spec=AsyncSession)
    service = TaskService(mock_session)

    task_id = uuid4()
    user_id = str(uuid4())  # Convert to string
    task_data = {"title": "Updated Title"}

    # Mock a task object
    mock_task = MagicMock()
    mock_task.id = task_id
    mock_task.title = "Original Title"

    # Mock get_task_by_id to return the mock task
    with (
        patch.object(service, "get_task_by_id", return_value=mock_task),
        patch.object(mock_session, "add"),
        patch.object(mock_session, "commit"),
        patch.object(mock_session, "refresh"),
    ):
        result = await service.update_task(task_id, user_id, task_data)
        assert result is not None
        assert result.title == "Updated Title"


@pytest.mark.asyncio
async def test_task_service_delete_task():
    """Test TaskService delete_task method"""
    mock_session = AsyncMock(spec=AsyncSession)
    service = TaskService(mock_session)

    task_id = uuid4()
    user_id = str(uuid4())  # Convert to string

    # Mock a task object
    mock_task = MagicMock()
    mock_task.id = task_id

    # Mock get_task_by_id to return the mock task
    with (
        patch.object(service, "get_task_by_id", return_value=mock_task),
        patch.object(mock_session, "delete"),
        patch.object(mock_session, "commit"),
    ):
        result = await service.delete_task(task_id, user_id)
        assert result is True


@pytest.mark.asyncio
async def test_task_service_update_task_completion():
    """Test TaskService update_task_completion method"""
    mock_session = AsyncMock(spec=AsyncSession)
    service = TaskService(mock_session)

    task_id = uuid4()
    user_id = str(uuid4())  # Convert to string

    # Mock a task object
    mock_task = MagicMock()
    mock_task.id = task_id
    mock_task.is_completed = False

    # Mock get_task_by_id to return the mock task
    with (
        patch.object(service, "get_task_by_id", return_value=mock_task),
        patch.object(mock_session, "add"),
        patch.object(mock_session, "commit"),
        patch.object(mock_session, "refresh"),
    ):
        result = await service.update_task_completion(task_id, user_id, True)
        assert result is not None
        assert result.is_completed is True


@pytest.mark.asyncio
async def test_task_service_get_completed_tasks_by_user():
    """Test TaskService get_completed_tasks_by_user method"""
    mock_session = AsyncMock(spec=AsyncSession)
    service = TaskService(mock_session)

    user_id = str(uuid4())  # Convert to string

    # Mock the exec method on the session
    mock_exec_result = MagicMock()
    mock_exec_result.all.return_value = []
    mock_session.exec = AsyncMock(return_value=mock_exec_result)

    result = await service.get_completed_tasks_by_user(user_id)
    assert result == []


@pytest.mark.asyncio
async def test_task_service_get_pending_tasks_by_user():
    """Test TaskService get_pending_tasks_by_user method"""
    mock_session = AsyncMock(spec=AsyncSession)
    service = TaskService(mock_session)

    user_id = str(uuid4())  # Convert to string

    # Mock the exec method on the session
    mock_exec_result = MagicMock()
    mock_exec_result.all.return_value = []
    mock_session.exec = AsyncMock(return_value=mock_exec_result)

    result = await service.get_pending_tasks_by_user(user_id)
    assert result == []


# Additional tests for authentication and utility functions
def test_verify_password_functionality():
    """Test password hashing and verification utilities"""
    from backend.src.auth.utils import hash_password, verify_password

    plain_password = "testpass123"  # Shorter password to avoid bcrypt length issue
    hashed = hash_password(plain_password)

    # Verify the password matches the hash
    assert verify_password(plain_password, hashed) is True
    # Verify wrong password doesn't match
    assert verify_password("wrongpassword", hashed) is False


def test_jwt_token_creation_and_verification():
    """Test JWT token creation and verification"""
    from backend.src.auth.utils import create_token, verify_token
    import os

    # Ensure SECRET_KEY is available
    os.environ.setdefault("BETTER_AUTH_SECRET", "test-secret-key-for-testing")

    test_user_id = str(uuid4())

    # Create token
    token = create_token(test_user_id, expires_delta=timedelta(minutes=30))

    # Verify token
    decoded_payload = verify_token(token)
    assert decoded_payload is not None
    assert decoded_payload["sub"] == test_user_id

    # Test invalid token
    invalid_token = "invalid.token.here"
    assert verify_token(invalid_token) is None
