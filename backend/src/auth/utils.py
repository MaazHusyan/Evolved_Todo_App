"""
Authentication utilities for the Todo application
"""
import jwt
from typing import Optional, Dict, Any
from .config import BETTER_AUTH_SECRET, ALGORITHM

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Better Auth access token and return the payload.
    The backend only validates tokens; it does not issue them.
    """
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            print("Token verification failed: No 'sub' claim in payload")
            return None
        return payload
    except Exception as e:  # Catch all JWT-related exceptions
        print(f"Token verification failed: {str(e)}")
        # Print first few chars of secret to verify (safely)
        print(f"Secret used for verification starts with: {BETTER_AUTH_SECRET[:3]}...")
        return None
