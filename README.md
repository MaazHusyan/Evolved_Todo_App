# Evolve Todo App

> A modern, full-stack task management application featuring a stunning glassmorphism UI, built with Next.js 16, React 19, FastAPI, and PostgreSQL. Includes both CLI and web interfaces with mobile-first responsive design.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://frontend-cyan-delta-89.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13-green)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Highlights

- 🎨 **Next-Gen UI**: Glassmorphism design with animated backgrounds and smooth transitions
- 📱 **Mobile-First**: Fully responsive design optimized for all screen sizes
- ⚡ **Modern Stack**: Next.js 16 with Turbopack, React 19, FastAPI, PostgreSQL
- 🔐 **Secure Auth**: JWT-based authentication with session management
- 🌙 **Dark Mode**: Beautiful dark theme with seamless switching
- 🚀 **Production Ready**: Deployed on Vercel (frontend) and Hugging Face Spaces (backend)
- 📅 **Advanced Features**: Date/time picker, priority levels, tags, filtering, and sorting
- 💻 **CLI Interface**: Powerful command-line tool with interactive shell mode

## 🚀 Live Demo

- **Web App**: https://frontend-cyan-delta-89.vercel.app
- **Backend API**: https://maazHusyan-todo-backend.hf.space

## 📸 Screenshots

### Dashboard View
Beautiful glassmorphism design with task cards, priority indicators, and filtering options.

### Mobile Experience
Fully responsive design that works seamlessly on all devices.

## 📋 Project Evolution

### Phase I - CLI Application ✅
A decoupled, asynchronous Todo CLI engine built with Python 3.13, Typer, and Pydantic v2. Features persistent storage, priority levels, tagging, and an interactive shell.

### Phase II - Web Application ✅
Full-stack web application with Next.js 16 frontend, FastAPI backend, and PostgreSQL database. Features next-generation glassmorphism UI with animated backgrounds, mobile-first responsive design, and advanced task management capabilities.

### Phase III - AI-Powered Chat ✅
Conversational task management powered by OpenAI GPT-4 and Model Context Protocol (MCP). Manage tasks through natural language conversation with an AI assistant that understands context and intent.

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
- ✅ **Authentication**: Secure user registration and login with JWT tokens
- ✅ **Task Management**: Create, edit, delete, and complete tasks
- ✅ **Advanced Task Creation**:
  - Rich descriptions
  - Start date and time with custom picker
  - Due date and time with custom picker
  - Priority levels (low, medium, high, urgent)
  - Custom tags with predefined options
- ✅ **Smart Filtering**: Filter by status, priority, tags, and search
- ✅ **Priority Sorting**: Tasks automatically sorted by urgency
- ✅ **Visual Indicators**:
  - Colored priority borders
  - Overdue task badges
  - Completion status
- ✅ **Modern UI/UX**:
  - Glassmorphism design system
  - Animated backgrounds and transitions
  - Dark mode with theme persistence
  - Mobile-first responsive design
  - Centered modal dialogs
  - Toast notifications
- ✅ **Dashboard Features**:
  - Summary cards (All, Pending, Completed, Overdue)
  - Control sidebar with filters
  - Task grid with responsive columns
  - User profile with avatar

### AI Chat Features (Phase III)
- ✅ **Natural Language Interface**: Manage tasks through conversation
- ✅ **AI-Powered Assistant**: OpenAI GPT-4 with context awareness
- ✅ **MCP Integration**: Model Context Protocol for tool calling
- ✅ **Conversational Task Management**:
  - Create tasks with natural language ("Add a task to buy groceries tomorrow")
  - List tasks with filters ("Show me my urgent tasks")
  - Update tasks using context ("Mark the first one done")
  - Complete and delete tasks conversationally
- ✅ **Context Awareness**:
  - Maintains conversation history (50 messages)
  - Resolves references ("the first one", "that task")
  - Multi-turn conversations with context
- ✅ **Smart Features**:
  - Date recognition (tomorrow, next week, Friday)
  - Priority detection (urgent, high, low)
  - Tag extraction from natural language
  - Error handling with helpful suggestions
- ✅ **Performance**:
  - P95 response time < 2 seconds
  - Rate limiting (60 requests/minute)
  - Retry logic for database operations
  - Real-time streaming responses (SSE)

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

### Using AI Chat (Phase III)

**Access the Chat**
1. Click the "💬 Chat" link in the navigation menu
2. Start typing your message in natural language

**Example Conversations**

Create a task:
```
You: "Add a task to buy groceries tomorrow"
AI: "I've added 'Buy groceries' to your tasks, due tomorrow."
```

List tasks:
```
You: "What do I need to do today?"
AI: "You have 3 tasks due today: 1) Buy groceries 2) Call dentist 3) Submit report"
```

Complete a task:
```
You: "Mark the first one done"
AI: "Great! I've marked 'Buy groceries' as complete."
```

**Tips**
- Use natural language - no special commands needed
- The AI remembers context from previous messages
- Reference tasks by position ("the first one") or name
- Be specific with dates for better accuracy

**Documentation**
- Full API docs: `specs/003-ai-chatbot-mcp/api-documentation.md`
- User guide: `specs/003-ai-chatbot-mcp/user-guide.md`

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
### Phase IV - Kubernetes Deployment ✅
Production-ready Kubernetes deployment with Docker containerization, Helm charts, and automation scripts. Deploy to local Minikube or cloud providers (AWS EKS, Google GKE, Azure AKS).

## 🐳 Kubernetes Deployment

### Quick Start

Deploy the entire application to a local Kubernetes cluster:

```bash
bash scripts/dev/quick-start.sh
```

This will:
1. Install required tools (kubectl, minikube, helm)
2. Setup Minikube cluster
3. Build Docker images
4. Deploy with Helm
5. Configure ingress

### Manual Deployment

#### 1. Build Docker Images

```bash
bash scripts/docker/build-all.sh
```

Images created:
- `evolve-todo-backend:latest` (84MB)
- `evolve-todo-frontend:latest` (228MB)

#### 2. Setup Minikube

```bash
bash scripts/setup/setup-minikube.sh
```

#### 3. Deploy with Helm

```bash
bash scripts/k8s/deploy-helm.sh
```

Or with Kustomize:

```bash
bash scripts/k8s/deploy-kustomize.sh dev
```

#### 4. Access the Application

**Using Ingress:**
```bash
# Add to /etc/hosts
echo "127.0.0.1 evolve-todo.local" | sudo tee -a /etc/hosts

# Start tunnel
minikube tunnel

# Visit
http://evolve-todo.local
```

**Using Port Forwarding:**
```bash
kubectl port-forward -n evolve-todo svc/evolve-todo-frontend 3000:3000
kubectl port-forward -n evolve-todo svc/evolve-todo-backend 8000:8000
```

### Deployment Options

- **Kustomize**: Environment-specific overlays (dev/prod)
- **Helm**: Parameterized charts with values files
- **Cloud Providers**: AWS EKS, Google GKE, Azure AKS

### Documentation

- [Deployment Guide](docs/deployment-guide.md) - Complete deployment instructions
- [Troubleshooting Guide](docs/troubleshooting.md) - Common issues and solutions
- [AI Architecture](docs/ai-tools/architecture.md) - AI chatbot architecture
- [MCP Integration](docs/ai-tools/mcp-integration.md) - Model Context Protocol guide

### Automation Scripts

All scripts are located in the `scripts/` directory:

**Setup:**
- `scripts/setup/install-tools.sh` - Install kubectl, minikube, helm
- `scripts/setup/setup-minikube.sh` - Configure Minikube cluster

**Docker:**
- `scripts/docker/build-all.sh` - Build all Docker images

**Kubernetes:**
- `scripts/k8s/deploy-helm.sh` - Deploy with Helm
- `scripts/k8s/deploy-kustomize.sh` - Deploy with Kustomize
- `scripts/k8s/logs.sh` - View application logs
- `scripts/k8s/cleanup.sh` - Remove all resources

**Development:**
- `scripts/dev/quick-start.sh` - One-command setup

## Testing

Run the test suite:

```bash
uv run pytest
```
