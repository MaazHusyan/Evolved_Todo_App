"""
Security utilities for the todo application.
Handles password hashing and other security-related functions.
"""
from passlib.context import CryptContext
from typing import Tuple
import secrets
import string


# Initialize password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against

    Returns:
        bool: True if passwords match, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a plain password.

    Args:
        password: The plain text password to hash

    Returns:
        str: The hashed password
    """
    # Check password length to ensure it's within bcrypt limits (72 bytes)
    if len(password.encode('utf-8')) > 72:
        raise ValueError("Password cannot be longer than 72 bytes")

    return pwd_context.hash(password)


def generate_random_password(length: int = 12) -> str:
    """
    Generate a random password with letters, digits, and punctuation.

    Args:
        length: Length of the password to generate (default: 12)

    Returns:
        str: Randomly generated password
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password strength requirements.

    Args:
        password: Password to validate

    Returns:
        Tuple[bool, str]: (is_valid, message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)

    if not has_upper:
        return False, "Password must contain at least one uppercase letter"

    if not has_lower:
        return False, "Password must contain at least one lowercase letter"

    if not has_digit:
        return False, "Password must contain at least one digit"

    if not has_special:
        return False, "Password must contain at least one special character"

    return True, "Password is strong"


def sanitize_input(input_str: str) -> str:
    """
    Sanitize user input by removing potentially dangerous characters.

    Args:
        input_str: Input string to sanitize

    Returns:
        str: Sanitized string
    """
    # Remove potentially dangerous characters
    dangerous_chars = ["'", "\"", "<", ">", ";", "--", "/*", "*/"]

    sanitized = input_str
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, "")

    return sanitized.strip()


def generate_secure_token(length: int = 32) -> str:
    """
    Generate a cryptographically secure token.

    Args:
        length: Length of the token in bytes (default: 32)

    Returns:
        str: Hex-encoded secure token
    """
    return secrets.token_hex(length)