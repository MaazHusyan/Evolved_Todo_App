# Data Model: Multi-User Todo Web Application

## Overview
This document defines the data models for the multi-user todo web application, focusing on user authentication and todo item management with proper user isolation.

## Core Entities

### User
Represents an authenticated user in the system.

```python
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str | None = Field(default=None, unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to todo items
    todos: List["TodoItem"] = Relationship(back_populates="user")
```

**Attributes:**
- `id`: Unique identifier for the user (auto-incremented primary key)
- `email`: User's email address (unique, indexed for fast lookups)
- `username`: Optional unique username (unique, indexed for fast lookups)
- `hashed_password`: Securely hashed password
- `is_active`: Boolean indicating if the account is active
- `created_at`: Timestamp when the user account was created
- `updated_at`: Timestamp when the user account was last updated

**Relationships:**
- One-to-many relationship with TodoItem (one user can have many todo items)

### TodoItem
Represents a task created by a user.

```python
class TodoItem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str | None = Field(default=None)
    is_completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user
    user: User = Relationship(back_populates="todos")
```

**Attributes:**
- `id`: Unique identifier for the todo item (auto-incremented primary key)
- `title`: Title of the todo item (indexed for fast lookups)
- `description`: Optional detailed description of the todo item
- `is_completed`: Boolean indicating if the todo item is completed
- `user_id`: Foreign key linking to the user who owns this todo item (indexed for fast filtering)
- `created_at`: Timestamp when the todo item was created
- `updated_at`: Timestamp when the todo item was last updated

**Relationships:**
- Many-to-one relationship with User (many todo items belong to one user)

## Database Schema Relationships

```
Users (1) -----> (Many) TodoItems
  |                    |
  |                    |
  | user_id            | user_id (foreign key)
  |                    |
  | [id, email, etc.]  | [id, title, description, etc.]
```

## Data Access Patterns

### User Isolation
- All queries for todo items must include a filter on `user_id` to ensure users only see their own items
- Example query: `SELECT * FROM todoitem WHERE user_id = :current_user_id`

### Indexing Strategy
- `User.email`: Indexed for fast authentication lookups
- `User.username`: Indexed for fast profile lookups
- `TodoItem.title`: Indexed for fast search operations
- `TodoItem.user_id`: Indexed for efficient user-specific queries

## Validation Rules

### User Model
- Email must be a valid email format
- Email and username must be unique across the system
- Password must be securely hashed before storage

### TodoItem Model
- Title is required and cannot be empty
- `user_id` must reference an existing user
- `is_completed` defaults to `False`

## State Transitions

### TodoItem Status
- `is_completed: False` → `is_completed: True` (when user marks as complete)
- `is_completed: True` → `is_completed: False` (when user marks as incomplete)

## Security Considerations

### Data Isolation
- All database queries must filter by the authenticated user's ID
- No direct access to other users' todo items is allowed
- Foreign key constraints ensure referential integrity

### Access Control
- Users can only create, read, update, and delete their own todo items
- Attempting to access another user's items should result in a 404 or 403 error
- API endpoints must validate that the requested item belongs to the authenticated user