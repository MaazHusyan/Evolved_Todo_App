"""
Todos API endpoints for the todo application.
"""
from fastapi import APIRouter, Depends, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional

from ...database import get_async_session
from ...models.todo_item import TodoItemCreate, TodoItemUpdate, TodoItemRead
from ..deps import get_current_user, get_current_active_user
from ...models.user import User
from ...services.todo_service import todo_service
from ...utils.responses import (
    created_response,
    handle_success,
    bad_request_response,
    not_found_response,
    forbidden_response
)


router = APIRouter()


@router.get("/", response_model=List[TodoItemRead])
async def get_todos(
    current_user: User = Depends(get_current_active_user),
    db_session: AsyncSession = Depends(get_async_session),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    completed: Optional[bool] = Query(None)
):
    """
    Retrieve all todo items for the authenticated user.
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"User {current_user.id} requesting todos with limit={limit}, offset={offset}, completed={completed}")

    try:
        todos, total_count = await todo_service.get_todos(
            db_session,
            user_id=current_user.id,
            offset=offset,
            limit=limit,
            completed=completed
        )

        # Return paginated response
        logger.info(f"Successfully retrieved {len(todos)} todos for user {current_user.id}")
        return handle_success(
            data={
                "items": todos,
                "total": total_count,
                "limit": limit,
                "offset": offset
            },
            message="Todos retrieved successfully"
        )
    except Exception as e:
        logger.error(f"Error retrieving todos for user {current_user.id}: {str(e)}")
        return bad_request_response(f"Failed to retrieve todos: {str(e)}")


@router.post("/", response_model=TodoItemRead)
async def create_todo(
    todo_create: TodoItemCreate,
    current_user: User = Depends(get_current_active_user),
    db_session: AsyncSession = Depends(get_async_session)
):
    """
    Create a new todo item for the authenticated user.
    """
    try:
        todo = await todo_service.create_todo(
            db_session,
            todo_create=todo_create,
            user_id=current_user.id
        )
        return created_response(data=todo, message="Todo created successfully")
    except Exception as e:
        return bad_request_response(f"Failed to create todo: {str(e)}")


@router.get("/{todo_id}", response_model=TodoItemRead)
async def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db_session: AsyncSession = Depends(get_async_session)
):
    """
    Retrieve a specific todo item by ID for the authenticated user.
    """
    try:
        todo = await todo_service.get_todo(
            db_session,
            todo_id=todo_id,
            user_id=current_user.id
        )
        return handle_success(data=todo, message="Todo retrieved successfully")
    except Exception as e:
        if "not found" in str(e).lower():
            return not_found_response("Todo item not found")
        return bad_request_response(f"Failed to retrieve todo: {str(e)}")


@router.put("/{todo_id}", response_model=TodoItemRead)
async def update_todo(
    todo_id: int,
    todo_update: TodoItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db_session: AsyncSession = Depends(get_async_session)
):
    """
    Update a specific todo item for the authenticated user.
    """
    try:
        todo = await todo_service.update_todo(
            db_session,
            todo_id=todo_id,
            todo_update=todo_update,
            user_id=current_user.id
        )
        return handle_success(data=todo, message="Todo updated successfully")
    except Exception as e:
        if "not found" in str(e).lower():
            return not_found_response("Todo item not found")
        return bad_request_response(f"Failed to update todo: {str(e)}")


@router.patch("/{todo_id}", response_model=TodoItemRead)
async def partial_update_todo(
    todo_id: int,
    todo_update: TodoItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db_session: AsyncSession = Depends(get_async_session)
):
    """
    Partially update a specific todo item for the authenticated user.
    """
    try:
        todo = await todo_service.update_todo(
            db_session,
            todo_id=todo_id,
            todo_update=todo_update,
            user_id=current_user.id
        )
        return handle_success(data=todo, message="Todo updated successfully")
    except Exception as e:
        if "not found" in str(e).lower():
            return not_found_response("Todo item not found")
        return bad_request_response(f"Failed to update todo: {str(e)}")


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db_session: AsyncSession = Depends(get_async_session)
):
    """
    Delete a specific todo item for the authenticated user.
    """
    try:
        success = await todo_service.delete_todo(
            db_session,
            todo_id=todo_id,
            user_id=current_user.id
        )
        if success:
            return handle_success(message="Todo deleted successfully")
        else:
            return not_found_response("Todo item not found")
    except Exception as e:
        return bad_request_response(f"Failed to delete todo: {str(e)}")


@router.patch("/{todo_id}/toggle-complete", response_model=TodoItemRead)
async def toggle_todo_completion(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db_session: AsyncSession = Depends(get_async_session)
):
    """
    Toggle the completion status of a specific todo item.
    """
    try:
        todo = await todo_service.toggle_todo_completion(
            db_session,
            todo_id=todo_id,
            user_id=current_user.id
        )
        return handle_success(
            data=todo,
            message=f"Todo marked as {'completed' if todo.is_completed else 'not completed'}"
        )
    except Exception as e:
        if "not found" in str(e).lower():
            return not_found_response("Todo item not found")
        return bad_request_response(f"Failed to toggle todo completion: {str(e)}")