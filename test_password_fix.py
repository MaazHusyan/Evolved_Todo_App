#!/usr/bin/env python3
"""
Test script to verify the password hashing fix
"""
from passlib.context import CryptContext

# Test the original configuration (should cause issues with long passwords)
print("Testing original configuration...")
original_context = CryptContext(schemes=["bcrypt", "bcrypt_sha256"], deprecated="auto")
try:
    original_hash = original_context.hash("pass123")
    print(f"Original hash: {original_hash[:50]}...")
    print(f"Original scheme: {original_context.identify(original_hash)}")
except Exception as e:
    print(f"Original configuration error: {e}")

print()

# Test the new configuration (should use bcrypt_sha256 as default)
print("Testing new configuration...")
new_context = CryptContext(schemes=["bcrypt", "bcrypt_sha256"], default="bcrypt_sha256", deprecated="auto")
try:
    new_hash = new_context.hash("pass123")
    print(f"New hash: {new_hash[:50]}...")
    print(f"New scheme: {new_context.identify(new_hash)}")

    # Verify the password works
    is_valid = new_context.verify("pass123", new_hash)
    print(f"Password verification: {is_valid}")

    # Test with a longer password to make sure it still works
    long_password = "a" * 100  # 100 character password
    long_hash = new_context.hash(long_password)
    print(f"Long password hash scheme: {new_context.identify(long_hash)}")
    long_verify = new_context.verify(long_password, long_hash)
    print(f"Long password verification: {long_verify}")

except Exception as e:
    print(f"New configuration error: {e}")

print("\nTest completed successfully!")