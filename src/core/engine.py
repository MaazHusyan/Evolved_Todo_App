from uuid import UUID
from typing import List, Optional
from src.core.models import Task, TaskCreate, TaskUpdate, Priority
from src.core.exceptions import TaskNotFoundError
from src.repositories.base import TaskRepository

class TaskEngine:
    """Business logic orchestrator for Task management."""

    def __init__(self, repository: TaskRepository):
        self.repository = repository

    async def create_task(self, data: TaskCreate) -> Task:
        """Create a new task and persist it."""
        task = Task(
            title=data.title,
            description=data.description,
            priority=data.priority,
            tags=data.tags
        )
        return await self.repository.add(task)

    async def get_task(self, task_id: UUID) -> Task:
        """Get a task by ID or raise TaskNotFoundError."""
        task = await self.repository.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError(str(task_id))
        return task

    async def list_tasks(
        self,
        status: Optional[bool] = None,
        priority: Optional[Priority] = None,
        tag: Optional[str] = None,
        sort_by: Optional[str] = None
    ) -> List[Task]:
        """Return tasks with optional filtering and sorting."""
        tasks = await self.repository.list_all()

        # Filtering
        if status is not None:
            tasks = [t for t in tasks if t.is_completed == status]
        if priority:
            tasks = [t for t in tasks if t.priority == priority]
        if tag:
            tasks = [t for t in tasks if tag in t.tags]

        # Sorting
        if sort_by == "alpha":
            tasks.sort(key=lambda x: x.title.lower())
        elif sort_by == "priority":
            # high (0) -> medium (1) -> low (2)
            pmap = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
            tasks.sort(key=lambda x: pmap.get(x.priority, 1))

        return tasks

    async def search_tasks(self, keyword: str) -> List[Task]:
        """Search tasks by title or description keyword."""
        tasks = await self.repository.list_all()
        k = keyword.lower()
        return [
            t for t in tasks
            if k in t.title.lower() or k in t.description.lower()
        ]

    async def update_task(self, task_id: UUID, data: TaskUpdate) -> Task:
        """Update task details."""
        task = await self.get_task(task_id)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)

        return await self.repository.update(task)

    async def delete_task(self, task_id: UUID) -> bool:
        """Delete a task by ID."""
        success = await self.repository.delete(task_id)
        if not success:
            raise TaskNotFoundError(str(task_id))
        return success

    async def toggle_task(self, task_id: UUID) -> Task:
        """Toggle the completion status of a task."""
        task = await self.get_task(task_id)
        task.is_completed = not task.is_completed
        return await self.repository.update(task)
