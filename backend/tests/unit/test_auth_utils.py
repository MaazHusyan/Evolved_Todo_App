import pytest
import os
from unittest.mock import patch
import sys
from pathlib import Path

# Add the project root to sys.path to resolve absolute imports from 'src'
project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from src.auth.utils import verify_password, get_password_hash, create_access_token, verify_token


def test_password_hashing():
    """Test password hashing and verification"""
    plain_password = "testpassword123"

    # Hash the password
    hashed = get_password_hash(plain_password)

    # Verify it's different from the original
    assert hashed != plain_password

    # Verify the password matches the hash
    assert verify_password(plain_password, hashed) is True

    # Verify wrong password doesn't match
    assert verify_password("wrongpassword", hashed) is False


def test_create_and_verify_token():
    """Test creating and verifying access tokens"""
    payload = {"sub": "123e4567-e89b-12d3-a456-426614174000"}

    # Create a token
    token = create_access_token(data=payload)

    # Verify the token
    decoded_payload = verify_token(token)

    assert decoded_payload is not None
    assert decoded_payload["sub"] == payload["sub"]
    assert "exp" in decoded_payload
    assert "iat" in decoded_payload


def test_verify_invalid_token():
    """Test verifying an invalid token"""
    invalid_token = "invalid.token.string"

    decoded_payload = verify_token(invalid_token)

    assert decoded_payload is None


def test_verify_expired_token():
    """Test verifying an expired token"""
    from datetime import datetime, timedelta
    import jwt
    from src.auth.utils import SECRET_KEY, ALGORITHM

    # Create an expired token
    expired_payload = {
        "sub": "123e4567-e89b-12d3-a456-426614174000",
        "exp": datetime.utcnow() - timedelta(seconds=1),  # Expired 1 second ago
        "iat": datetime.utcnow() - timedelta(hours=1)
    }

    expired_token = jwt.encode(expired_payload, SECRET_KEY, algorithm=ALGORITHM)

    # This should return None because the token is expired
    decoded_payload = verify_token(expired_token)

    assert decoded_payload is None