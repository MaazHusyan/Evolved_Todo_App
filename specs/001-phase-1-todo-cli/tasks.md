# Tasks: Phase 1.1 - Persistent & Intelligent Todo App

**Input**: Design documents from `/specs/001-phase-1-todo-cli/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: This phase introduces regression tests for new engine features and persistence verification.

## Phase 1: Setup (Environment & IDE Support)

**Purpose**: Fix path resolution and ensure professional DX

- [X] T001 Create root-level `main.py` entry point (delegates to `src/cli/main.py`)
- [X] T002 [P] Create `.vscode/settings.json` with `python.analysis.extraPaths`
- [X] T003 [P] Create `.vscode/launch.json` for unified debugging with `PYTHONPATH`
- [X] T004 Add `aiofiles` dependency via `uv add aiofiles`

## Phase 2: Foundational (Storage & Data Models)

**Purpose**: Infrastructure that supports intermediate features and persistence

- [X] T005 Update `Priority` Enum and `Task` model with `tags` and `due_date` in `src/core/models.py`
- [X] T006 Implement `JSONTaskRepository` with async atomic writes in `src/repositories/json_repo.py`
- [X] T007 [P] Create unit tests for `JSONTaskRepository` in `tests/test_persistence.py`

**Checkpoint**: Core persistence and updated data structure ready for business logic expansion.

## Phase 3: User Story 1 - Advanced Querying (Priority: P1) 🎯 MVP

**Goal**: Implement Search, Filter, and Sort logic in the engine

**Independent Test**: Use the Engine directly to find tasks by keyword, filter by priority, and sort results.

### Tests for User Story 1
- [X] T008 [P] [US1] Create unit tests for search/filter/sort in `tests/test_engine_advanced.py`

### Implementation for User Story 1
- [X] T009 [US1] Update `TaskEngine` with `list_tasks` filtering and sorting parameters in `src/core/engine.py`
- [X] T010 [US1] Implement `search_tasks` keyword scanning in `src/core/engine.py`

## Phase 4: User Story 2 - Interactive Experience (Priority: P2)

**Goal**: Implement a stateful REPL loop for seamless app usage

**Independent Test**: Run `python main.py shell` and perform multiple operations without exiting.

- [X] T011 [US2] Implement REPL loop logic in `src/cli/shell.py`
- [X] T012 [US2] Integrate `shell` command into the main Typer app in `src/cli/main.py`
- [X] T013 [US2] Create summary dashboard view using Rich in `src/cli/shell.py`
- [X] T014 [US2] Update existing CLI commands (`add`, `list`) to support priority/tags flags.

## Phase 5: Polish & Validation

- [X] T015 Verify persistence survives app restarts
- [X] T016 Run final `ruff` lint and format check
- [X] T017 Validate `quickstart.md` usage scenarios

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.

### Parallel Opportunities
- VS Code configs (T002, T003) can run in parallel.
- Persistence tests (T007) and Advanced tests (T008) can run in parallel.
