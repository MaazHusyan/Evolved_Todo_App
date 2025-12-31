# Data Model: Phase I - Decoupled Todo Engine

## Entities

### Todo
Represents a single task in the system. Validated via Pydantic v2.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | `UUID` | Unique identifier | Auto-generated (UUID v4) |
| `title` | `str` | Task summary | `min_length: 1`, `max_length: 255` |
| `description` | `Optional[str]` | Detailed notes | `max_length: 2000` |
| `is_completed` | `bool` | Status flag | Default: `False` |
| `created_at` | `datetime` | Creation timestamp | Auto-generated |
| `updated_at` | `datetime` | Last updated timestamp | Auto-generated |

## Interfaces (Contracts)

### ITaskRepository (Protocol/Abstract Base)
Defines the persistence contract for todo management.

```python
class ITaskRepository(Protocol):
    async def add(self, todo: Todo) -> None: ...
    async def get_by_id(self, todo_id: UUID) -> Optional[Todo]: ...
    async def get_all(self) -> List[Todo]: ...
    async def update(self, todo: Todo) -> None: ...
    async def delete(self, todo_id: UUID) -> None: ...
```

### ITaskEngine
Defines the business logic orchestrator.

```python
class ITaskEngine(Protocol):
    async def create_task(self, title: str, description: Optional[str]) -> Todo: ...
    async def list_tasks(self) -> List[Todo]: ...
    async def update_task(self, todo_id: UUID, title: Optional[str], description: Optional[str]) -> Todo: ...
    async def delete_task(self, todo_id: UUID) -> None: ...
    async def toggle_completion(self, todo_id: UUID) -> Todo: ...
```

## State Transitions
- **Created**: `is_completed` is `False`.
- **Toggled**: `is_completed` flips between `True` and `False`.
- **Deleted**: Entry removed from the repository.
