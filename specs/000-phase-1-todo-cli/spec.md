# Feature Specification: Phase I - Decoupled Todo CLI Engine

**Feature Branch**: `001-phase-1-todo-cli`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "Phase I - Todo In-Memory Python Console App (Evolutionary Design). Refined with mandates for Decoupled Core, Repository Pattern, Async Engine, and Pydantic Validation."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Core Task Lifecycle (Priority: P1)

As a user, I want to manage my tasks (Add, View, Update, Delete, Toggle Complete) through a CLI so that I can maintain my productivity efficiently.

**Why this priority**: Fundamental purpose of the application.

**Independent Test**: Execute CLI commands for all 5 operations and verify the in-memory state persists and updates correctly during the session.

**Acceptance Scenarios**:

1. **Given** an empty list, **When** I add a task with title "Test" and description "Refinement", **Then** the list should show 1 incomplete task.
2. **Given** a task exists, **When** I toggle its completion, **Then** its status should switch between incomplete and complete.
3. **Given** a task exists, **When** I delete it, **Then** it should no longer appear in the list view.

## Edge Cases

- **Task Not Found**: Providing an ID that doesn't exist for update/delete/toggle should return a clear "Not Found" message.
- **Empty Title**: Attempting to create a task without a title should be rejected.
- **Malformed UUID**: Handling invalid ID strings gracefully.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST support creating tasks with a title and optional description.
- **FR-002**: System MUST support listing all tasks with their ID, status, title, and description.
- **FR-003**: System MUST support updating an existing task's title and description by its unique ID.
- **FR-004**: System MUST support deleting a task by its unique ID.
- **FR-005**: System MUST support toggling a task's completion status.

### Architectural Mandates (Evolutionary Design)

- **AM-001**: **Decoupled Engine**: The core business logic (Engine) MUST be completely isolated from the CLI framework (Click/Typer).
- **AM-002**: **Repository Pattern**: Data persistence MUST be handled through an abstract `TaskRepository` interface to allow shifting from In-Memory (Phase I) to SQLModel (Phase II) without changing the Engine.
- **AM-003**: **Async Core**: All core engine and repository methods MUST be `async`.
- **AM-004**: **Pydantic Validation**: All task entities and data transfers within the core MUST be validated using Pydantic models.

### Key Entities

- **Task**:
  - `id`: UUID (Primary Key)
  - `title`: String (Required)
  - `description`: String (Optional)
  - `is_completed`: Boolean (Default: False)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% separation between logic and CLI (Engine can be imported and run in a script without the CLI code).
- **SC-002**: Core logic response time for in-memory operations should be sub-millisecond.
- **SC-003**: 100% pass rate for unit tests targeting the Engine logic independently of the CLI.
- **SC-004**: Repository interface allows swapping implementations with zero changes to the `TaskEngine` class.
