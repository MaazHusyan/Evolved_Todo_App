# Implementation Plan: Phase I - Decoupled Todo Engine

**Branch**: `001-phase-1-todo-cli` | **Date**: 2025-12-31 | **Spec**: [specs/001-phase-1-todo-cli/spec.md]
**Input**: Feature specification from `/specs/001-phase-1-todo-cli/spec.md`

## Summary
Building a modular, evolutionary Todo CLI engine in Python 3.13. The architecture uses an abstract Repository pattern and a decoupled engine to ensure Phase 2 (FastAPI/SQLModel) readiness.

## Technical Context
- **Language/Version**: Python 3.13+
- **Primary Dependencies**: `typer` (CLI), `pydantic` (validation)
- **Storage**: In-memory (via `InMemoryTaskRepository`)
- **Testing**: `pytest` + `pytest-asyncio`
- **Target Platform**: WSL 2 / Linux
- **Project Type**: CLI Application with decoupled Core Engine
- **Performance Goals**: Sub-millisecond in-memory operations
- **Constraints**: 100% Async Core, 100% Logic/CLI isolation

## Constitution Check
- [x] **Context7 Safety**: Verified Typer and Pydantic v2 patterns via Context7.
- [x] **Phase Alignment**: Implementation uses only Phase 1 tech (Python, UV, CLI).
- [x] **Presentation Agnostic**: Core logic resides in `core/` and knows nothing of Typer.
- [x] **Async-First**: All Engine and Repository methods are `async`.
- [x] **Tool-Centric**: Engine methods are designed as modular tools for future MCP exposure.
- [x] **Zero-Knowledge**: Validated Repository pattern and Typer sub-app structure via live docs.

## Project Structure

### Documentation (this feature)
```text
specs/001-phase-1-todo-cli/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code
```text
src/
├── core/
│   ├── models.py        # Pydantic entities
│   ├── engine.py        # Business logic orchestrator
│   └── exceptions.py    # Custom domain exceptions
├── repositories/
│   ├── base.py          # Abstract TaskRepository interface
│   └── memory.py        # InMemoryTaskRepository implementation
└── cli/
    └── main.py          # Typer CLI entry point
```

**Structure Decision**: Using a single project structure optimized for separation of concerns. `src/core` is the "Brain" and `src/cli` is the "Mouth".

## Complexity Tracking
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Repository Pattern | Forward compatibility | Direct dict access lacks clean swap-ability for SQLModel in Phase 2. |
| Async Logic | Future-proofing | Sync logic would require total rewrite for Phase 2 FastAPI/Dapr. |
