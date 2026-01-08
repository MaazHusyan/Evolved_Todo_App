"""
Authentication API endpoints for the todo application.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Any
from ...database import get_async_session
from ...models.user import UserCreate, UserRead
from ...services.auth_service import auth_service
from ...api.deps import get_current_user
from ...utils.responses import (
    created_response,
    handle_success,
    unauthorized_response,
    bad_request_response,
    not_found_response
)


router = APIRouter()


@router.post("/register", response_model=UserRead)
async def register_user(
    user_create: UserCreate,
    db_session: AsyncSession = Depends(get_async_session)
) -> UserRead:
    """
    Register a new user.
    """
    try:
        # Attempt to register the user
        user = await auth_service.register_user(db_session, user_create)
        return user  # Return the user object directly for FastAPI to serialize
    except HTTPException as e:
        # Re-raise HTTP exceptions as they are already properly formatted
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login")
async def login_user(
    user_credentials: dict,
    db_session: AsyncSession = Depends(get_async_session)
) -> Any:
    """
    Authenticate user and return access token.
    Expected payload: {"email": "user@example.com", "password": "password"}
    """
    email = user_credentials.get("email")
    password = user_credentials.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required"
        )

    try:
        result = await auth_service.authenticate_user(db_session, email, password)
        if not result:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )
        return result  # Return result directly for FastAPI to serialize
    except HTTPException as e:
        # Re-raise HTTP exceptions as they are already properly formatted
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/logout")
async def logout_user() -> Any:
    """
    Logout the current user.
    """
    # In a real implementation, you might want to add the token to a blacklist
    # For now, we just return a success message
    return handle_success(message="Successfully logged out")


@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user: UserRead = Depends(get_current_user)
) -> UserRead:
    """
    Get current authenticated user's profile.
    """
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    return current_user  # Return user directly for FastAPI to serialize


@router.put("/me", response_model=UserRead)
async def update_current_user(
    user_update: dict,
    current_user: UserRead = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_async_session)
) -> Any:
    """
    Update current user's profile.
    """
    try:
        updated_user = await auth_service.update_user(
            db_session,
            current_user.id,
            user_update
        )
        return handle_success(data=updated_user, message="User profile updated successfully")
    except Exception as e:
        return bad_request_response(f"Update failed: {str(e)}")


@router.delete("/me")
async def delete_current_user(
    current_user: UserRead = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_async_session)
) -> Any:
    """
    Delete current user's account.
    """
    try:
        success = await auth_service.delete_user(db_session, current_user.id)
        if success:
            return handle_success(message="User account deleted successfully")
        else:
            return not_found_response("User not found")
    except Exception as e:
        return bad_request_response(f"Deletion failed: {str(e)}")