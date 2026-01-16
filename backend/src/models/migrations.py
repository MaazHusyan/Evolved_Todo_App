"""
Database migration setup for the Todo application
"""
from sqlmodel import SQLModel
from .base import engine
from .user import User
from .task import Task

def create_db_and_tables():
    """Create database tables"""
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    create_db_and_tables()