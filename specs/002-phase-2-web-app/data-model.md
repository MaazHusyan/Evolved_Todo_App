# Data Model: Phase II - Todo Full-Stack Web Application

## Overview
This document defines the data models for the multi-user todo application, including database schemas, relationships, and validation rules.

## Entity Models

### User
Represents an authenticated user in the system.

**Fields:**
- `id` (UUID/String): Unique identifier for the user (Primary Key)
- `email` (String): User's email address (Required, Unique, Validated)
- `username` (String): User's display name (Required, Unique)
- `created_at` (DateTime): Timestamp when user account was created (Required, Auto-generated)
- `updated_at` (DateTime): Timestamp when user account was last updated (Required, Auto-generated)
- `is_active` (Boolean): Whether the user account is active (Default: true)

**Validation Rules:**
- Email must be a valid email format
- Username must be 3-30 characters, alphanumeric with underscores/hyphens
- Email and username must be unique across all users

**Relationships:**
- One-to-Many: User has many Tasks

### Task
Represents a todo item belonging to a specific user.

**Fields:**
- `id` (UUID/String): Unique identifier for the task (Primary Key)
- `user_id` (UUID/String): Reference to the owning user (Foreign Key)
- `title` (String): Task title/description (Required, 1-200 characters)
- `description` (Text): Detailed task description (Optional)
- `is_completed` (Boolean): Whether the task is completed (Default: false)
- `created_at` (DateTime): Timestamp when task was created (Required, Auto-generated)
- `updated_at` (DateTime): Timestamp when task was last updated (Required, Auto-generated)
- `due_date` (DateTime): Optional deadline for the task (Optional)
- `priority` (String): Task priority level (Optional, values: 'low', 'medium', 'high')

**Validation Rules:**
- Title must be 1-200 characters
- Priority must be one of 'low', 'medium', 'high' if specified
- Due date must be in the future if specified
- User_id must reference an existing active user

**Relationships:**
- Many-to-One: Task belongs to one User

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high'))
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(is_completed);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

## State Transitions

### Task State Transitions
- **Created**: New task is created with `is_completed = false`
- **Updated**: Task details can be modified while maintaining ownership
- **Completed**: Task status changes from `is_completed = false` to `is_completed = true`
- **Uncompleted**: Task status changes from `is_completed = true` to `is_completed = false`
- **Deleted**: Task is removed from the system (cascading cleanup handled by database)

## Data Access Patterns

### Query Patterns
1. **Get all tasks for a user**: Filter by `user_id`, ordered by creation date or priority
2. **Get specific task**: Filter by `id` and `user_id` to ensure ownership
3. **Get completed tasks**: Filter by `user_id` and `is_completed = true`
4. **Get pending tasks**: Filter by `user_id` and `is_completed = false`

### Security Patterns
- **Ownership validation**: All queries must include `user_id` filter
- **Authorization check**: Verify JWT token user matches `user_id` in query
- **Access control**: Users can only access their own tasks

## Migration Strategy

### Initial Schema Creation
1. Create `users` table with basic fields
2. Create `tasks` table with foreign key relationship
3. Create necessary indexes for performance
4. Set up database connection and connection pooling

### Future Migration Considerations
- Soft deletes for task history
- Task categories/tags
- Subtasks relationship
- Recurring tasks
- Collaborative tasks (future phase)

## Validation Implementation

### Backend Validation (FastAPI/SQLModel)
- Pydantic models for request/response validation
- Database constraints for data integrity
- Custom validators for business rules

### Frontend Validation (Next.js)
- Form validation before API submission
- Real-time validation feedback
- Error handling and user feedback

## API Integration Points

The data models will be used by:
- FastAPI route handlers for database operations
- Authentication middleware for user validation
- Service layer for business logic operations
- Database migration system for schema management