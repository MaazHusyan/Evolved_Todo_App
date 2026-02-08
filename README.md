# Evolve Todo App

A full-stack todo application with CLI and web interfaces, built with modern async architecture.

## 🚀 Live Demo

- **Web App**: https://frontend-cyan-delta-89.vercel.app
- **Backend API**: https://maazHusyan-todo-backend.hf.space

## 📋 Project Phases

### Phase I - CLI Application ✅
A decoupled, asynchronous Todo CLI engine built with Python 3.13, Typer, and Pydantic v2.

### Phase II - Web Application ✅ (Enhanced UI in Progress)
Full-stack web application with Next.js frontend, FastAPI backend, and PostgreSQL database.
**Current Enhancement**: Next-generation glassmorphism UI with live backgrounds and AI chatbot integration.

## 🏗️ Architecture

### Overall Design
This project follows an evolutionary design strategy:
- **Core Engine**: Pure business logic isolated from external frameworks
- **Repository Pattern**: Abstract data access layer (in-memory → SQLModel → PostgreSQL)
- **Async-First**: Fully asynchronous core logic
- **Pydantic Validation**: Strict data modeling and validation using Pydantic v2
- **Next-Gen UI**: Glassmorphism design with live animated backgrounds

### Tech Stack

**Frontend**
- Next.js 16.1.1 (App Router with Turbopack)
- React 19 with Server Components
- **NEW**: Glassmorphism design system with live backgrounds
- **NEW**: AI chatbot integration
- Tailwind CSS for styling
- Better Auth for authentication
- Deployed on Vercel

**Backend**
- FastAPI (Python 3.13)
- SQLModel for ORM
- Async PostgreSQL with asyncpg
- JWT authentication
- Deployed on Hugging Face Spaces

**Database**
- Neon PostgreSQL (Serverless)
- Connection pooling with extended timeouts
- Automatic migrations

## Installation

### Phase I - CLI Application

Ensure you have [uv](https://github.com/astral-sh/uv) installed.

```bash
# Install dependencies
uv sync --group dev

# Run CLI
python main.py --help
```

### Phase II - Web Application

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

#### Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Run development server
uv run uvicorn src.main:app --reload

# Run with production settings
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## 🎯 Features

### CLI Features (Phase I)
- ✅ Add, list, update, and delete tasks
- ✅ Priority levels (low, medium, high)
- ✅ Task tagging and filtering
- ✅ Search functionality
- ✅ Interactive shell mode
- ✅ Persistent storage
- ✅ Async operations

### Web App Features (Phase II)
- ✅ User authentication (register/login)
- ✅ Secure session management
- ✅ Simple task creation
- ✅ Advanced task creation with:
  - Description
  - Start date and time
  - Due date and time
  - Priority levels (low, medium, high)
- ✅ Task editing and deletion
- ✅ Task completion toggle
- ✅ Real-time task updates
- ✅ Dark mode support
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Overdue task indicators
- ✅ Task filtering and sorting

## 📱 Web Application Usage

### Getting Started

1. **Visit the App**: https://frontend-cyan-delta-89.vercel.app

2. **Create an Account**
   - Click "Register" or "Sign Up"
   - Enter your email and password
   - Submit to create your account

3. **Login**
   - Enter your credentials
   - Access your personal dashboard

### Creating Tasks

**Simple Mode**
1. Type your task title in the input field
2. Click "Add Task"

**Advanced Mode**
1. Click "Advanced mode" button
2. Fill in:
   - Task title (required)
   - Description (optional)
   - Start date (optional)
   - Due date (optional)
   - Priority level (optional)
3. Click "Add Task"

### Managing Tasks

- **Complete**: Click the checkbox to mark as done
- **Edit**: Hover over a task and click "Edit"
- **Delete**: Hover over a task and click "Delete"
- **View Details**: See dates, priority, and description in the task card

### Dark Mode

- Click the theme toggle button in the navigation bar
- Preference is saved automatically

## Evolve Todo App - CLI User Guide

The Evolve Todo CLI is a powerful task management system featuring persistent storage, priority levels, tagging, and an interactive
shell.

---
### 1. Core Commands

- Add a Task
Create new tasks with optional descriptions, priorities, and tags.
```
python main.py add "Task Title" --desc "Description" --priority high --tag "work" --tag "urgent"
```
Priority options: low, medium, high.

- List Tasks
View and filter your tasks.
```
python main.py list
python main.py list --incomplete --priority high
python main.py list --tag work --sort alpha
```

- Search
Search for tasks by keyword in the title or description.
```
python main.py search "keyword"
```

- Toggle Status
Mark a task as complete or incomplete.
```
python main.py toggle <uuid>
```

- Update Task
Modify existing task attributes.
```
python main.py update <uuid> --title "New Title" --priority low
```

- Delete Task
Permanently remove a task.
```
python main.py delete <uuid>
```

---
### 2. Interactive Shell

Enter a persistent REPL session to manage tasks without repeatedly calling the script.
```python main.py shell```
Inside the shell, use add, list, or help.

---

```
## Testing

Run the test suite:

```bash
uv run pytest
```
