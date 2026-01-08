"""
Authentication service for the todo application.
Handles user authentication and registration logic.
"""
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import timedelta
from fastapi import HTTPException, status
from ..models.user import User, UserCreate, UserUpdate, UserRead
from ..repositories.user_repository import user_repo
from ..utils.auth import create_access_token
from ..exceptions.handlers import (
    DuplicateEmailException,
    UserNotFoundException,
    InvalidCredentialsException
)


class AuthService:
    """Service class for authentication-related operations."""

    def __init__(self):
        self.repository = user_repo

    async def register_user(
        self,
        db_session: AsyncSession,
        user_create: UserCreate
    ) -> UserRead:
        """Register a new user."""
        try:
            # Validate password length before attempting to hash
            from ..utils.security import get_password_hash
            get_password_hash(user_create.password)  # This will validate the length

            # Create user via repository
            user = await self.repository.create(db_session, obj_in=user_create)
            user_dict = user.model_dump()
            # Exclude relationships to prevent serialization issues
            user_read = UserRead(**{k: v for k, v in user_dict.items() if k != 'todos'})
            return user_read
        except ValueError as ve:
            # Handle password validation errors
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )
        except DuplicateEmailException:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )

    async def authenticate_user(
        self,
        db_session: AsyncSession,
        email: str,
        password: str
    ) -> Optional[dict]:
        """Authenticate a user and return access token."""
        user = await self.repository.authenticate(
            db_session,
            email=email,
            password=password
        )

        if not user:
            raise InvalidCredentialsException()

        # Create access token
        access_token_expires = timedelta(minutes=30)  # Get from settings
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=access_token_expires
        )

        user_dict = user.model_dump()
        # Exclude relationships to prevent serialization issues
        user_read = UserRead(**{k: v for k, v in user_dict.items() if k != 'todos'})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_read
        }

    async def get_current_user(
        self,
        db_session: AsyncSession,
        user_id: int
    ) -> UserRead:
        """Get the current user by ID."""
        user = await self.repository.get(db_session, user_id)
        if not user:
            raise UserNotFoundException(user_id)

        user_dict = user.model_dump()
        # Exclude relationships to prevent serialization issues
        user_read = UserRead(**{k: v for k, v in user_dict.items() if k != 'todos'})
        return user_read

    async def update_user(
        self,
        db_session: AsyncSession,
        user_id: int,
        user_update: UserUpdate
    ) -> UserRead:
        """Update user information."""
        existing_user = await self.repository.get(db_session, user_id)
        if not existing_user:
            raise UserNotFoundException(user_id)

        updated_user = await self.repository.update(
            db_session,
            db_obj=existing_user,
            obj_in=user_update
        )

        user_dict = updated_user.model_dump()
        # Exclude relationships to prevent serialization issues
        user_read = UserRead(**{k: v for k, v in user_dict.items() if k != 'todos'})
        return user_read

    async def delete_user(
        self,
        db_session: AsyncSession,
        user_id: int
    ) -> bool:
        """Delete a user (soft delete by deactivation)."""
        try:
            await self.repository.deactivate_user(db_session, user_id=user_id)
            return True
        except UserNotFoundException:
            return False

    async def change_password(
        self,
        db_session: AsyncSession,
        user_id: int,
        current_password: str,
        new_password: str
    ) -> bool:
        """Change user password after verifying current password."""
        user = await self.repository.get(db_session, user_id)
        if not user:
            raise UserNotFoundException(user_id)

        from ..utils.security import verify_password
        if not verify_password(current_password, user.hashed_password):
            raise InvalidCredentialsException()

        # Update with new password
        user_update = UserUpdate(password=new_password)
        await self.repository.update(
            db_session,
            db_obj=user,
            obj_in=user_update
        )

        return True


# Create a singleton instance
auth_service = AuthService()