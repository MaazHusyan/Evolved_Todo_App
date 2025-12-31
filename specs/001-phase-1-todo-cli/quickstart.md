# Quickstart: Phase I - Decoupled Todo CLI

## Prerequisites
- Python 3.13+
- `uv` package manager

## Setup
1. Install dependencies:
   ```bash
   uv sync
   ```
2. Run the application:
   ```bash
   uv run src/cli/main.py --help
   ```

## Development Commands
- **Run Tests**: `uv run pytest`
- **Add Dependency**: `uv add <package>`
- **Linting**: `uv run ruff check .`

## Architecture Note
This application is decoupled. The core logic in `src/core` can be imported and used independently of the CLI interface.
