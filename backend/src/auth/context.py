"""Authentication context utilities for extracting user information."""
from uuid import UUID
from typing import Optional
from fastapi import HTTPException, status
import jwt
import os


def get_user_id_from_token(token: str) -> UUID:
    """
    Extract user_id from Better Auth JWT token.

    Better Auth uses JWT tokens with standard claims. This function decodes
    the token and extracts the user_id claim for authorization purposes.

    Args:
        token: JWT token string (without 'Bearer ' prefix)

    Returns:
        UUID: User identifier from token claims

    Raises:
        HTTPException: If token is invalid, expired, or missing user_id claim

    Example:
        >>> token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        >>> user_id = get_user_id_from_token(token)
        >>> print(user_id)
    """
    try:
        # Get JWT secret from environment
        jwt_secret = os.getenv("BETTER_AUTH_SECRET")
        if not jwt_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="JWT secret not configured"
            )

        # Decode token
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"]
        )

        # Extract user_id from claims
        user_id_str = payload.get("sub") or payload.get("user_id")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user identifier"
            )

        # Convert to UUID
        try:
            user_id = UUID(user_id_str)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user identifier format"
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
