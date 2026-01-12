"""
User service for the Todo application
"""
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional
from ..models.user import User, UserBase, UserRegistration
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt", "bcrypt_sha256"], default="bcrypt_sha256", deprecated="auto")

class UserService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def create_user(self, user_data: UserRegistration) -> User:
        """Create a new user with hashed password"""
        # Hash the password
        hashed_password = self.get_password_hash(user_data.password)

        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password
        )
        self.db_session.add(user)
        await self.db_session.commit()
        await self.db_session.refresh(user)
        return user

    async def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
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
        """Get user by username"""
        statement = select(User).where(User.username == username)
        result = await self.db_session.exec(statement)
        return result.first()

    async def update_user(self, user_id: uuid.UUID, user_data: dict) -> Optional[User]:
        """Update user information"""
        user = await self.get_user_by_id(user_id)
        if user:
            for key, value in user_data.items():
                setattr(user, key, value)
            self.db_session.add(user)
            await self.db_session.commit()
            await self.db_session.refresh(user)
        return user

    async def delete_user(self, user_id: uuid.UUID) -> bool:
        """Delete a user"""
        user = await self.get_user_by_id(user_id)
        if user:
            await self.db_session.delete(user)
            await self.db_session.commit()
            return True
        return False

    def get_password_hash(self, password: str) -> str:
        """Generate a password hash"""
        # Use the configured password context to hash the password
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)