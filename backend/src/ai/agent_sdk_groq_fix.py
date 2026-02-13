"""Groq-compatible agent implementation without OpenAI Agents SDK.

This module provides a direct implementation using the OpenAI SDK
to work around Groq's strict schema validation requirements.
"""

import os
from typing import List, Dict, Any, Optional
from uuid import UUID
from agents import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Tool definitions with Groq-compatible schemas
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (UUID format)"
                    },
                    "title": {
                        "type": "string",
                        "description": "Task title"
                    },
                    "description": {
                        "type": "string",
                        "description": "Task description (optional)"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Due date in ISO format (optional)"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Task priority (optional, default: medium)"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Task tags (optional)"
                    }
                },
                "required": ["user_id", "title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List tasks for the user with optional filters",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (UUID format)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed"],
                        "description": "Filter by status (optional)"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Filter by priority (optional)"
                    },
                    "tag": {
                        "type": "string",
                        "description": "Filter by tag (optional)"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of tasks to return (default: 50)"
                    }
                },
                "required": ["user_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_task",
            "description": "Update an existing task",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (UUID format)"
                    },
                    "task_id": {
                        "type": "string",
                        "description": "Task ID (UUID format)"
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title (optional)"
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description (optional)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["pending", "completed"],
                        "description": "New task status (optional)"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "New due date in ISO format (optional)"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "New task priority (optional)"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "New task tags (optional)"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "User ID (UUID format)"
                    },
                    "task_id": {
                        "type": "string",
                        "description": "Task ID (UUID format)"
                    }
                },
                "required": ["user_id", "task_id"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are an intelligent task management assistant for the Evolve Todo App.

Help users manage their tasks efficiently through natural, conversational interactions.

## IMPORTANT: When to Use Tools

**ONLY use tools when the user explicitly requests task operations:**
- Creating tasks: "create a task", "add a task", "new task"
- Viewing tasks: "show my tasks", "list tasks", "what are my tasks"
- Updating tasks: "mark as done", "update task", "change priority"
- Deleting tasks: "delete task", "remove task"

**DO NOT use tools for:**
- Simple greetings: "hi", "hello", "hey"
- General questions: "how are you", "what can you do"
- Casual conversation that doesn't involve task management

## Available Tools (use only when needed):
1. create_task - Create new tasks
2. list_tasks - Retrieve and filter tasks
3. update_task - Modify existing tasks
4. delete_task - Remove tasks permanently

## Communication Style:
- Be conversational and natural
- Be concise yet informative
- Use appropriate emojis sparingly (✓ for success, 📋 for lists)
- For greetings, respond warmly without checking tasks
- Only mention task capabilities when relevant

Always confirm actions and provide clear feedback when performing task operations."""


async def execute_tool_call(tool_name: str, arguments: Dict[str, Any]) -> str:
    """Execute a tool call and return the result."""
    from ..todo_mcp.tools import _create_task, _list_tasks, _update_task, _delete_task

    try:
        if tool_name == "create_task":
            # Ensure all required fields have defaults
            args = {
                "user_id": arguments["user_id"],
                "title": arguments["title"],
                "description": arguments.get("description", ""),
                "due_date": arguments.get("due_date", ""),
                "priority": arguments.get("priority", "medium"),
                "tags": arguments.get("tags", [])
            }
            result = await _create_task(args)
            return result[0].text if result else "Task created successfully"

        elif tool_name == "list_tasks":
            args = {
                "user_id": arguments["user_id"],
                "status": arguments.get("status", ""),
                "priority": arguments.get("priority", ""),
                "tag": arguments.get("tag", ""),
                "limit": arguments.get("limit", 50)
            }
            result = await _list_tasks(args)
            return result[0].text if result else "No tasks found"

        elif tool_name == "update_task":
            args = {"user_id": arguments["user_id"], "task_id": arguments["task_id"]}
            if "title" in arguments: args["title"] = arguments["title"]
            if "description" in arguments: args["description"] = arguments["description"]
            if "status" in arguments: args["status"] = arguments["status"]
            if "due_date" in arguments: args["due_date"] = arguments["due_date"]
            if "priority" in arguments: args["priority"] = arguments["priority"]
            if "tags" in arguments: args["tags"] = arguments["tags"]

            result = await _update_task(args)
            return result[0].text if result else "Task updated successfully"

        elif tool_name == "delete_task":
            args = {
                "user_id": arguments["user_id"],
                "task_id": arguments["task_id"]
            }
            result = await _delete_task(args)
            return result[0].text if result else "Task deleted successfully"

        else:
            return f"Unknown tool: {tool_name}"

    except Exception as e:
        return f"Error executing {tool_name}: {str(e)}"


async def process_message_groq(
    user_id: UUID,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> str:
    """Process a user message using Groq with manual tool handling."""
    try:
        groq_api_key = os.getenv("GROQ_API_KEY")
        groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

        if not groq_api_key:
            return "Groq API key not configured. Please add GROQ_API_KEY to your .env file."

        client = AsyncOpenAI(
            api_key=groq_api_key,
            base_url="https://api.groq.com/openai/v1"
        )

        # Build messages
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-10:]:
                messages.append({"role": msg["role"], "content": msg["content"]})

        # Add current message with user_id context
        messages.append({
            "role": "user",
            "content": f"User ID: {user_id}\n\n{message}"
        })

        # Make initial request with tools
        response = await client.chat.completions.create(
            model=groq_model,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=1000
        )

        response_message = response.choices[0].message

        # Check if the model wants to call tools
        if response_message.tool_calls:
            # Add assistant's response to messages
            messages.append(response_message)

            # Execute each tool call
            for tool_call in response_message.tool_calls:
                import json
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                # Execute the tool
                tool_response = await execute_tool_call(function_name, function_args)

                # Add tool response to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": function_name,
                    "content": tool_response
                })

            # Get final response from the model
            final_response = await client.chat.completions.create(
                model=groq_model,
                messages=messages,
                max_tokens=1000
            )

            return final_response.choices[0].message.content

        # No tool calls, return direct response
        return response_message.content

    except Exception as e:
        error_str = str(e).lower()

        if "429" in error_str or "rate limit" in error_str:
            return "I apologize, but the AI service is at capacity. Please try again in a moment."
        elif "timeout" in error_str:
            return "The request timed out. Please try again."
        elif "api key" in error_str or "authentication" in error_str:
            return "There's an authentication issue with the AI service. Please contact support."
        else:
            print(f"Error in process_message_groq: {e}")
            return "I apologize, but I encountered an error. Please try again in a moment."


async def stream_message_groq(
    user_id: UUID,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
):
    """
    Stream a response using Groq with manual tool handling.

    Note: Groq doesn't support true streaming with tool calls, so we process
    the full response and yield it in chunks for a streaming-like experience.
    """
    try:
        # Get the full response
        full_response = await process_message_groq(user_id, message, conversation_history)

        # Yield the response in chunks for streaming effect
        chunk_size = 10  # characters per chunk
        for i in range(0, len(full_response), chunk_size):
            chunk = full_response[i:i + chunk_size]
            yield chunk

    except Exception as e:
        error_str = str(e).lower()
        if "429" in error_str or "rate limit" in error_str:
            yield "I apologize, but the AI service is at capacity. Please try again in a moment."
        else:
            print(f"Error in stream_message_groq: {e}")
            yield "I apologize, but I encountered an error. Please try again."
