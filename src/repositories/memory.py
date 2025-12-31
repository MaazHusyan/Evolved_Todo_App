from uuid import UUID
from typing import List, Optional, Dict
from src.core.models import Task
from src.repositories.base import TaskRepository

class InMemoryTaskRepository(TaskRepository):
    """In-memory implementation of the Task Repository."""

    def __init__(self):
        self._tasks: Dict[UUID, Task] = {}

    async def add(self, task: Task) -> Task:
        self._tasks[task.id] = task
        return task

    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        return self._tasks.get(task_id)

    async def list_all(self) -> List[Task]:
        return list(self._tasks.values())

    async def update(self, task: Task) -> Task:
        self._tasks[task.id] = task
        return task

    async def delete(self, task_id: UUID) -> bool:
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False
