import json
import os
import aiofiles
import tempfile
from uuid import UUID
from pathlib import Path
from typing import List, Optional, Dict
from src.core.models import Task
from src.repositories.base import TaskRepository

class JSONTaskRepository(TaskRepository):
    """JSON file-based implementation of the Task Repository with async I/O."""

    def __init__(self, filepath: str = "tasks.json"):
        self.filepath = Path(filepath)

    async def _load_all(self) -> Dict[UUID, Task]:
        """Load tasks from JSON file."""
        if not self.filepath.exists():
            return {}

        async with aiofiles.open(self.filepath, mode='r') as f:
            content = await f.read()
            if not content:
                return {}

            try:
                data = json.loads(content)
                return {UUID(k): Task.model_validate(v) for k, v in data.items()}
            except (json.JSONDecodeError, ValueError):
                return {}

    async def _save_all(self, tasks: Dict[UUID, Task]) -> None:
        """Save tasks to JSON file using an atomic write pattern."""
        data = {str(k): v.model_dump(mode='json') for k, v in tasks.items()}
        content = json.dumps(data, indent=2)

        # Atomic write pattern: write to tmp then move
        with tempfile.NamedTemporaryFile('w', dir=self.filepath.parent, delete=False) as tf:
            tmp_path = Path(tf.name)

        try:
            async with aiofiles.open(tmp_path, mode='w') as f:
                await f.write(content)
            os.replace(tmp_path, self.filepath)
        except Exception:
            if tmp_path.exists():
                tmp_path.unlink()
            raise

    async def add(self, task: Task) -> Task:
        tasks = await self._load_all()
        tasks[task.id] = task
        await self._save_all(tasks)
        return task

    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        tasks = await self._load_all()
        return tasks.get(task_id)

    async def list_all(self) -> List[Task]:
        tasks = await self._load_all()
        return list(tasks.values())

    async def update(self, task: Task) -> Task:
        tasks = await self._load_all()
        tasks[task.id] = task
        await self._save_all(tasks)
        return task

    async def delete(self, task_id: UUID) -> bool:
        tasks = await self._load_all()
        if task_id in tasks:
            del tasks[task_id]
            await self._save_all(tasks)
            return True
        return False
