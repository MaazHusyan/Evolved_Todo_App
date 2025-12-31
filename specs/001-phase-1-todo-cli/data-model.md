# Data Model: Phase 1.1 - Persistent & Intelligent Todo App

## Entities

### Todo (Updated)
Represents a single task in the system with intermediate organizational metadata.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | `UUID` | Unique identifier | Auto-generated (UUID v4) |
| `title` | `str` | Task summary | `min_length: 1`, `max_length: 100` |
| `description` | `str` | Detailed notes | Default: `""` |
| `priority` | `Priority` | Urgency level | Default: `MEDIUM` (Enum: `LOW`, `MEDIUM`, `HIGH`) |
| `tags` | `list[str]` | Organizational labels | Default: `[]`, Case-insensitive, Deduplicated |
| `is_completed` | `bool` | Status flag | Default: `False` |
| `due_date` | `Optional[datetime]` | Completion deadline | Placeholder for future Phase |

### Priority (Enum)
- `LOW`
- `MEDIUM`
- `HIGH`

## Interfaces (Contracts)

### ITaskRepository (No Change Required)
The existing interface supports all operations. Implementation will switch to `JSONTaskRepository`.

### ITaskEngine (Updated)
Business logic expanded for search, filtering, and sorting.

```python
class ITaskEngine(Protocol):
    # Existing methods...

    async def list_tasks(
        self,
        status: Optional[bool] = None,
        priority: Optional[Priority] = None,
        tag: Optional[str] = None,
        sort_by: Optional[str] = None  # ["alpha", "priority"]
    ) -> List[Todo]: ...

    async def search_tasks(self, keyword: str) -> List[Todo]: ...
```

## Storage Schema (JSON)
Tasks will be stored in `tasks.json` as a dictionary keyed by string UUID.

```json
{
  "uuid-string": {
    "id": "...",
    "title": "...",
    "description": "...",
    "priority": "medium",
    "tags": ["work", "home"],
    "is_completed": false
  }
}
```
