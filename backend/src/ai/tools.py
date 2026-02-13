"""MCP tool definitions and execution for OpenAI integration."""

from typing import List, Dict, Any
from uuid import UUID
import json
from openai.types.chat.chat_completion_message_tool_call import (
    ChatCompletionMessageToolCall,
)
from ..todo_mcp.tools import _create_task, _list_tasks, _update_task, _delete_task


def get_mcp_tools() -> List[Dict[str, Any]]:
    """
    Get MCP tool definitions in OpenAI function calling format.

    These tools allow the AI assistant to manage tasks on behalf of
    the user. Each tool is defined with a JSON schema that OpenAI
    uses to generate appropriate function calls.

    Returns:
        List[Dict[str, Any]]: Tool definitions for OpenAI
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "create_task",
                "description": "Create a new task for the user",
                "parameters": {
                    "type": "object",
                    "properties": {
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
                    "required": ["title"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "list_tasks",
                "description": "List tasks for the user with optional filters",
                "parameters": {
                    "type": "object",
                    "properties": {
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
                    "required": [],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "update_task",
                "description": "Update an existing task",
                "parameters": {
                    "type": "object",
                    "properties": {
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
                    "required": ["task_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "delete_task",
                "description": "Delete a task",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": {
                            "type": "string",
                            "description": "Task ID (UUID format)",
                        }
                    },
                    "required": ["task_id"],
                },
            },
        },
    ]


async def execute_tool_call(
    user_id: UUID, tool_call: ChatCompletionMessageToolCall
) -> str:
    """
    Execute a tool call from OpenAI.

    This function bridges OpenAI's function calling with the MCP tool
    implementations. It parses the tool call arguments and invokes the
    appropriate MCP tool function.

    Args:
        user_id: User identifier for authorization
        tool_call: OpenAI tool call object

    Returns:
        str: Tool execution result as text

    Example:
        >>> result = await execute_tool_call(user_id, tool_call)
        >>> print(result)
    """
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)

    # Add user_id to arguments for authorization
    arguments["user_id"] = str(user_id)

    # Execute the appropriate tool
    if function_name == "create_task":
        result = await _create_task(arguments)
    elif function_name == "list_tasks":
        result = await _list_tasks(arguments)
    elif function_name == "update_task":
        result = await _update_task(arguments)
    elif function_name == "delete_task":
        result = await _delete_task(arguments)
    else:
        return f"Unknown tool: {function_name}"

    # Extract text from TextContent result
    if result and len(result) > 0:
        return result[0].text
    return "Tool executed successfully"
