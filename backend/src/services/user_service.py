"""
User service for the Todo application
"""
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional
from ..models.user import User, UserRegistration
from ..auth.utils import hash_password, verify_password as verify_pwd
from datetime import datetime
import uuid

class UserService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def create_user(self, user_data: UserRegistration) -> User:
        """Create a new user"""
        user = User(
            id=str(uuid.uuid4()),
            email=user_data.email,
            name=user_data.username,  # Map username to name field
            password_hash=hash_password(user_data.password),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db_session.add(user)
        await self.db_session.commit()
        await self.db_session.refresh(user)
        return user

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        statement = select(User).where(User.id == user_id)
        result = await self.db_session.exec(statement)
        return result.first()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        statement = select(User).where(User.email == email)
        result = await self.db_session.exec(statement)
        return result.first()

    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username (maps to name field)"""
        statement = select(User).where(User.name == username)
        result = await self.db_session.exec(statement)
        return result.first()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return verify_pwd(plain_password, hashed_password)
