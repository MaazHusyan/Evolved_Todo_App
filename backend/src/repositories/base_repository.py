"""
Base repository class for the todo application.
Provides generic CRUD operations that can be inherited by specific repositories.
"""
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Dict, Any
from sqlmodel import SQLModel, select, Session, func
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.exc import NoResultFound
from ..models import User, TodoItem


ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=SQLModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=SQLModel)


class BaseRepository(ABC, Generic[ModelType]):
    """Base repository with generic CRUD operations."""

    def __init__(self, model: type[ModelType]):
        self.model = model

    async def get(self, db_session: AsyncSession, id: int) -> Optional[ModelType]:
        """Get a record by ID."""
        statement = select(self.model).where(self.model.id == id)
        result = await db_session.exec(statement)
        return result.first()

    async def get_multi(
        self,
        db_session: AsyncSession,
        *,
        offset: int = 0,
        limit: int = 100
    ) -> tuple[List[ModelType], int]:
        """Get multiple records with pagination."""
        statement = select(self.model).offset(offset).limit(limit)
        result = await db_session.exec(statement)
        items = result.fetchall()

        # Get total count
        count_statement = select(func.count(self.model.id))
        count_result = await db_session.exec(count_statement)
        total_count = count_result.one()

        return items, total_count

    async def create(self, db_session: AsyncSession, *, obj_in: CreateSchemaType) -> ModelType:
        """Create a new record."""
        db_obj = self.model.from_orm(obj_in) if hasattr(obj_in, '__dict__') else self.model(**obj_in.dict())
        db_session.add(db_obj)
        await db_session.commit()
        await db_session.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db_session: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: UpdateSchemaType | Dict[str, Any]
    ) -> ModelType:
        """Update an existing record."""
        obj_data = db_obj.dict()
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        db_session.add(db_obj)
        await db_session.commit()
        await db_session.refresh(db_obj)
        return db_obj

    async def remove(self, db_session: AsyncSession, *, id: int) -> ModelType:
        """Remove a record by ID."""
        statement = select(self.model).where(self.model.id == id)
        result = await db_session.exec(statement)
        obj = result.first()

        if obj:
            await db_session.delete(obj)
            await db_session.commit()
            return obj

        raise ValueError(f"{self.model.__name__} with id {id} not found")