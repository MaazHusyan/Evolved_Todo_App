# Implementation Plan: Phase 1.1 - Persistent & Intelligent Todo App

**Branch**: `001-phase-1-todo-cli` | **Date**: 2025-12-31 | **Spec**: [specs/001-phase-1-todo-cli/spec.md]

## Summary
Building on the Phase I foundation to evolve the Todo CLI into a professional persistent application. This phase introduces JSON-based persistence, organizational metadata (Priorities, Tags), advanced querying (Search, Filter, Sort), and an interactive REPL mode while fixing environment path issues for VS Code.

## Technical Context
- **Language/Version**: Python 3.13+
- **Primary Dependencies**: `typer`, `pydantic`, `rich`, `aiofiles` (New)
- **Storage**: JSON File (`JSONTaskRepository`)
- **Testing**: `pytest` + `pytest-asyncio`
- **Target Platform**: WSL 2 / Linux
- **Performance Goals**: Atomic writes for data safety
- **Constraints**: 100% Async Core, 100% Logic/CLI isolation

## Constitution Check
- [x] **Context7 Safety**: Verified `aiofiles` and `Rich` prompt patterns.
- [x] **Phase Alignment**: Remains in Phase I (CLI & Logic).
- [x] **Presentation Agnostic**: Core logic expanded in `src/core`, independent of CLI/Shell interface.
- [x] **Async-First**: All file I/O implemented with `aiofiles`.
- [x] **Tool-Centric**: Engine methods remain modular and independently testable.
- [x] **Zero-Knowledge**: Validated Typer interactive loop and Pydantic v2 enum patterns.

## Project Structure

### Documentation (this feature)
```text
specs/001-phase-1-todo-cli/
├── spec.md              # Requirements
├── plan.md              # This file
├── research.md          # Persistent storage and REPL research
├── data-model.md        # Updated entities (Priorities, Tags)
├── quickstart.md        # Instructions for Interactive mode
└── tasks.md             # Actionable roadmap
```

### Source Code
```text
/
├── main.py              # NEW: Root entry point
├── .vscode/             # NEW: IDE configurations
│   ├── settings.json
│   └── launch.json
├── src/
│   ├── core/
│   │   ├── models.py     # Updated: Priority, Tags, DueDate
│   │   ├── engine.py     # Updated: Search, Filter, Sort
│   │   └── exceptions.py
│   ├── repositories/
│   │   ├── base.py
│   │   ├── memory.py
│   │   └── json_repo.py  # NEW: JSON Persistence
│   └── cli/
│       ├── main.py       # Updated: Advanced commands
│       └── shell.py      # NEW: Interactive REPL Loop
└── tasks.json           # Application data
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| JSON Repository | Persistence | In-memory loses state; SQLite is Phase II. |
| Root main.py | Path resolution | Fixes VS Code ModuleNotFoundError universally. |
| Async File I/O | Concurrency | Blocking I/O would hang the CLI/Shell during writes. |
