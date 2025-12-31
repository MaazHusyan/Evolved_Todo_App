class TaskError(Exception):
    """Base exception for Task related errors."""
    pass

class TaskNotFoundError(TaskError):
    """Raised when a task is not found in the repository."""
    def __init__(self, task_id: str):
        self.task_id = task_id
        super().__init__(f"Task with ID {task_id} not found.")

class RepositoryError(TaskError):
    """Raised when a repository operation fails."""
    pass
