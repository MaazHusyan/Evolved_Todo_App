import pytest
import os
from pathlib import Path
from src.core.models import Task
from src.repositories.json_repo import JSONTaskRepository

@pytest.fixture
def repo_path(tmp_path):
    return tmp_path / "test_tasks.json"

@pytest.fixture
def repo(repo_path):
    return JSONTaskRepository(str(repo_path))

@pytest.mark.asyncio
async def test_json_repo_persistence(repo, repo_path):
    task = Task(title="Persistent Task")
    await repo.add(task)

    assert repo_path.exists()

    # Create new repo instance to verify it loads from file
    new_repo = JSONTaskRepository(str(repo_path))
    tasks = await new_repo.list_all()
    assert len(tasks) == 1
    assert tasks[0].title == "Persistent Task"
    assert tasks[0].id == task.id

@pytest.mark.asyncio
async def test_json_repo_delete(repo, repo_path):
    task = Task(title="Delete Me")
    await repo.add(task)
    assert len(await repo.list_all()) == 1

    await repo.delete(task.id)
    assert len(await repo.list_all()) == 0
