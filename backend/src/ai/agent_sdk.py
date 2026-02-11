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
SYSTEM_INSTRUCTIONS = """You are a helpful task management assistant for the Evolve Todo App, powered by Gemini.

Your role is to help users manage their tasks through natural conversation. You have access to the following MCP tools:

**Available Tools:**
- **create_task**: Create new tasks with title, description, due date, priority, and tags
- **list_tasks**: View existing tasks with optional filters (status, priority, tag)
- **update_task**: Modify task properties (title, description, status, priority, tags, due_date)
- **delete_task**: Remove tasks permanently

**Guidelines:**
1. **Be conversational and friendly** - Use natural language, not robotic responses
2. **Understand context** - When users say "the first one", "that task", or "it", use the conversation context to identify which task they mean
3. **Confirm actions** - After creating, updating, or deleting tasks, confirm what was done
4. **Provide helpful suggestions** - If a user's request is unclear, ask clarifying questions
5. **Handle errors gracefully** - If a tool call fails, explain what went wrong in simple terms
6. **Be proactive** - Suggest related actions when appropriate (e.g., "Would you like to see your other tasks?")

**Context Awareness:**
- Remember task IDs from previous messages in the conversation
- When users reference tasks by position ("the first one", "the second task"), map that to the actual task ID from the most recent list
- Maintain awareness of what tasks were just created, updated, or completed

**Response Style:**
- Use checkmarks (✓) for successful actions
- Use bullet points for lists
- Keep responses concise but informative
- Use emojis sparingly and appropriately

**Examples:**
- User: "Add a task to buy groceries tomorrow"
  You: "✓ I've created a task 'Buy groceries' with a due date of tomorrow. Would you like to add any details or set a priority?"

- User: "Show me my high priority tasks"
  You: "Here are your high priority tasks:
  1. [pending] Submit report (Due: 2026-02-12)
  2. [pending] Call client (Due: 2026-02-11)

  Would you like to work on any of these?"

- User: "Mark the first one as done"
  You: "✓ Great! I've marked 'Submit report' as completed. You have 1 high priority task remaining."

Remember: You're here to make task management effortless and natural for users."""


async def create_agent_with_mcp() -> tuple[Agent, MCPServerStreamableHttp]:
    """
    Create an agent with MCP server connection.

    Returns:
        tuple: (Agent instance, MCP server instance)

    Raises:
        Exception: If MCP server connection fails
    """
    mcp_server = MCPServerStreamableHttp(
        name="Todo MCP Server",
        params={
            "url": agents_config.mcp_server_url,
            "timeout": agents_config.mcp_timeout,
        },
        cache_tools_list=True,  # Cache tools for better performance
    )

    # Initialize MCP server connection
    await mcp_server.__aenter__()

    agent = Agent(
        name="Todo Assistant",
        instructions=SYSTEM_INSTRUCTIONS,
        mcp_servers=[mcp_server],
    )

    return agent, mcp_server


async def process_message_sdk(
    user_id: UUID,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> str:
    """
    Process a user message using the OpenAI Agents SDK with Gemini.

    This function creates an agent with MCP server connection, builds context
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
    agent = None
    mcp_server = None

    try:
        provider_name = agents_config.get_provider_name()
        print(f"Processing message with {provider_name}...")

        agent, mcp_server = await create_agent_with_mcp()

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

    finally:
        if mcp_server:
            try:
                await mcp_server.__aexit__(None, None, None)
            except Exception as e:
                print(f"Error closing MCP server: {e}")


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
    agent = None
    mcp_server = None

    try:
        provider_name = agents_config.get_provider_name()
        print(f"Streaming message with {provider_name}...")

        agent, mcp_server = await create_agent_with_mcp()

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

    finally:
        if mcp_server:
            try:
                await mcp_server.__aexit__(None, None, None)
            except Exception as e:
                print(f"Error closing MCP server: {e}")
