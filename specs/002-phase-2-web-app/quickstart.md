# Quickstart Guide: Phase II - Todo Full-Stack Web Application

## Overview
This guide provides the essential steps to get the multi-user todo application up and running with authentication and database persistence.

## Prerequisites
- Node.js 18+ (for frontend development)
- Python 3.13+ (for backend development)
- UV package manager (for Python dependencies)
- PostgreSQL-compatible database (Neon Serverless PostgreSQL recommended)
- Better Auth account or JWT secret key

## Setup Instructions

### 1. Environment Setup

#### Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install Python dependencies using UV
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install fastapi sqlmodel python-multipart python-jose[cryptography] passlib[bcrypt] uvicorn

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

#### Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install next react react-dom

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your backend API URL and auth settings
```

### 2. Database Configuration

#### Set up Neon Serverless PostgreSQL
1. Create a Neon account and project
2. Get your connection string from the Neon dashboard
3. Update your backend `.env` file with the database URL:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

#### Run Database Migrations
```bash
# In the backend directory
cd backend
source .venv/bin/activate
python -m src.models.migrations  # Replace with actual migration command
```

### 3. Authentication Setup

#### Configure Better Auth
1. Set up your JWT secret in the environment:
```env
BETTER_AUTH_SECRET="your-super-secret-jwt-key-here"
```

2. Configure the auth endpoints in your Next.js app according to Better Auth documentation

### 4. Running the Applications

#### Start the Backend
```bash
# In the backend directory
cd backend
source .venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start the Frontend
```bash
# In the frontend directory
cd frontend
npm run dev
```

## API Usage Examples

### Authentication
```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword"}'

# Login to get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

### Task Operations
```bash
# Get all tasks for a user (replace USER_ID with actual user ID and TOKEN with JWT)
curl -X GET http://localhost:8000/api/USER_ID/tasks \
  -H "Authorization: Bearer TOKEN"

# Create a new task
curl -X POST http://localhost:8000/api/USER_ID/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title": "New Task", "description": "Task description"}'

# Update a task
curl -X PUT http://localhost:8000/api/USER_ID/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title": "Updated Task", "is_completed": false}'

# Mark task as complete
curl -X PATCH http://localhost:8000/api/USER_ID/tasks/TASK_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"is_completed": true}'

# Delete a task
curl -X DELETE http://localhost:8000/api/USER_ID/tasks/TASK_ID \
  -H "Authorization: Bearer TOKEN"
```

## Development Workflow

### Backend Development
1. The backend follows a service-oriented architecture
2. Models are defined using SQLModel
3. API routes are implemented with FastAPI
4. Authentication is handled via JWT middleware

### Frontend Development
1. Next.js App Router is used for routing
2. API calls are made to the backend endpoints
3. Authentication state is managed with Better Auth
4. Components are organized by feature

### Testing
```bash
# Run backend tests
cd backend
source .venv/bin/activate
pytest

# Run frontend tests
cd frontend
npm test
```

## Troubleshooting

### Common Issues
- **Database Connection**: Ensure your Neon PostgreSQL connection string is correct
- **JWT Validation**: Verify that your BETTER_AUTH_SECRET matches between frontend and backend
- **CORS**: Make sure your frontend domain is allowed in the backend CORS settings

### API Endpoints
- Backend API: `http://localhost:8000/api/`
- Frontend: `http://localhost:3000/`
- Better Auth: `http://localhost:3000/api/auth/`

## Next Steps
1. Implement the UI components as specified in the requirements
2. Add additional validation and error handling
3. Set up automated testing
4. Configure deployment settings