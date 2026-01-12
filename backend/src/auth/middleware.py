"""
JWT authentication middleware for the Todo application
"""
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
from .utils import verify_token as utils_verify_token  # Rename the import to avoid conflict
import uuid

security = HTTPBearer()

def verify_token_payload(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify the token and extract user information"""
    token = credentials.credentials
    payload = utils_verify_token(token)  # Use the renamed import

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user_id from the token payload
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials - no user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "user_id": user_id,
        "payload": payload
    }

def verify_user_id_match(url_user_id: str, token_user_id: uuid.UUID):
    """Verify that the user_id in the URL matches the user_id in the JWT token"""
    try:
        url_uuid = uuid.UUID(url_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user ID format: {url_user_id}",
        )

    if url_uuid != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID in URL does not match authenticated user",
        )

# Alias for easier use
JWTBearer = verify_token_payload
get_current_user = verify_token_payload  # Use a different name to avoid conflict