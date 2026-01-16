"""
Task service for the Todo application
"""
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional
from ..models.task import Task, TaskBase
import uuid

class TaskService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def create_task(self, task_data: TaskBase) -> Task:
        """Create a new task"""
        # Ensure user_id is set
        if not task_data.user_id:
            raise ValueError("User ID is required")

        task = Task(
            title=task_data.title,
            description=task_data.description,
            user_id=task_data.user_id,
            due_date=task_data.due_date,
            priority=task_data.priority
        )
        self.db_session.add(task)
        await self.db_session.commit()
        await self.db_session.refresh(task)
        return task

    async def get_task_by_id(self, task_id: uuid.UUID, user_id: str) -> Optional[Task]:
        """Get a task by ID for a specific user"""
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        result = await self.db_session.exec(statement)
        return result.first()

    async def get_tasks_by_user(self, user_id: str) -> List[Task]:
        """Get all tasks for a specific user"""
        statement = select(Task).where(Task.user_id == user_id)
        result = await self.db_session.exec(statement)
        return result.all()

    async def get_completed_tasks_by_user(self, user_id: str) -> List[Task]:
        """Get completed tasks for a specific user"""
        statement = select(Task).where(
            Task.user_id == user_id,
            Task.is_completed == True
        )
        result = await self.db_session.exec(statement)
        return result.all()

    async def get_pending_tasks_by_user(self, user_id: str) -> List[Task]:
        """Get pending tasks for a specific user"""
        statement = select(Task).where(
            Task.user_id == user_id,
            Task.is_completed == False
        )
        result = await self.db_session.exec(statement)
        return result.all()

    async def update_task(self, task_id: uuid.UUID, user_id: str, task_data: dict) -> Optional[Task]:
        """Update a task for a specific user"""
        task = await self.get_task_by_id(task_id, user_id)
        if task:
            for key, value in task_data.items():
                if hasattr(task, key):
                    setattr(task, key, value)
            self.db_session.add(task)
            await self.db_session.commit()
            await self.db_session.refresh(task)
        return task

    async def delete_task(self, task_id: uuid.UUID, user_id: str) -> bool:
        """Delete a task for a specific user"""
        task = await self.get_task_by_id(task_id, user_id)
        if task:
            await self.db_session.delete(task)
            await self.db_session.commit()
            return True
        return False

    async def update_task_completion(self, task_id: uuid.UUID, user_id: str, is_completed: bool) -> Optional[Task]:
        """Update task completion status"""
        task = await self.get_task_by_id(task_id, user_id)
        if task:
            task.is_completed = is_completed
            self.db_session.add(task)
            await self.db_session.commit()
            await self.db_session.refresh(task)
        return task