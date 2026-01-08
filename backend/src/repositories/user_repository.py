"""
User repository for the todo application.
Handles all user-related database operations.
"""
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException, status
from ..models.user import User, UserCreate, UserUpdate
from .base_repository import BaseRepository
from ..utils.security import get_password_hash
from ..exceptions.handlers import DuplicateEmailException, UserNotFoundException


class UserRepository(BaseRepository[User]):
    """Repository for User model operations."""

    def __init__(self):
        super().__init__(User)

    async def get_by_email(
        self,
        db_session: AsyncSession,
        email: str
    ) -> Optional[User]:
        """Get a user by email."""
        statement = select(User).where(User.email == email)
        result = await db_session.exec(statement)
        return result.first()

    async def get_by_username(
        self,
        db_session: AsyncSession,
        username: str
    ) -> Optional[User]:
        """Get a user by username."""
        statement = select(User).where(User.username == username)
        result = await db_session.exec(statement)
        return result.first()

    async def create(
        self,
        db_session: AsyncSession,
        *,
        obj_in: UserCreate
    ) -> User:
        """Create a new user with password hashing."""
        # Check if user with email already exists
        existing_user = await self.get_by_email(db_session, obj_in.email)
        if existing_user:
            raise DuplicateEmailException()

        # Hash the password
        try:
            hashed_password = get_password_hash(obj_in.password)
        except ValueError as e:
            # Re-raise the ValueError with more specific message
            raise ValueError(str(e))

        # Create user object with hashed password
        user = User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=hashed_password
        )

        # Add to session and commit
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user

    async def update(
        self,
        db_session: AsyncSession,
        *,
        db_obj: User,
        obj_in: UserUpdate
    ) -> User:
        """Update a user, with optional password hashing."""
        obj_data = db_obj.dict()
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        # If password is being updated, hash it
        if hasattr(obj_in, 'password') and obj_in.password:
            db_obj.hashed_password = get_password_hash(obj_in.password)

        db_session.add(db_obj)
        await db_session.commit()
        await db_session.refresh(db_obj)
        return db_obj

    async def authenticate(
        self,
        db_session: AsyncSession,
        *,
        email: str,
        password: str
    ) -> Optional[User]:
        """Authenticate a user by email and password."""
        user = await self.get_by_email(db_session, email)
        if not user:
            return None
        if not user.hashed_password:
            return None

        # Verify password
        from ..utils.auth import verify_password
        if not verify_password(password, user.hashed_password):
            return None

        return user

    async def activate_user(
        self,
        db_session: AsyncSession,
        *,
        user_id: int
    ) -> User:
        """Activate a user account."""
        user = await self.get(db_session, user_id)
        if not user:
            raise UserNotFoundException(user_id)

        user.is_active = True
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user

    async def deactivate_user(
        self,
        db_session: AsyncSession,
        *,
        user_id: int
    ) -> User:
        """Deactivate a user account."""
        user = await self.get(db_session, user_id)
        if not user:
            raise UserNotFoundException(user_id)

        user.is_active = False
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user


# Create a singleton instance
user_repo = UserRepository()