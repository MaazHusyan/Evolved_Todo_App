import pytest
import pytest_asyncio
from uuid import uuid4
from src.core.models import Task, TaskCreate, TaskUpdate
from src.core.engine import TaskEngine
from src.core.exceptions import TaskNotFoundError
from src.repositories.memory import InMemoryTaskRepository

@pytest_asyncio.fixture
async def engine():
    repo = InMemoryTaskRepository()
    return TaskEngine(repo)

@pytest.mark.asyncio
async def test_create_task(engine):
    data = TaskCreate(title="Test Task", description="Test Description")
    task = await engine.create_task(data)
    assert task.title == "Test Task"
    assert task.is_completed is False
    assert task.id is not None

@pytest.mark.asyncio
async def test_get_task(engine):
    data = TaskCreate(title="Test")
    created = await engine.create_task(data)
    fetched = await engine.get_task(created.id)
    assert fetched.id == created.id

@pytest.mark.asyncio
async def test_get_task_not_found(engine):
    with pytest.raises(TaskNotFoundError):
        await engine.get_task(uuid4())

@pytest.mark.asyncio
async def test_list_tasks(engine):
    await engine.create_task(TaskCreate(title="Task 1"))
    await engine.create_task(TaskCreate(title="Task 2"))
    tasks = await engine.list_tasks()
    assert len(tasks) == 2

@pytest.mark.asyncio
async def test_update_task(engine):
    created = await engine.create_task(TaskCreate(title="Old"))
    updated = await engine.update_task(created.id, TaskUpdate(title="New"))
    assert updated.title == "New"

@pytest.mark.asyncio
async def test_toggle_task(engine):
    created = await engine.create_task(TaskCreate(title="Toggle Me"))
    assert created.is_completed is False
    toggled = await engine.toggle_task(created.id)
    assert toggled.is_completed is True
    untoggled = await engine.toggle_task(created.id)
    assert untoggled.is_completed is False

@pytest.mark.asyncio
async def test_delete_task(engine):
    created = await engine.create_task(TaskCreate(title="Delete Me"))
    success = await engine.delete_task(created.id)
    assert success is True
    with pytest.raises(TaskNotFoundError):
        await engine.get_task(created.id)
