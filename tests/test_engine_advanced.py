import pytest
import pytest_asyncio
from src.core.models import TaskCreate, Priority
from src.core.engine import TaskEngine
from src.repositories.memory import InMemoryTaskRepository

@pytest_asyncio.fixture
async def engine():
    repo = InMemoryTaskRepository()
    return TaskEngine(repo)

@pytest.mark.asyncio
async def test_filter_by_priority(engine):
    await engine.create_task(TaskCreate(title="High Task", priority=Priority.HIGH))
    await engine.create_task(TaskCreate(title="Low Task", priority=Priority.LOW))

    high_tasks = await engine.list_tasks(priority=Priority.HIGH)
    assert len(high_tasks) == 1
    assert high_tasks[0].title == "High Task"

@pytest.mark.asyncio
async def test_filter_by_status(engine):
    t1 = await engine.create_task(TaskCreate(title="Done"))
    await engine.create_task(TaskCreate(title="Not Done"))
    await engine.toggle_task(t1.id)

    done_tasks = await engine.list_tasks(status=True)
    assert len(done_tasks) == 1
    assert done_tasks[0].title == "Done"

@pytest.mark.asyncio
async def test_search_tasks(engine):
    await engine.create_task(TaskCreate(title="Buy Milk", description="From the store"))
    await engine.create_task(TaskCreate(title="Clean Room"))

    results = await engine.search_tasks("milk")
    assert len(results) == 1
    assert "Milk" in results[0].title

@pytest.mark.asyncio
async def test_sort_alpha(engine):
    await engine.create_task(TaskCreate(title="B Task"))
    await engine.create_task(TaskCreate(title="A Task"))

    tasks = await engine.list_tasks(sort_by="alpha")
    assert tasks[0].title == "A Task"
    assert tasks[1].title == "B Task"

@pytest.mark.asyncio
async def test_sort_priority(engine):
    await engine.create_task(TaskCreate(title="Low", priority=Priority.LOW))
    await engine.create_task(TaskCreate(title="High", priority=Priority.HIGH))

    tasks = await engine.list_tasks(sort_by="priority")
    assert tasks[0].priority == Priority.HIGH
    assert tasks[1].priority == Priority.LOW
