# Tasks: Phase I - Decoupled Todo CLI Engine

**Input**: Design documents from `/specs/001-phase-1-todo-cli/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md

**Tests**: Tests are explicitly mandated by the constitution and plan (TDD approach).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure (`src/core`, `src/cli`, `src/repositories`) per implementation plan
- [ ] T002 Configure `pytest` and `pytest-asyncio` in `pyproject.toml`
- [ ] T003 [P] Configure `ruff` for linting and formatting in `pyproject.toml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for Decoupled architecture

- [ ] T004 Create Pydantic domain models in `src/core/models.py` (UUID, validation)
- [ ] T005 [P] Define custom exceptions in `src/core/exceptions.py`
- [ ] T006 Implement abstract `TaskRepository` interface in `src/repositories/base.py` (Async)
- [ ] T007 Implement `InMemoryTaskRepository` in `src/repositories/memory.py`
- [ ] T008 [P] Implement `TaskEngine` business logic orchestrator in `src/core/engine.py` (Async)

**Checkpoint**: Foundation ready - Core logic is fully testable and decoupled from CLI.

---

## Phase 3: User Story 1 - Core Task Lifecycle (Priority: P1) 🎯 MVP

**Goal**: Implement CLI commands for Add, View, Update, Delete, and Toggle operations.

**Independent Test**: Use `uv run src/cli/main.py` to create a task, view it, toggle its status, and delete it.

### Tests for User Story 1

- [ ] T009 [P] [US1] Unit tests for `TaskEngine` CRUD operations in `tests/test_engine.py`
- [ ] T010 [P] [US1] Unit tests for `InMemoryTaskRepository` in `tests/test_repository.py`

### Implementation for User Story 1

- [ ] T011 [US1] Create Typer CLI entry point in `src/cli/main.py`
- [ ] T012 [US1] Implement 'Add' command in `src/cli/main.py`
- [ ] T013 [US1] Implement 'View' command in `src/cli/main.py`
- [ ] T014 [US1] Implement 'Update' command in `src/cli/main.py`
- [ ] T015 [US1] Implement 'Delete' command in `src/cli/main.py`
- [ ] T016 [US1] Implement 'Toggle' command in `src/cli/main.py`
- [ ] T017 [US1] Add robust error handling to CLI commands in `src/cli/main.py`

**Checkpoint**: User Story 1 (MVP) is fully functional and testable independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T018 [P] Update `README.md` with usage instructions and setup guide
- [ ] T019 Run final `ruff` check and fix any styling issues
- [ ] T020 Run full test suite and verify 100% pass rate
- [ ] T021 Validate `quickstart.md` steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1. Blocks Phase 3.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **Polish (Phase 4)**: Final stage.

---

## Implementation Strategy

### MVP First
1. Complete Setup and Foundational Core logic.
2. Implement CLI commands for US1.
3. Validate via CLI demo.
