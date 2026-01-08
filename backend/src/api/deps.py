"""
API dependencies for the todo application.
Contains reusable dependency functions for API endpoints.
"""
from typing import Generator, AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel.ext.asyncio.session import AsyncSession
from ..database import get_async_session
from ..models.user import User
from ..utils.auth import verify_token


security = HTTPBearer()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    async with get_async_session() as session:
        yield session


async def get_current_user(
    token_credentials: HTTPAuthorizationCredentials = Depends(security),
    db_session: AsyncSession = Depends(get_db_session)
) -> User:
    """Dependency to get current user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_token(token_credentials.credentials)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        # Convert the user_id from string to int (since JWT sub claim is stored as string)
        user_id: int = int(user_id_str)
    except Exception:
        raise credentials_exception

    # In a real application, we would fetch the user from the database
    # For now, returning a minimal user object
    return User(
        id=user_id,
        email=payload.get("email", "user@example.com"),
        hashed_password="",
        is_active=payload.get("is_active", True)
    )


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def require_user_id_match(current_user: User = Depends(get_current_user)):
    """Dependency to ensure the current user has permission to access a resource."""
    def check_user_id(resource_user_id: int):
        if current_user.id != resource_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this resource"
            )
        return current_user
    return check_user_id