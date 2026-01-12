"""
User API endpoints for the Todo application
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional
from uuid import UUID
from ..services.user_service import UserService
from ..models.user import UserBase, UserRegistration
from ..models.base import SessionDep
from pydantic import BaseModel
from ..auth.middleware import get_current_user, verify_user_id_match
from ..auth.utils import create_access_token, verify_password, get_password_hash
from ..api.responses import UserResponse, ErrorResponse
from ..api.logging_config import log_info, log_error

router = APIRouter(prefix="/api", tags=["users"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserRegistration,
    session: AsyncSession = SessionDep
):
    """
    Register a new user
    """
    log_info(f"Registering new user with email: {user_data.email}")

    try:
        user_service = UserService(session)

        # Check if user already exists
        existing_user = await user_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )

        # Check if username already exists
        existing_user = await user_service.get_user_by_username(user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this username already exists"
            )

        # Create the user with password hashing
        user = await user_service.create_user(user_data)

        log_info(f"Successfully registered user with ID: {user.id}")

        return user
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        log_error(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )


@router.post("/login")
async def login_user(
    login_data: LoginRequest,
    session: AsyncSession = SessionDep
):
    """
    Authenticate user and return JWT token
    """
    log_info(f"Login attempt for email: {login_data.email}")

    try:
        user_service = UserService(session)
        user = await user_service.get_user_by_email(login_data.email)

        if not user or not user_service.verify_password(login_data.password, getattr(user, 'hashed_password', None)):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})

        log_info(f"Successful login for user ID: {user.id}")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username
            }
        }
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        log_error(f"Error during login for email {login_data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate user"
        )


@router.post("/logout")
async def logout_user():
    """
    Logout user (client-side token removal)
    """
    log_info("User logout requested")
    return {"message": "Logged out successfully"}


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    token_data: dict = Depends(get_current_user),
    session: AsyncSession = SessionDep
):
    """
    Get a user by ID
    """
    # Verify that the user_id in the URL matches the user_id in the token
    verify_user_id_match(user_id, token_data["user_id"])

    log_info(f"Getting user {user_id}")

    try:
        user_service = UserService(session)
        user = await user_service.get_user_by_id(UUID(user_id))

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        log_info(f"Retrieved user {user_id}")

        return user
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        log_error(f"Error retrieving user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )