# Multi-User Todo Web Application

A modern full-stack todo application with user authentication, built with Next.js 16+, FastAPI, and Neon Serverless PostgreSQL.

## Features

- User registration and authentication
- Create, read, update, and delete personal todo items
- Multi-user isolation (each user only sees their own todos)
- Responsive UI that works across different device sizes
- JWT token-based authentication
- Repository pattern for database operations
- Async-first design approach

## Tech Stack

- **Frontend**: Next.js 16+, React, TypeScript
- **Backend**: FastAPI, Python 3.13+
- **Database**: Neon Serverless PostgreSQL with SQLModel ORM
- **Authentication**: Better Auth
- **Package Manager**: UV (Python), npm (JavaScript)

## Prerequisites

- Python 3.13+
- Node.js 18+
- UV package manager
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd evolve-todo-app
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   uv pip install -e .
   ```

4. Set up environment variables:
   ```bash
   # The .env file has been created with default values
   # Edit backend/.env file with your specific configuration
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # The .env.local file has been created with default values
   # Edit frontend/.env.local file with your specific configuration
   ```

## Running the Application

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   ```bash
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Run the application:
   ```bash
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. The API will be available at `http://localhost:8000`
5. API documentation will be available at `http://localhost:8000/docs`

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env in backend/ directory)
- `DATABASE_URL`: Database connection string (default: `postgresql+asyncpg://username:password@localhost:5432/todo_db`)
- `SECRET_KEY`: Secret key for JWT tokens (generate a strong random key for production)
- `ALGORITHM`: Algorithm for JWT (default: `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: `30`)
- `DEBUG`: Enable/disable debug mode (default: `true`)
- `PORT`: Port to run the server on (default: `8000`)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (default: `http://localhost:3000,http://localhost:3001`)

### Frontend (.env.local in frontend/ directory)
- `NEXT_PUBLIC_API_URL`: URL of the backend API (default: `http://localhost:8000`)
- `NEXT_PUBLIC_APP_NAME`: Name of the application (default: `Todo Application`)
- `NEXT_PUBLIC_DEBUG`: Enable/disable debug mode (default: `true`)

## API Documentation

Backend API documentation is available at `http://localhost:8000/docs` when the server is running.

## Testing

### Backend Tests

```bash
cd backend
source .venv/bin/activate
pytest
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Project Structure

```
backend/
├── src/
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── api/             # API endpoints
│   │   ├── deps.py      # API dependencies
│   │   └── v1/          # API version 1
│   │       ├── api_router.py # Main API router
│   │       ├── auth.py  # Authentication endpoints
│   │       └── todos.py # Todo endpoints
│   ├── database.py      # Database connection
│   ├── exceptions/      # Exception handlers
│   │   └── handlers.py  # Custom exception handlers
│   ├── utils/           # Utility functions
│   │   ├── auth.py      # Authentication utilities
│   │   ├── security.py  # Security utilities
│   │   └── responses.py # Response utilities
│   └── main.py          # Application entry point
├── tests/               # Test files
├── requirements.txt     # Python dependencies
├── pyproject.toml       # Project configuration
├── uv.lock              # UV lock file
└── .env                 # Environment variables

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── Todo/        # Todo-specific components
│   ├── contexts/        # React context providers
│   ├── pages/           # Page components
│   │   ├── dashboard/   # Dashboard page
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   └── index.js     # Home page
│   ├── services/        # API and utility services
│   └── styles/          # Styling files
├── public/              # Static assets
├── package.json         # Node.js dependencies
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── .env.local           # Environment variables

shared/
├── types/               # Shared TypeScript types
│   ├── user.types.ts    # User-related types
│   ├── todo.types.ts    # Todo-related types
│   └── api.types.ts     # API-related types
└── constants/           # Shared constants
    └── index.ts         # Constants definition

.history/                # Prompt History Records
├── prompts/
│   └── 002-todo-full-stack/ # Feature-specific prompts
└── adr/                 # Architecture Decision Records

.specify/                # SpecKit Plus templates and scripts
```

## Getting Started

1. Start the backend server first:
   ```bash
   cd backend
   source .venv/bin/activate
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser to `http://localhost:3000` to access the application

4. Register a new account or use an existing one to log in

5. Once logged in, you can create, view, update, and delete your personal todo items

## Troubleshooting

- **Database Connection Issues**: Make sure your PostgreSQL server is running and the DATABASE_URL in backend/.env is correct
- **Frontend Cannot Connect to Backend**: Verify that NEXT_PUBLIC_API_URL in frontend/.env.local matches your backend server URL
- **Authentication Issues**: Check that your JWT settings are consistent between frontend and backend
- **Port Already in Use**: Change the PORT in backend/.env or frontend/package.json to an available port

## License

MIT