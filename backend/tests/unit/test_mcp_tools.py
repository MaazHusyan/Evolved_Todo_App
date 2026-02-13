"""
Unit tests for MCP tools.

Tests all MCP tool implementations including:
- create_task
- list_tasks
- update_task
- delete_task
"""

import pytest
import pytest_asyncio
from uuid import uuid4, UUID
from datetime import datetime, timedelta
from src.todo_mcp.tools import (
    _create_task,
    _list_tasks,
    _update_task,
    _delete_task,
)
from src.models import Task
from src.models.base import engine
from sqlmodel.ext.asyncio.session import AsyncSession


@pytest_asyncio.fixture
async def test_user_id():
    """Fixture providing a test user ID."""
    return uuid4()


@pytest_asyncio.fixture
async def test_task(test_user_id):
    """Fixture creating a test task in the database."""
    async with AsyncSession(engine) as session:
        task = Task(
            user_id=test_user_id,
            title="Test Task",
            description="Test Description",
            priority="medium",
            tags=["test"],
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return task


class TestCreateTask:
    """Tests for create_task MCP tool."""

    @pytest.mark.asyncio
    async def test_create_task_success(self, test_user_id):
        """Test successful task creation."""
        args = {
            "user_id": str(test_user_id),
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "priority": "high",
            "tags": ["shopping", "urgent"],
        }

        result = await _create_task(args)

        assert len(result) == 1
        assert "Task created successfully" in result[0].text
        assert "Buy groceries" in result[0].text

    @pytest.mark.asyncio
    async def test_create_task_with_due_date(self, test_user_id):
        """Test task creation with due date."""
        tomorrow = (datetime.now() + timedelta(days=1)).date().isoformat()
        args = {
            "user_id": str(test_user_id),
            "title": "Submit report",
            "due_date": tomorrow,
        }

        result = await _create_task(args)

        assert len(result) == 1
        assert "Task created successfully" in result[0].text

    @pytest.mark.asyncio
    async def test_create_task_missing_title(self, test_user_id):
        """Test task creation fails without title."""
        args = {"user_id": str(test_user_id), "title": ""}

        result = await _create_task(args)

        assert len(result) == 1
        assert "title cannot be empty" in result[0].text.lower()

    @pytest.mark.asyncio
    async def test_create_task_invalid_user_id(self):
        """Test task creation fails with invalid user ID."""
        args = {"user_id": "invalid-uuid", "title": "Test Task"}

        result = await _create_task(args)

        assert len(result) == 1
        assert "invalid user id" in result[0].text.lower()

    @pytest.mark.asyncio
    async def test_create_task_invalid_date_format(self, test_user_id):
        """Test task creation fails with invalid date format."""
        args = {
            "user_id": str(test_user_id),
            "title": "Test Task",
            "due_date": "invalid-date",
        }

        result = await _create_task(args)

        assert len(result) == 1
        assert "invalid date format" in result[0].text.lower()


class TestListTasks:
    """Tests for list_tasks MCP tool."""

    @pytest.mark.asyncio
    async def test_list_tasks_success(self, test_user_id, test_task):
        """Test successful task listing."""
        args = {"user_id": str(test_user_id)}

        result = await _list_tasks(args)

        assert len(result) == 1
        assert "Found" in result[0].text
        assert "Test Task" in result[0].text

    @pytest.mark.asyncio
    async def test_list_tasks_empty(self, test_user_id):
        """Test listing tasks when none exist."""
        args = {"user_id": str(test_user_id)}

        result = await _list_tasks(args)

        assert len(result) == 1
        assert "No tasks found" in result[0].text

    @pytest.mark.asyncio
    async def test_list_tasks_filter_by_status(self, test_user_id, test_task):
        """Test filtering tasks by status."""
        args = {"user_id": str(test_user_id), "status": "pending"}

        result = await _list_tasks(args)

        assert len(result) == 1
        assert "[pending]" in result[0].text

    @pytest.mark.asyncio
    async def test_list_tasks_filter_by_priority(self, test_user_id, test_task):
        """Test filtering tasks by priority."""
        args = {"user_id": str(test_user_id), "priority": "medium"}

        result = await _list_tasks(args)

        assert len(result) == 1
        assert "Test Task" in result[0].text

    @pytest.mark.asyncio
    async def test_list_tasks_invalid_user_id(self):
        """Test listing tasks fails with invalid user ID."""
        args = {"user_id": "invalid-uuid"}

        result = await _list_tasks(args)

        assert len(result) == 1
        assert "invalid user id" in result[0].text.lower()

    @pytest.mark.asyncio
    async def test_list_tasks_with_limit(self, test_user_id, test_task):
        """Test listing tasks with limit."""
        args = {"user_id": str(test_user_id), "limit": 10}

        result = await _list_tasks(args)

        assert len(result) == 1
        assert "Found" in result[0].text


class TestUpdateTask:
    """Tests for update_task MCP tool."""

    @pytest.mark.asyncio
    async def test_update_task_title(self, test_user_id, test_task):
        """Test updating task title."""
        args = {
            "user_id": str(test_user_id),
            "task_id": str(test_task.id),
            "title": "Updated Title",
        }

        result = await _update_task(args)

        assert len(result) == 1
        assert "Task updated successfully" in result[0].text
        assert "Updated Title" in result[0].text

    @pytest.mark.asyncio
    async def test_update_task_status(self, test_user_id, test_task):
        """Test updating task status."""
        args = {
            "user_id": str(test_user_id),
            "task_id": str(test_task.id),
            "status": "completed",
        }

        result = await _update_task(args)

        assert len(result) == 1
        assert "Task updated successfully" in result[0].text

    @pytest.mark.asyncio
    async def test_update_task_priority(self, test_user_id, test_task):
        """Test updating task priority."""
        args = {
            "user_id": str(test_user_id),
            "task_id": str(test_task.id),
            "priority": "high",
        }

        result = await _update_task(args)

        assert len(result) == 1
        assert "Task updated successfully" in result[0].text

    @pytest.mark.asyncio
    async def test_update_task_not_found(self, test_user_id):
        """Test updating non-existent task."""
        args = {
            "user_id": str(test_user_id),
            "task_id": str(uuid4()),
            "title": "New Title",
        }

        result = await _update_task(args)

        assert len(result) == 1
        assert "Task not found" in result[0].text

    @pytest.mark.asyncio
    async def test_update_task_invalid_ids(self):
        """Test updating task with invalid IDs."""
        args = {
            "user_id": "invalid-uuid",
            "task_id": "invalid-uuid",
            "title": "New Title",
        }

        result = await _update_task(args)

        assert len(result) == 1
        assert "invalid id" in result[0].text.lower()

    @pytest.mark.asyncio
    async def test_update_task_no_fields(self, test_user_id, test_task):
        """Test updating task without any fields."""
        args = {"user_id": str(test_user_id), "task_id": str(test_task.id)}

        result = await _update_task(args)

        assert len(result) == 1
        assert "No fields to update" in result[0].text

    @pytest.mark.asyncio
    async def test_update_task_empty_title(self, test_user_id, test_task):
        """Test updating task with empty title."""
        args = {
            "user_id": str(test_user_id),
            "task_id": str(test_task.id),
            "title": "",
        }

        result = await _update_task(args)

        assert len(result) == 1
        assert "title cannot be empty" in result[0].text.lower()


class TestDeleteTask:
    """Tests for delete_task MCP tool."""

    @pytest.mark.asyncio
    async def test_delete_task_success(self, test_user_id, test_task):
        """Test successful task deletion."""
        args = {"user_id": str(test_user_id), "task_id": str(test_task.id)}

        result = await _delete_task(args)

        assert len(result) == 1
        assert "Task deleted successfully" in result[0].text
        assert "Test Task" in result[0].text

    @pytest.mark.asyncio
    async def test_delete_task_not_found(self, test_user_id):
        """Test deleting non-existent task."""
        args = {"user_id": str(test_user_id), "task_id": str(uuid4())}

        result = await _delete_task(args)

        assert len(result) == 1
        assert "Task not found" in result[0].text

    @pytest.mark.asyncio
    async def test_delete_task_invalid_ids(self):
        """Test deleting task with invalid IDs."""
        args = {"user_id": "invalid-uuid", "task_id": "invalid-uuid"}

        result = await _delete_task(args)

        assert len(result) == 1
        assert "invalid id" in result[0].text.lower()

    @pytest.mark.asyncio
    async def test_delete_task_wrong_user(self, test_task):
        """Test deleting task with wrong user ID."""
        wrong_user_id = uuid4()
        args = {"user_id": str(wrong_user_id), "task_id": str(test_task.id)}

        result = await _delete_task(args)

        assert len(result) == 1
        assert "Task not found" in result[0].text


class TestMCPToolsIntegration:
    """Integration tests for MCP tools workflow."""

    @pytest.mark.asyncio
    async def test_full_task_lifecycle(self, test_user_id):
        """Test complete task lifecycle: create, list, update, delete."""
        # Create task
        create_args = {
            "user_id": str(test_user_id),
            "title": "Lifecycle Test Task",
            "priority": "low",
        }
        create_result = await _create_task(create_args)
        assert "Task created successfully" in create_result[0].text

        # List tasks
        list_args = {"user_id": str(test_user_id)}
        list_result = await _list_tasks(list_args)
        assert "Lifecycle Test Task" in list_result[0].text

        # Extract task ID from list result (simplified - in real scenario parse properly)
        # For now, create a new task and get its ID
        async with AsyncSession(engine) as session:
            from sqlmodel import select

            statement = select(Task).where(Task.user_id == test_user_id)
            result = await session.execute(statement)
            task = result.scalars().first()
            task_id = task.id

        # Update task
        update_args = {
            "user_id": str(test_user_id),
            "task_id": str(task_id),
            "status": "completed",
        }
        update_result = await _update_task(update_args)
        assert "Task updated successfully" in update_result[0].text

        # Delete task
        delete_args = {"user_id": str(test_user_id), "task_id": str(task_id)}
        delete_result = await _delete_task(delete_args)
        assert "Task deleted successfully" in delete_result[0].text

    @pytest.mark.asyncio
    async def test_context_resolution_scenario(self, test_user_id):
        """Test scenario where AI needs to resolve task references."""
        # Create multiple tasks
        for i in range(3):
            args = {
                "user_id": str(test_user_id),
                "title": f"Task {i+1}",
                "priority": "medium",
            }
            await _create_task(args)

        # List tasks
        list_args = {"user_id": str(test_user_id)}
        result = await _list_tasks(list_args)

        assert "Found 3 task(s)" in result[0].text
        assert "Task 1" in result[0].text
        assert "Task 2" in result[0].text
        assert "Task 3" in result[0].text
