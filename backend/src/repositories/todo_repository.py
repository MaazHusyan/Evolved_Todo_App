"""
Todo repository for the todo application.
Handles all todo-related database operations.
"""
from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, and_
from fastapi import HTTPException, status
from ..models.todo_item import TodoItem, TodoItemCreate, TodoItemUpdate, TodoItemRead
from ..models.user import User
from .base_repository import BaseRepository
from ..exceptions.handlers import TodoItemNotFoundException


class TodoRepository(BaseRepository[TodoItem]):
    """Repository for TodoItem model operations."""

    def __init__(self):
        super().__init__(TodoItem)

    async def get_by_user_id(
        self,
        db_session: AsyncSession,
        user_id: int,
        *,
        offset: int = 0,
        limit: int = 100
    ) -> tuple[List[TodoItem], int]:
        """Get all todo items for a specific user."""
        statement = select(TodoItem).where(TodoItem.user_id == user_id).offset(offset).limit(limit)
        result = await db_session.exec(statement)
        items = result.all()

        # Get total count
        count_statement = select(TodoItem).where(TodoItem.user_id == user_id)
        count_result = await db_session.exec(count_statement)
        total_count = len(count_result.all())

        return items, total_count

    async def get_by_user_id_and_completed(
        self,
        db_session: AsyncSession,
        user_id: int,
        is_completed: bool
    ) -> List[TodoItem]:
        """Get all todo items for a specific user with completion status."""
        statement = select(TodoItem).where(
            and_(TodoItem.user_id == user_id, TodoItem.is_completed == is_completed)
        )
        result = await db_session.exec(statement)
        return result.all()

    async def create(
        self,
        db_session: AsyncSession,
        *,
        obj_in: TodoItemCreate,
        user_id: int
    ) -> TodoItem:
        """Create a new todo item for a specific user."""
        # Create todo object with user association
        todo = TodoItem(
            title=obj_in.title,
            description=obj_in.description,
            is_completed=obj_in.is_completed,
            user_id=user_id
        )

        # Add to session and commit
        db_session.add(todo)
        await db_session.commit()
        await db_session.refresh(todo)
        return todo

    async def update(
        self,
        db_session: AsyncSession,
        *,
        db_obj: TodoItem,
        obj_in: TodoItemUpdate
    ) -> TodoItem:
        """Update a todo item."""
        obj_data = db_obj.dict()
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        db_session.add(db_obj)
        await db_session.commit()
        await db_session.refresh(db_obj)
        return db_obj

    async def remove_by_user_id(
        self,
        db_session: AsyncSession,
        *,
        todo_id: int,
        user_id: int
    ) -> TodoItem:
        """Remove a todo item by ID for a specific user."""
        statement = select(TodoItem).where(
            and_(TodoItem.id == todo_id, TodoItem.user_id == user_id)
        )
        result = await db_session.exec(statement)
        obj = result.first()

        if obj:
            await db_session.delete(obj)
            await db_session.commit()
            return obj

        raise TodoItemNotFoundException(todo_id)

    async def get_by_id_and_user_id(
        self,
        db_session: AsyncSession,
        todo_id: int,
        user_id: int
    ) -> Optional[TodoItem]:
        """Get a specific todo item by ID and user ID."""
        statement = select(TodoItem).where(
            and_(TodoItem.id == todo_id, TodoItem.user_id == user_id)
        )
        result = await db_session.exec(statement)
        return result.first()


# Create a singleton instance
todo_repo = TodoRepository()