"""MCP tool registry and implementations."""

from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from mcp.server import Server
from mcp.types import Tool, TextContent
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models import Task
from ..models.base import engine


def register_tools(server: Server) -> None:
    """
    Register all available tools with the MCP server.

    Tools are exposed to the AI assistant for task management operations.
    Each tool follows the MCP protocol specification for input/output.

    Args:
        server: MCP server instance to register tools with
    """

    @server.list_tools()
    async def list_tools() -> List[Tool]:
        """List all available tools for the AI assistant."""
        return [
            Tool(
                name="create_task",
                description="Create a new task for the user",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User ID (UUID format)",
                        },
                        "title": {"type": "string", "description": "Task title"},
                        "description": {
                            "type": "string",
                            "description": "Task description (optional)",
                        },
                        "due_date": {
                            "type": "string",
                            "description": "Due date in ISO format (optional)",
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                            "description": "Task priority (optional, default: medium)",
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Task tags (optional)",
                        },
                    },
                    "required": ["user_id", "title"],
                },
            ),
            Tool(
                name="list_tasks",
                description="List tasks for the user with optional filters",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User ID (UUID format)",
                        },
                        "status": {
                            "type": "string",
                            "enum": ["pending", "completed"],
                            "description": "Filter by status (optional)",
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                            "description": "Filter by priority (optional)",
                        },
                        "tag": {
                            "type": "string",
                            "description": "Filter by tag (optional)",
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum number of tasks to return (default: 50)",
                        },
                    },
                    "required": ["user_id"],
                },
            ),
            Tool(
                name="update_task",
                description="Update an existing task",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User ID (UUID format)",
                        },
                        "task_id": {
                            "type": "string",
                            "description": "Task ID (UUID format)",
                        },
                        "title": {
                            "type": "string",
                            "description": "New task title (optional)",
                        },
                        "description": {
                            "type": "string",
                            "description": "New task description (optional)",
                        },
                        "status": {
                            "type": "string",
                            "enum": ["pending", "completed"],
                            "description": "New task status (optional)",
                        },
                        "due_date": {
                            "type": "string",
                            "description": "New due date in ISO format (optional)",
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                            "description": "New task priority (optional)",
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "New task tags (optional)",
                        },
                    },
                    "required": ["user_id", "task_id"],
                },
            ),
            Tool(
                name="delete_task",
                description="Delete a task",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {
                            "type": "string",
                            "description": "User ID (UUID format)",
                        },
                        "task_id": {
                            "type": "string",
                            "description": "Task ID (UUID format)",
                        },
                    },
                    "required": ["user_id", "task_id"],
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
        """
        Execute a tool call from the AI assistant.

        Args:
            name: Tool name to execute
            arguments: Tool arguments as dictionary

        Returns:
            List[TextContent]: Tool execution results
        """
        if name == "create_task":
            return await _create_task(arguments)
        elif name == "list_tasks":
            return await _list_tasks(arguments)
        elif name == "update_task":
            return await _update_task(arguments)
        elif name == "delete_task":
            return await _delete_task(arguments)
        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]


async def _create_task(args: Dict[str, Any]) -> List[TextContent]:
    """Create a new task."""
    try:
        user_id_str = args.get("user_id", "")
        if not user_id_str:
            return [
                TextContent(
                    type="text",
                    text="Invalid user ID format. Please provide a valid UUID.",
                )
            ]

        try:
            user_id = UUID(user_id_str)
        except ValueError:
            return [
                TextContent(
                    type="text",
                    text="Invalid user ID format. Please provide a valid UUID.",
                )
            ]

        title = args.get("title", "").strip()
        if not title:
            return [
                TextContent(
                    type="text",
                    text="Task title cannot be empty. Please provide a title for the task.",
                )
            ]

        due_date = None
        if args.get("due_date"):
            try:
                due_date = datetime.fromisoformat(args["due_date"])
            except ValueError:
                return [
                    TextContent(
                        type="text",
                        text="Invalid date format. Please use ISO format (YYYY-MM-DD).",
                    )
                ]

        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with AsyncSession(engine) as session:
                    task = Task(
                        user_id=user_id,
                        title=title,
                        description=args.get("description"),
                        due_date=due_date,
                        priority=args.get("priority", "medium"),
                        tags=args.get("tags", []),
                    )
                    session.add(task)
                    await session.commit()
                    await session.refresh(task)

                    return [
                        TextContent(
                            type="text",
                            text=f"Task created successfully: '{task.title}' (ID: {task.id})",
                        )
                    ]
            except Exception:
                if attempt < max_retries - 1:
                    continue
                return [
                    TextContent(
                        type="text",
                        text="Unable to create task due to a database error. Please try again in a moment.",
                    )
                ]

        return [
            TextContent(
                type="text",
                text="An unexpected error occurred while creating the task. Please try again.",
            )
        ]
    except Exception:
        return [
            TextContent(
                type="text",
                text="An unexpected error occurred while creating the task. Please try again.",
            )
        ]


async def _list_tasks(args: Dict[str, Any]) -> List[TextContent]:
    """List tasks with optional filters."""
    try:
        user_id_str = args.get("user_id", "")
        if not user_id_str:
            return [
                TextContent(
                    type="text",
                    text="Invalid user ID format. Please provide a valid UUID.",
                )
            ]

        try:
            user_id = UUID(user_id_str)
        except ValueError:
            return [
                TextContent(
                    type="text",
                    text="Invalid user ID format. Please provide a valid UUID.",
                )
            ]

        limit = args.get("limit", 50)
        if not isinstance(limit, int) or limit < 1 or limit > 100:
            limit = 50

        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with AsyncSession(engine) as session:
                    statement = select(Task).where(Task.user_id == user_id)

                    status_filter = args.get("status")
                    priority_filter = args.get("priority")
                    tag_filter = args.get("tag")

                    if status_filter:
                        statement = statement.where(
                            Task.is_completed == (status_filter == "completed")
                        )
                    if priority_filter:
                        statement = statement.where(Task.priority == priority_filter)
                    if tag_filter:
                        statement = statement.where(Task.tags.contains([tag_filter]))

                    statement = statement.limit(limit)
                    result = await session.execute(statement)
                    tasks = result.scalars().all()

                    if not tasks:
                        filter_desc = ""
                        if status_filter or priority_filter or tag_filter:
                            filter_desc = " matching your filters"
                        return [
                            TextContent(
                                type="text",
                                text=f"No tasks found{filter_desc}. Would you like to create a new task?",
                            )
                        ]

                    task_list = []
                    for i, task in enumerate(tasks, 1):
                        status = "completed" if task.is_completed else "pending"
                        task_info = f"{i}. [{status}] {task.title}"
                        if task.due_date:
                            task_info += f" (Due: {task.due_date.strftime('%Y-%m-%d')})"
                        if getattr(task, "priority", "medium") != "medium":
                            task_info += f" [Priority: {task.priority}]"
                        if task.tags:
                            task_info += f" Tags: {', '.join(task.tags)}"
                        task_info += f" (ID: {task.id})"
                        task_list.append(task_info)

                    return [
                        TextContent(
                            type="text",
                            text=f"Found {len(tasks)} task(s):\n"
                            + "\n".join(task_list),
                        )
                    ]
            except Exception:
                if attempt < max_retries - 1:
                    continue
                return [
                    TextContent(
                        type="text",
                        text="Unable to retrieve tasks due to a database error. Please try again in a moment.",
                    )
                ]

        return [
            TextContent(
                type="text",
                text="An unexpected error occurred while listing tasks. Please try again.",
            )
        ]
    except Exception:
        return [
            TextContent(
                type="text",
                text="An unexpected error occurred while listing tasks. Please try again.",
            )
        ]


async def _update_task(args: Dict[str, Any]) -> List[TextContent]:
    """Update an existing task."""
    try:
        user_id_str = args.get("user_id", "")
        task_id_str = args.get("task_id", "")

        if not user_id_str or not task_id_str:
            return [
                TextContent(
                    type="text",
                    text="Invalid ID format. Please provide valid UUIDs for user and task.",
                )
            ]

        try:
            user_id = UUID(user_id_str)
            task_id = UUID(task_id_str)
        except ValueError:
            return [
                TextContent(
                    type="text",
                    text="Invalid ID format. Please provide valid UUIDs for user and task.",
                )
            ]

        updatable_fields = [
            "title",
            "description",
            "status",
            "priority",
            "tags",
            "due_date",
        ]
        has_updates = any(field in args for field in updatable_fields)
        if not has_updates:
            return [
                TextContent(
                    type="text",
                    text="No fields to update. Please specify what you'd like to change (title, description, status, priority, tags, or due_date).",
                )
            ]

        if "title" in args and not args["title"].strip():
            return [TextContent(type="text", text="Task title cannot be empty.")]

        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with AsyncSession(engine) as session:
                    statement = select(Task).where(
                        Task.id == task_id, Task.user_id == user_id
                    )
                    result = await session.execute(statement)
                    task = result.scalar_one_or_none()

                    if not task:
                        return [
                            TextContent(
                                type="text",
                                text="Task not found. It may have been deleted or you don't have permission to access it. Would you like to see your current tasks?",
                            )
                        ]

                    updates = []

                    if "title" in args:
                        task.title = args["title"]
                        updates.append("title")
                    if "description" in args:
                        task.description = args["description"]
                        updates.append("description")
                    if "status" in args:
                        task.is_completed = args["status"] == "completed"
                        updates.append("status")
                    if "priority" in args:
                        task.priority = args["priority"]
                        updates.append("priority")
                    if "tags" in args:
                        task.tags = args["tags"]
                        updates.append("tags")
                    if "due_date" in args:
                        try:
                            task.due_date = (
                                datetime.fromisoformat(args["due_date"])
                                if args["due_date"]
                                else None
                            )
                            updates.append("due date")
                        except ValueError:
                            return [
                                TextContent(
                                    type="text",
                                    text="Invalid date format. Please use ISO format (YYYY-MM-DD).",
                                )
                            ]

                    task.updated_at = datetime.utcnow()
                    session.add(task)
                    await session.commit()

                    update_desc = ", ".join(updates)
                    return [
                        TextContent(
                            type="text",
                            text=f"Task updated successfully: '{task.title}' (Updated: {update_desc})",
                        )
                    ]
            except Exception:
                if attempt < max_retries - 1:
                    continue
                return [
                    TextContent(
                        type="text",
                        text="Unable to update task due to a database error. Please try again in a moment.",
                    )
                ]

        return [
            TextContent(
                type="text",
                text="An unexpected error occurred while updating the task. Please try again.",
            )
        ]
    except Exception:
        return [
            TextContent(
                type="text",
                text="An unexpected error occurred while updating the task. Please try again.",
            )
        ]


async def _delete_task(args: Dict[str, Any]) -> List[TextContent]:
    """Delete a task."""
    try:
        user_id_str = args.get("user_id", "")
        task_id_str = args.get("task_id", "")

        if not user_id_str or not task_id_str:
            return [
                TextContent(
                    type="text",
                    text="Invalid ID format. Please provide valid UUIDs for user and task.",
                )
            ]

        try:
            user_id = UUID(user_id_str)
            task_id = UUID(task_id_str)
        except ValueError:
            return [
                TextContent(
                    type="text",
                    text="Invalid ID format. Please provide valid UUIDs for user and task.",
                )
            ]

        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with AsyncSession(engine) as session:
                    statement = select(Task).where(
                        Task.id == task_id, Task.user_id == user_id
                    )
                    result = await session.execute(statement)
                    task = result.scalar_one_or_none()

                    if not task:
                        return [
                            TextContent(
                                type="text",
                                text="Task not found. It may have already been deleted or you don't have permission to access it. Would you like to see your current tasks?",
                            )
                        ]

                    task_title = task.title
                    await session.delete(task)
                    await session.commit()

                    return [
                        TextContent(
                            type="text",
                            text=f"Task deleted successfully: '{task_title}'",
                        )
                    ]
            except Exception:
                if attempt < max_retries - 1:
                    continue
                return [
                    TextContent(
                        type="text",
                        text="Unable to delete task due to a database error. Please try again in a moment.",
                    )
                ]

        return [
            TextContent(
                type="text",
                text="An unexpected error occurred while deleting the task. Please try again.",
            )
        ]
    except Exception:
        return [
            TextContent(
                type="text",
                text="An unexpected error occurred while deleting the task. Please try again.",
            )
        ]
