"""
Task API endpoints for the Todo application
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models.task import Task
from ..services.task_service import TaskService
from ..api.responses import TaskResponse, TaskCreateRequest, TaskUpdateRequest
from ..models.base import SessionDep
from ..auth.middleware import get_current_user
from ..api.logging_config import log_info, log_error

# API v1 prefix, user_id is NOT in path anymore
router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    token_data: dict = Depends(get_current_user),
    session: AsyncSession = SessionDep
):
    """
    Get all tasks for the authenticated user
    """
    user_id = token_data["user_id"]
    log_info(f"Getting tasks for user {user_id}")

    try:
        task_service = TaskService(session)
        tasks = await task_service.get_tasks_by_user(user_id)

        # Log the number of tasks retrieved
        log_info(f"Retrieved {len(tasks)} tasks for user {user_id}")

        return tasks
    except Exception as e:
        log_error(f"Error retrieving tasks for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tasks"
        )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_request: TaskCreateRequest,
    token_data: dict = Depends(get_current_user),
    session: AsyncSession = SessionDep
):
    """
    Create a new task for the authenticated user
    """
    user_id = token_data["user_id"]
    log_info(f"Creating task for user {user_id}")

    try:
        # Create task data with the user_id from the token
        task_data_dict = task_request.dict()
        task_data_dict["user_id"] = user_id

        # Create a TaskBase object from the dictionary
        from ..models.task import TaskBase
        task_obj = TaskBase(**task_data_dict)

        task_service = TaskService(session)
        task = await task_service.create_task(task_obj)

        log_info(f"Created task {task.id} for user {user_id}")

        return task
    except Exception as e:
        log_error(f"Error creating task for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create task"
        )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    token_data: dict = Depends(get_current_user),
    session: AsyncSession = SessionDep
):
    """
    Get a specific task by ID for the authenticated user
    """
    user_id = token_data["user_id"]
    log_info(f"Getting task {task_id} for user {user_id}")

    try:
        task_service = TaskService(session)
        task = await task_service.get_task_by_id(UUID(task_id), user_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        log_info(f"Retrieved task {task_id} for user {user_id}")

        return task
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )
    except Exception as e:
        log_error(f"Error retrieving task {task_id} for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve task"
        )


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_request: TaskUpdateRequest,
    token_data: dict = Depends(get_current_user),
    session: AsyncSession = SessionDep
):
    """
    Update a specific task by ID for the authenticated user
    """
    user_id = token_data["user_id"]
    log_info(f"Updating task {task_id} for user {user_id}")

    try:
        task_service = TaskService(session)
        # Check existence and ownership
        task = await task_service.get_task_by_id(UUID(task_id), user_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Prepare update data
        update_data = task_request.dict()

        updated_task = await task_service.update_task(UUID(task_id), user_id, update_data)

        log_info(f"Updated task {task_id} for user {user_id}")

        return updated_task
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )
    except Exception as e:
        log_error(f"Error updating task {task_id} for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update task"
        )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    token_data: dict = Depends(get_current_user),
    session: AsyncSession = SessionDep
):
    """
    Delete a specific task by ID for the authenticated user
    """
    user_id = token_data["user_id"]
    log_info(f"Deleting task {task_id} for user {user_id}")

    try:
        task_service = TaskService(session)
        success = await task_service.delete_task(UUID(task_id), user_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        log_info(f"Deleted task {task_id} for user {user_id}")

        return
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )
    except Exception as e:
        log_error(f"Error deleting task {task_id} for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete task"
        )


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def update_task_completion(
    task_id: str,
    completion_data: dict,
    token_data: dict = Depends(get_current_user),
    session: AsyncSession = SessionDep
):
    """
    Update the completion status of a specific task for the authenticated user
    """
    user_id = token_data["user_id"]
    log_info(f"Updating completion status for task {task_id} for user {user_id}")

    try:
        # Validate that the request contains the required 'is_completed' field
        is_completed = completion_data.get("is_completed")
        if is_completed is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing 'is_completed' field in request"
            )

        if not isinstance(is_completed, bool):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="'is_completed' must be a boolean value"
            )

        task_service = TaskService(session)
        task = await task_service.get_task_by_id(UUID(task_id), user_id)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        updated_task = await task_service.update_task_completion(UUID(task_id), user_id, is_completed)

        log_info(f"Updated completion status for task {task_id} for user {user_id}. Status: {is_completed}")

        return updated_task
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )
    except Exception as e:
        log_error(f"Error updating completion status for task {task_id} for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update task completion status"
        )
