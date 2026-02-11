"""Agent handoffs for specialized task management.

This module provides specialized agents for different types of task management
conversations, enabling more focused and effective assistance.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from agents import Agent, handoff
from agents.mcp import MCPServerStreamableHttp
from .config_sdk import agents_config
from .agent_sdk import create_agent_with_mcp, SYSTEM_INSTRUCTIONS

TASK_CREATION_AGENT_INSTRUCTIONS = """You are a Task Creation Specialist for the Evolve Todo App.

Your specialty is helping users create well-structured tasks with:
- Clear, concise titles
- Detailed descriptions when needed
- Appropriate due dates and times
- Correct priority levels (low, medium, high, urgent)
- Relevant tags for organization

When creating tasks:
1. Confirm the task details with the user before creating
2. Suggest improvements to titles for clarity
3. Ask about due dates if not specified
4. Recommend appropriate priority levels based on context
5. Suggest useful tags for categorization

Example interaction:
- User: "Remind me to call mom"
- You: "I'll help you create that task! Should I set a due date? And what's the priority - would you say it's medium, or does it need to be higher?"

Remember: Your goal is to ensure every task is well-formed and ready for action."""

TASK_MANAGEMENT_AGENT_INSTRUCTIONS = """You are a Task Management Specialist for the Evolve Todo App.

Your specialty is helping users manage their existing tasks:
- Listing and filtering tasks
- Completing and updating tasks
- Deleting tasks when no longer needed
- Organizing tasks by priority, status, or tags
- Finding specific tasks quickly

When managing tasks:
1. Always confirm which task the user means (especially with references like "the first one")
2. Show task lists in a clear, numbered format
3. Highlight urgent or overdue tasks
4. Offer to show related tasks (same priority, same tags)
5. Ask for confirmation before completing or deleting

Example interaction:
- User: "What do I have to do today?"
- You: "Here are your pending tasks for today:
  1. [High] Submit report (Due: 5pm)
  2. [Medium] Call client (Due: tomorrow)
  3. [Low] Read article

Which would you like to work on, or shall I mark any as done?"

Remember: Your goal is to help users stay on top of their tasks without feeling overwhelmed."""

GENERAL_ASSISTANT_INSTRUCTIONS = """You are a General Assistant for the Evolve Todo App.

You can help with:
- Answering questions about the app
- Providing productivity tips
- General conversation and encouragement
- Explaining how to use features

For specific task operations, delegate to the appropriate specialist:
- Task creation → Task Creation Specialist
- Task management → Task Management Specialist

Example interaction:
- User: "How do I use tags?"
- You: "Tags are a great way to organize your tasks! You can:
  1. Add tags when creating a task
  2. Filter tasks by tag in your task list
  3. Search for all tasks with a specific tag

Would you like me to show you how to add tags to a task?"""


async def create_task_creation_agent() -> Agent:
    """Create the Task Creation Specialist agent."""
    mcp_server = MCPServerStreamableHttp(
        name="Todo MCP Server",
        params={
            "url": agents_config.mcp_server_url,
            "timeout": agents_config.mcp_timeout,
        },
        cache_tools_list=True,
    )

    await mcp_server.__aenter__()

    agent = Agent(
        name="Task Creation Specialist",
        instructions=TASK_CREATION_AGENT_INSTRUCTIONS,
        mcp_servers=[mcp_server],
    )

    return agent


async def create_task_management_agent() -> Agent:
    """Create the Task Management Specialist agent."""
    mcp_server = MCPServerStreamableHttp(
        name="Todo MCP Server",
        params={
            "url": agents_config.mcp_server_url,
            "timeout": agents_config.mcp_timeout,
        },
        cache_tools_list=True,
    )

    await mcp_server.__aenter__()

    agent = Agent(
        name="Task Management Specialist",
        instructions=TASK_MANAGEMENT_AGENT_INSTRUCTIONS,
        mcp_servers=[mcp_server],
    )

    return agent


async def create_general_assistant_agent() -> Agent:
    """Create the General Assistant agent."""
    mcp_server = MCPServerStreamableHttp(
        name="Todo MCP Server",
        params={
            "url": agents_config.mcp_server_url,
            "timeout": agents_config.mcp_timeout,
        },
        cache_tools_list=True,
    )

    await mcp_server.__aenter__()

    agent = Agent(
        name="General Assistant",
        instructions=GENERAL_ASSISTANT_INSTRUCTIONS,
        mcp_servers=[mcp_server],
    )

    return agent


def classify_message(
    message: str, conversation_history: Optional[List[Dict[str, str]]] = None
) -> str:
    """Classify a user message to determine the appropriate agent.

    Args:
        message: The users message
        conversation_history: Previous messages for context

    Returns:
        Agent type: "task_creation", "task_management", or "general"
    """
    message_lower = message.lower()

    # Task creation keywords
    creation_keywords = [
        "add",
        "create",
        "new task",
        "remind me",
        "schedule",
        "plan to",
        "i need to",
        "i should",
        "i want to",
        "make a task",
    ]

    # Task management keywords
    management_keywords = [
        "show",
        "list",
        "view",
        "what do i have",
        "what's on my list",
        "mark",
        "complete",
        "done",
        "finished",
        "update",
        "change",
        "delete",
        "remove",
        "cancel",
        "priority",
        "overdue",
        "urgent",
    ]

    # Check for creation intent
    for keyword in creation_keywords:
        if keyword in message_lower:
            # Distinguish from management
            if any(
                mgmt in message_lower
                for mgmt in ["mark as done", "complete task", "show me"]
            ):
                continue
            return "task_creation"

    # Check for management intent
    for keyword in management_keywords:
        if keyword in message_lower:
            return "task_management"

    return "general"


async def process_with_handoffs(
    user_id: UUID,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> str:
    """Process a message using agent handoffs.

    This function classifies the message and routes it to the appropriate
    specialized agent for better task handling.

    Args:
        user_id: User identifier
        message: The users message
        conversation_history: Previous messages for context

    Returns:
        Assistants response
    """
    from agents import Runner

    # Classify the message
    agent_type = classify_message(message, conversation_history)

    agent = None
    mcp_server = None

    try:
        # Create the appropriate agent
        if agent_type == "task_creation":
            print("Routing to Task Creation Specialist...")
            agent = await create_task_creation_agent()
        elif agent_type == "task_management":
            print("Routing to Task Management Specialist...")
            agent = await create_task_management_agent()
        else:
            print("Routing to General Assistant...")
            agent = await create_general_assistant_agent()

        # Build context
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

        # Run the agent
        result = await Runner.run(
            agent,
            full_message,
            config=agents_config.get_config(),
        )

        return result.final_output

    except Exception as e:
        print(f"Error in handoff agent: {e}")
        # Fallback to main agent
        from .agent_sdk import process_message_sdk

        return await process_message_sdk(user_id, message, conversation_history)

    finally:
        if mcp_server:
            try:
                await mcp_server.__aexit__(None, None, None)
            except Exception as e:
                print(f"Error closing MCP server: {e}")
