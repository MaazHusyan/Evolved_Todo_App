"""
User service for the Todo application
"""
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional
from ..models.user import User

class UserService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

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
