"""
Authentication utilities for the Todo application
"""

import jwt
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import bcrypt
from .config import BETTER_AUTH_SECRET, ALGORITHM


def hash_password(password: str) -> str:
    """Hash a password for storing."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against one provided by user"""
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token for a user"""
    if expires_delta is None:
        expires_delta = timedelta(days=7)

    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": user_id, "exp": expire, "iat": datetime.utcnow()}
    encoded_jwt = jwt.encode(to_encode, BETTER_AUTH_SECRET, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT access token and return the payload.
    """
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidSignatureError:
        return None
    except jwt.DecodeError:
        return None
    except Exception:
        return None


# Alias for backward compatibility
get_password_hash = hash_password
