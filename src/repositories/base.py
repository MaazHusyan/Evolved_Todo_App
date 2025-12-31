from abc import ABC, abstractmethod
from uuid import UUID
from typing import List, Optional
from src.core.models import Task

class TaskRepository(ABC):
    """Abstract Base Class for Task Repository."""

    @abstractmethod
    async def add(self, task: Task) -> Task:
        """Add a new task to the repository."""
        pass

    @abstractmethod
    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        """Retrieve a task by its unique ID."""
        pass

    @abstractmethod
    async def list_all(self) -> List[Task]:
        """Retrieve all tasks from the repository."""
        pass

    @abstractmethod
    async def update(self, task: Task) -> Task:
        """Update an existing task in the repository."""
        pass

    @abstractmethod
    async def delete(self, task_id: UUID) -> bool:
        """Delete a task from the repository."""
        pass
