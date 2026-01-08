"""
Todo service for the todo application.
Handles business logic for todo operations.
"""
import logging
from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models.todo_item import TodoItem, TodoItemCreate, TodoItemUpdate, TodoItemRead
from ..repositories.todo_repository import todo_repo
from ..exceptions.handlers import TodoItemNotFoundException, UserNotAuthorizedException


# Configure logging
logger = logging.getLogger(__name__)


class TodoService:
    """Service class for todo-related operations."""

    def __init__(self):
        self.repository = todo_repo

    async def create_todo(
        self,
        db_session: AsyncSession,
        todo_create: TodoItemCreate,
        user_id: int
    ) -> TodoItemRead:
        """Create a new todo item for a user."""
        logger.info(f"Creating todo for user_id: {user_id}")
        todo = await self.repository.create(
            db_session,
            obj_in=todo_create,
            user_id=user_id
        )
        logger.info(f"Todo created successfully with id: {todo.id}")
        todo_dict = todo.model_dump()
        # Exclude relationships to prevent serialization issues
        todo_read = TodoItemRead(**{k: v for k, v in todo_dict.items() if k != 'user'})
        return todo_read

    async def get_todo(
        self,
        db_session: AsyncSession,
        todo_id: int,
        user_id: int
    ) -> TodoItemRead:
        """Get a specific todo item by ID for a user."""
        logger.info(f"Getting todo with id: {todo_id} for user_id: {user_id}")
        todo = await self.repository.get_by_id_and_user_id(
            db_session,
            todo_id=todo_id,
            user_id=user_id
        )
        if not todo:
            logger.warning(f"Todo with id {todo_id} not found for user {user_id}")
            raise TodoItemNotFoundException(todo_id)

        logger.info(f"Todo retrieved successfully with id: {todo.id}")
        todo_dict = todo.model_dump()
        # Exclude relationships to prevent serialization issues
        todo_read = TodoItemRead(**{k: v for k, v in todo_dict.items() if k != 'user'})
        return todo_read

    async def get_todos(
        self,
        db_session: AsyncSession,
        user_id: int,
        *,
        offset: int = 0,
        limit: int = 100,
        completed: Optional[bool] = None
    ) -> tuple[List[TodoItemRead], int]:
        """Get all todo items for a user with optional filtering."""
        logger.info(f"Getting todos for user_id: {user_id}, offset: {offset}, limit: {limit}, completed: {completed}")
        if completed is not None:
            todos = await self.repository.get_by_user_id_and_completed(
                db_session,
                user_id=user_id,
                is_completed=completed
            )
            total_count = len(todos)
            logger.info(f"Retrieved {len(todos)} todos for user {user_id} with completed={completed}")
            result = []
            for todo in todos:
                todo_dict = todo.model_dump()
                # Exclude relationships to prevent serialization issues
                todo_read = TodoItemRead(**{k: v for k, v in todo_dict.items() if k != 'user'})
                result.append(todo_read)
            return result, total_count
        else:
            todos, total_count = await self.repository.get_by_user_id(
                db_session,
                user_id=user_id,
                offset=offset,
                limit=limit
            )
            logger.info(f"Retrieved {len(todos)} todos for user {user_id}")
            result = []
            for todo in todos:
                todo_dict = todo.model_dump()
                # Exclude relationships to prevent serialization issues
                todo_read = TodoItemRead(**{k: v for k, v in todo_dict.items() if k != 'user'})
                result.append(todo_read)
            return result, total_count

    async def update_todo(
        self,
        db_session: AsyncSession,
        todo_id: int,
        todo_update: TodoItemUpdate,
        user_id: int
    ) -> TodoItemRead:
        """Update a todo item for a user."""
        logger.info(f"Updating todo with id: {todo_id} for user_id: {user_id}")
        todo = await self.repository.get_by_id_and_user_id(
            db_session,
            todo_id=todo_id,
            user_id=user_id
        )
        if not todo:
            logger.warning(f"Todo with id {todo_id} not found for user {user_id}")
            raise TodoItemNotFoundException(todo_id)

        updated_todo = await self.repository.update(
            db_session,
            db_obj=todo,
            obj_in=todo_update
        )
        logger.info(f"Todo updated successfully with id: {updated_todo.id}")
        return TodoItemRead.from_orm(updated_todo)

    async def delete_todo(
        self,
        db_session: AsyncSession,
        todo_id: int,
        user_id: int
    ) -> bool:
        """Delete a todo item for a user."""
        logger.info(f"Deleting todo with id: {todo_id} for user_id: {user_id}")
        try:
            await self.repository.remove_by_user_id(
                db_session,
                todo_id=todo_id,
                user_id=user_id
            )
            logger.info(f"Todo with id {todo_id} deleted successfully for user {user_id}")
            return True
        except TodoItemNotFoundException:
            logger.warning(f"Todo with id {todo_id} not found for user {user_id} during deletion")
            return False

    async def toggle_todo_completion(
        self,
        db_session: AsyncSession,
        todo_id: int,
        user_id: int
    ) -> TodoItemRead:
        """Toggle the completion status of a todo item."""
        logger.info(f"Toggling completion status for todo with id: {todo_id} for user_id: {user_id}")
        todo = await self.repository.get_by_id_and_user_id(
            db_session,
            todo_id=todo_id,
            user_id=user_id
        )
        if not todo:
            logger.warning(f"Todo with id {todo_id} not found for user {user_id}")
            raise TodoItemNotFoundException(todo_id)

        # Toggle completion status
        todo.is_completed = not todo.is_completed

        updated_todo = await self.repository.update(
            db_session,
            db_obj=todo,
            obj_in=TodoItemUpdate(is_completed=todo.is_completed)
        )
        logger.info(f"Todo completion status toggled successfully for id: {updated_todo.id}")
        return TodoItemRead.from_orm(updated_todo)


# Create a singleton instance
todo_service = TodoService()