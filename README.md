# Evolve Todo App - Phase I

A decoupled, asynchronous Todo CLI engine built with Python 3.13, Typer, and Pydantic v2.

## Architectural Design

This project follows an evolutionary design strategy:
- **Core Engine**: Pure business logic isolated from external frameworks.
- **Repository Pattern**: Abstract data access layer allowing seamless migration from in-memory (Phase I) to SQLModel (Phase II).
- **Async-First**: Core logic is fully asynchronous.
- **Pydantic Validation**: Strict data modeling and validation using Pydantic v2.

## Installation

Ensure you have [uv](https://github.com/astral-sh/uv) installed.

```bash
uv sync --group dev
```

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
