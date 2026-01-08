# Quickstart Guide: Multi-User Todo Web Application

## Overview
This guide provides step-by-step instructions to set up and run the multi-user todo web application with Next.js frontend, FastAPI backend, and Neon Serverless PostgreSQL database.

## Prerequisites
- Python 3.13+
- Node.js 18+ (for Next.js)
- UV package manager
- PostgreSQL client tools
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd evolve-todo-app
```

### 2. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies using UV
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env file with your configuration
```

**Required Environment Variables:**
```env
DATABASE_URL="your-neon-db-connection-string"
SECRET_KEY="your-super-secret-key-for-jwt"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Frontend Setup (Next.js)
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node.js dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local file with your configuration
```

**Required Environment Variables:**
```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# From backend directory
cd backend

# Activate virtual environment
source .venv/bin/activate

# Run database migrations
python -m alembic upgrade head

# Or create initial tables (if no alembic setup yet)
python -c "from src.main import create_db_and_tables; create_db_and_tables()"
```

### 5. Running the Application

#### Backend (FastAPI)
```bash
# From backend directory with virtual environment activated
cd backend
source .venv/bin/activate

# Run the backend server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (Next.js)
```bash
# From frontend directory
cd frontend

# Run the frontend server
npm run dev
```

### 6. API Documentation
- Backend API documentation available at: `http://localhost:8000/docs`
- Backend ReDoc documentation available at: `http://localhost:8000/redoc`

## Development Workflow

### Backend Development
1. Activate the Python virtual environment
2. Make changes to backend code
3. The server will automatically reload with `--reload` flag

### Frontend Development
1. Run the Next.js development server
2. Make changes to frontend code
3. The browser will automatically reload

## Testing
```bash
# Backend tests
cd backend
source .venv/bin/activate
pytest

# Frontend tests
cd frontend
npm run test
```

## Deployment

### Backend Deployment
1. Configure production environment variables
2. Build and deploy to a Python-compatible platform (e.g., Heroku, Railway, Vercel Python, etc.)
3. Ensure Neon PostgreSQL connection is properly configured

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the static assets to a CDN or hosting platform
3. Configure environment variables for production API URL

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure Neon PostgreSQL connection string is correct
2. **Authentication**: Verify JWT secret keys match between frontend and backend
3. **CORS**: Check that frontend URL is allowed in backend CORS configuration

### Useful Commands
```bash
# Check backend dependencies
cd backend
source .venv/bin/activate
pip list

# Check frontend dependencies
cd frontend
npm list

# Run backend with verbose logging
uvicorn src.main:app --reload --log-level debug
```

## Next Steps
1. Implement the API endpoints as defined in the contracts
2. Create the data models and repository layer
3. Build the authentication service
4. Develop the frontend components
5. Integrate frontend with backend API