# Quickstart: Phase 1.1 - Persistent & Interactive Todo CLI

## Prerequisites
- Python 3.13+
- `uv` package manager

## Setup
1. Install dependencies:
   ```bash
   uv sync --group dev
   ```

2. Configuration (Auto-handled by implementation):
   - A root-level `main.py` is available for unified execution.
   - VS Code is pre-configured via `.vscode/` settings for the "Run" button.

## Usage

### 1. Unified Execution (fixes paths)
```bash
python main.py
```

### 2. Standard CLI Mode
```bash
# Add with Priority and Tags
python main.py add "Fix Bug" --priority high --tag work --tag bug

# Search for tasks
python main.py search "bug"

# List with filters
python main.py list --priority high --filter-status incomplete
```

### 3. Interactive REPL Mode
```bash
python main.py shell
```
Inside the shell, use commands like `add`, `list`, `toggle`, `delete` without prepending `python main.py`.

## Development Commands
- **Run Tests**: `uv run pytest`
- **Linting**: `uv run ruff check .`
- **Formatting**: `uv run ruff format .`
