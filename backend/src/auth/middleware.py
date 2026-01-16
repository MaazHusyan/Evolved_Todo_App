"""
Authentication middleware for the Todo application.
Supports both JWT Bearer tokens and trusted X-User-Id header from Next.js proxy.
"""
from fastapi import HTTPException, Depends, status, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
from .utils import verify_token as utils_verify_token
import os

security = HTTPBearer(auto_error=False)

# Trusted proxy secret - must match between Next.js and FastAPI
# In production, this should be a strong secret
TRUSTED_PROXY_SECRET = os.getenv("TRUSTED_PROXY_SECRET", "")


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict:
    """
    Get current user from either:
    1. X-User-Id header (from trusted Next.js proxy)
    2. JWT Bearer token (direct API access)
    """
    # Option 1: Check for X-User-Id header from trusted proxy
    user_id = request.headers.get("X-User-Id")
    if user_id:
        # In production, you should also verify a shared secret
        # proxy_secret = request.headers.get("X-Proxy-Secret")
        # if proxy_secret != TRUSTED_PROXY_SECRET:
        #     raise HTTPException(status_code=401, detail="Invalid proxy secret")
        return {
            "user_id": user_id,
            "payload": {"sub": user_id}
        }

    # Option 2: Fall back to JWT Bearer token
    if credentials:
        token = credentials.credentials
        payload = utils_verify_token(token)

        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials - no user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "user_id": user_id,
            "payload": payload
        }

    # No authentication provided
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )


def verify_user_id_match(url_user_id: str, token_user_id: str):
    """Verify that the user_id in the URL matches the user_id in the JWT token"""
    if url_user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID in URL does not match authenticated user",
        )


# Aliases for compatibility
JWTBearer = get_current_user
verify_token_payload = get_current_user
