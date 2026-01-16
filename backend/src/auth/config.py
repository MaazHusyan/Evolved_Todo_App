import os
import secrets

# Better Auth Secret configuration
# In production, this MUST be set in the environment variables
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
