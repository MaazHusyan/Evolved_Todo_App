"""OpenAI Agents SDK implementation with MCP server integration.

This module provides the main agent implementation using the OpenAI Agents SDK,
connecting to the MCP server for task management tools.
Supports both Gemini API and OpenRouter as providers.
"""

import os
from typing import List, Dict, Any, Optional
from uuid import UUID

# Import agents using absolute import to ensure we get the right package
import agents
from agents import Agent, Runner

# Use a workaround to import MCPServerStreamableHttp after agents is in sys.modules
import importlib

agents_mcp = importlib.import_module("agents.mcp")
MCPServerStreamableHttp = getattr(agents_mcp, "MCPServerStreamableHttp", None)

if MCPServerStreamableHttp is None:
    # Try finding it in a different location
    from agents.mcp.server import MCPServerStreamableHttp

from .config_sdk import agents_config


# System instructions for the Todo Assistant
SYSTEM_INSTRUCTIONS = """You are an intelligent task management assistant for the Evolve Todo App, powered by Gemini AI.

## Your Core Purpose
Help users manage their tasks efficiently through natural, conversational interactions. You have direct access to their task database through specialized tools.

## Available Tools & Capabilities
You have access to these MCP (Model Context Protocol) tools:

1. **create_task** - Create new tasks
   - Required: user_id, title
   - Optional: description, due_date (ISO format), priority (low/medium/high), tags (array)

2. **list_tasks** - Retrieve and filter tasks
   - Required: user_id
   - Optional filters: status (pending/completed), priority, tag, limit

3. **update_task** - Modify existing tasks
   - Required: user_id, task_id
   - Optional: title, description, status, due_date, priority, tags

4. **delete_task** - Remove tasks permanently
   - Required: user_id, task_id

## Interaction Guidelines

### 1. Communication Style
- **Be conversational and natural** - Avoid robotic or overly formal language
- **Be concise yet informative** - Provide clear responses without unnecessary verbosity
- **Use appropriate emojis sparingly** - ✓ for success, 📋 for lists, ⚠️ for warnings
- **Maintain a helpful, supportive tone** - You're a productivity partner, not just a tool

### 2. Context Awareness & Memory
- **Track conversation context** - Remember task IDs, titles, and details from recent messages
- **Handle references intelligently** - When users say "the first one", "that task", or "it", use context to identify the correct task
- **Maintain task state awareness** - Know what was just created, updated, or completed
- **Use conversation history** - Reference previous interactions to provide continuity

### 3. Task Management Best Practices
- **Confirm all actions** - Always acknowledge task creation, updates, or deletions
- **Provide task summaries** - When listing tasks, show key details (status, priority, due date)
- **Suggest next actions** - Proactively offer helpful follow-ups
- **Handle ambiguity gracefully** - Ask clarifying questions when user intent is unclear

### 4. Error Handling
- **Explain errors in plain language** - Translate technical errors into user-friendly messages
- **Offer solutions** - When something fails, suggest alternatives or fixes
- **Never expose technical details** - Keep error messages user-focused

### 5. Proactive Assistance
- **Anticipate needs** - Suggest related actions (e.g., "Would you like to see your other high-priority tasks?")
- **Provide context** - When showing tasks, mention relevant details like upcoming due dates
- **Offer organization tips** - Suggest using tags, priorities, or due dates when appropriate

## Response Format Examples

### Task Creation
User: "Add a task to buy groceries tomorrow"
You: "✓ I've created a task 'Buy groceries' with a due date of tomorrow (2026-02-13). Would you like to add any details or set a priority level?"

### Task Listing
User: "Show me my high priority tasks"
You: "Here are your high priority tasks:

📋 **High Priority Tasks** (2 tasks)
1. ⏳ Submit quarterly report - Due: Feb 12, 2026
2. ⏳ Call important client - Due: Feb 11, 2026 (overdue!)

Would you like to work on any of these?"

### Task Update with Context
User: "Mark the first one as done"
You: "✓ Excellent! I've marked 'Submit quarterly report' as completed. You now have 1 high priority task remaining. Keep up the great work!"

### Handling Ambiguity
User: "Update that task"
You: "I'd be happy to help update a task! Could you clarify which task you'd like to update? You can refer to it by:
- Task title (e.g., 'the grocery task')
- Position in the last list (e.g., 'the first one')
- Or I can show you your recent tasks"

## Important Constraints
- **Always use the provided user_id** - Never create tasks for the wrong user
- **Validate task IDs** - Ensure task IDs exist before attempting updates or deletions
- **Respect data privacy** - Only access tasks belonging to the authenticated user
- **Handle tool failures gracefully** - If a tool call fails, explain the issue and suggest alternatives

## Conversation Flow
1. **Understand intent** - Parse what the user wants to accomplish
2. **Gather information** - Ask for missing required details
3. **Execute action** - Use appropriate tools with correct parameters
4. **Confirm result** - Clearly communicate what was done
5. **Suggest next steps** - Offer relevant follow-up actions

Remember: Your goal is to make task management feel effortless and natural. Be helpful, be clear, and be proactive in assisting users achieve their productivity goals."""


async def create_agent_with_tools() -> Agent:
    """
    Create an agent with direct tool integration.

    Returns:
        Agent: Agent instance with task management tools

    Raises:
        Exception: If agent creation fails
    """
    from agents import function_tool
    from ..todo_mcp.tools import _create_task, _list_tasks, _update_task, _delete_task

    # Define tools using function_tool decorator with schema patching
    @function_tool
    async def create_task(user_id: str, title: str, description: str = "", due_date: str = "", priority: str = "medium", tags: List[str] = []):
        """Create a new task for the user.

        Args:
            user_id: User ID (UUID format)
            title: Task title
            description: Task description (optional)
            due_date: Due date in ISO format (optional)
            priority: Task priority - low, medium, or high (optional, default: medium)
            tags: Task tags (optional)
        """
        result = await _create_task({
            "user_id": user_id,
            "title": title,
            "description": description,
            "due_date": due_date,
            "priority": priority,
            "tags": tags
        })
        return result[0].text if result else "Task created"

    @function_tool
    async def list_tasks(user_id: str, status: str = "", priority: str = "", tag: str = "", limit: int = 50):
        """List tasks for the user with optional filters.

        Args:
            user_id: User ID (UUID format)
            status: Filter by status - pending or completed (optional)
            priority: Filter by priority - low, medium, or high (optional)
            tag: Filter by tag (optional)
            limit: Maximum number of tasks to return (default: 50)
        """
        result = await _list_tasks({
            "user_id": user_id,
            "status": status,
            "priority": priority,
            "tag": tag,
            "limit": limit
        })
        return result[0].text if result else "No tasks found"

    @function_tool
    async def update_task(user_id: str, task_id: str, title: str = "", description: str = "", status: str = "", due_date: str = "", priority: str = "", tags: List[str] = []):
        """Update an existing task.

        Args:
            user_id: User ID (UUID format)
            task_id: Task ID (UUID format)
            title: New task title (optional)
            description: New task description (optional)
            status: New task status - pending or completed (optional)
            due_date: New due date in ISO format (optional)
            priority: New task priority - low, medium, or high (optional)
            tags: New task tags (optional)
        """
        args = {"user_id": user_id, "task_id": task_id}
        if title: args["title"] = title
        if description: args["description"] = description
        if status: args["status"] = status
        if due_date: args["due_date"] = due_date
        if priority: args["priority"] = priority
        if tags: args["tags"] = tags

        result = await _update_task(args)
        return result[0].text if result else "Task updated"

    @function_tool
    async def delete_task(user_id: str, task_id: str):
        """Delete a task.

        Args:
            user_id: User ID (UUID format)
            task_id: Task ID (UUID format)
        """
        result = await _delete_task({
            "user_id": user_id,
            "task_id": task_id
        })
        return result[0].text if result else "Task deleted"

    # Patch the schemas to mark optional parameters correctly
    # Fix create_task schema
    if "required" in create_task.params_json_schema:
        create_task.params_json_schema["required"] = ["user_id", "title"]

    # Fix list_tasks schema
    if "required" in list_tasks.params_json_schema:
        list_tasks.params_json_schema["required"] = ["user_id"]

    # Fix update_task schema
    if "required" in update_task.params_json_schema:
        update_task.params_json_schema["required"] = ["user_id", "task_id"]

    # delete_task is already correct (both params required)

    agent = Agent(
        name="Todo Assistant",
        instructions=SYSTEM_INSTRUCTIONS,
        tools=[create_task, list_tasks, update_task, delete_task],
    )

    return agent


async def process_message_sdk(
    user_id: UUID,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> str:
    """
    Process a user message using the OpenAI Agents SDK with Gemini.

    This function creates an agent with direct tool integration, builds context
    from conversation history, and processes the user's message.

    Args:
        user_id: User identifier for authorization
        message: User's message to process
        conversation_history: Optional list of previous messages for context

    Returns:
        str: Assistant's response

    Example:
        >>> response = await process_message_sdk(
        ...     user_id=UUID("..."),
        ...     message="Show me my tasks",
        ...     conversation_history=[
        ...         {"role": "user", "content": "Add a task"},
        ...         {"role": "assistant", "content": "Task created"}
        ...     ]
        ... )
        >>> print(response)
    """
    try:
        provider_name = agents_config.get_provider_name()
        print(f"Processing message with {provider_name}...")

        agent = await create_agent_with_tools()

        context_messages = []
        if conversation_history:
            for msg in conversation_history[-10:]:
                context_messages.append(f"{msg['role']}: {msg['content']}")

        full_message = f"User ID: {user_id}\n\n"

        if context_messages:
            full_message += "Previous conversation:\n"
            full_message += "\n".join(context_messages)
            full_message += "\n\nCurrent message:\n"

        full_message += message

        result = await Runner.run(
            agent,
            full_message,
            run_config=agents_config.get_config(),
        )

        return result.final_output

    except Exception as e:
        error_str = str(e).lower()

        if "429" in error_str or "rate limit" in error_str or "quota" in error_str:
            return (
                "I apologize, but the AI service is currently at capacity. "
                "Please try again in a moment. This is usually resolved within a few seconds."
            )
        elif "timeout" in error_str:
            return (
                "The request timed out. Please try again with a simpler request "
                "or wait a moment before retrying."
            )
        elif "api key" in error_str or "authentication" in error_str:
            return (
                "There's an authentication issue with the AI service. "
                "Please contact support if this persists."
            )
        else:
            print(f"Error in process_message_sdk: {e}")
            return (
                "I apologize, but I encountered an error while processing your request. "
                "Please try again in a moment. If the problem persists, please contact support."
            )


async def stream_message_sdk(
    user_id: UUID,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
):
    """
    Stream a response using the OpenAI Agents SDK with Gemini.

    This function streams the assistant's response token by token for better UX.

    Args:
        user_id: User identifier for authorization
        message: User's message to process
        conversation_history: Optional list of previous messages for context

    Yields:
        str: Response tokens as they are generated

    Example:
        >>> async for token in stream_message_sdk(user_id, "List my tasks"):
        ...     print(token, end="", flush=True)
    """
    try:
        provider_name = agents_config.get_provider_name()
        print(f"Streaming message with {provider_name}...")

        agent = await create_agent_with_tools()

        context_messages = []
        if conversation_history:
            for msg in conversation_history[-10:]:
                context_messages.append(f"{msg['role']}: {msg['content']}")

        full_message = f"User ID: {user_id}\n\n"
        if context_messages:
            full_message += "Previous conversation:\n"
            full_message += "\n".join(context_messages)
            full_message += "\n\nCurrent message:\n"
        full_message += message

        result = Runner.run_streamed(
            agent,
            full_message,
            run_config=agents_config.get_config(),
        )

        async for event in result.stream_events():
            if event.type == "run_item_stream_event":
                if hasattr(event, "item") and event.item:
                    item = event.item
                    if hasattr(item, "content") and item.content:
                        if hasattr(item.content, "text") and item.content.text:
                            yield item.content.text.value
                        elif isinstance(item.content, str):
                            yield item.content

    except Exception as e:
        error_str = str(e).lower()
        if "429" in error_str or "rate limit" in error_str:
            yield "I apologize, but the AI service is at capacity. Please try again later."
        else:
            print(f"Error in stream_message_sdk: {e}")
            yield "I apologize, but I encountered an error. Please try again."
