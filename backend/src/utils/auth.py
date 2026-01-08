"""
Authentication utilities for the todo application.
Handles JWT token creation and validation.
"""
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request, Depends
import os
from ..models.user import User


# Initialize password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Get secret key from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plain password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create an access token with expiration."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify an access token and return the payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: str = Depends(HTTPBearer())) -> User:
    """Get the current user from the token."""
    payload = verify_token(token.credentials)
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # In a real application, you would fetch the user from the database here
    # For now, we'll return a dummy user - this would be replaced with actual DB call
    # user = await user_crud.get(db, id=user_id)
    # if user is None:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="User not found",
    #         headers={"WWW-Authenticate": "Bearer"},
    #     )

    # For now, returning a basic user object
    return User(id=user_id, email="user@example.com", hashed_password="", is_active=True)


def authenticate_user(user_email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    This would typically query the database to verify credentials.
    For now, this is a placeholder.
    """
    # In a real implementation, you would:
    # 1. Query the database for the user by email
    # 2. Verify the password using verify_password()
    # 3. Return the user object if valid

    # Placeholder implementation
    if user_email and password:
        # This is where you'd actually check against the database
        # For now, return a dummy user if both fields exist
        return User(
            id=1,
            email=user_email,
            hashed_password=get_password_hash(password),
            is_active=True
        )
    return None