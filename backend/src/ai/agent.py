"""Groq agent implementation with MCP tool integration."""

import asyncio
from typing import List, Dict, Any, AsyncGenerator
from uuid import UUID
from openai.types.chat import ChatCompletion, ChatCompletionChunk
from .client import groq_client
from .tools import get_mcp_tools, execute_tool_call


async def create_chat_completion(
    user_id: UUID, messages: List[Dict[str, str]], use_tools: bool = True
) -> ChatCompletion:
    """
    Create a chat completion with the AI assistant using Groq.

    This function sends the conversation history to Groq and receives
    a response. If use_tools is True, the assistant can invoke MCP tools
    to manage tasks.

    Features:
    - Automatic retry with exponential backoff on rate limits
    - 60 second timeout
    - Tool calling support for MCP tasks

    Args:
        user_id: User identifier for tool authorization
        messages: Conversation history in OpenAI format
        use_tools: Whether to enable MCP tool usage (default: True)

    Returns:
        ChatCompletion: Groq response with assistant message

    Example:
        >>> messages = [
        ...     {"role": "user", "content": "Create a task for tomorrow"}
        ... ]
        >>> response = await create_chat_completion(user_id, messages)
        >>> print(response.choices[0].message.content)
    """
    client = groq_client.get_client()
    model = groq_client.get_model()

    # Prepare request parameters
    params = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1000,
    }

    # Add MCP tools if enabled
    if use_tools:
        tools = get_mcp_tools()
        if tools:
            params["tools"] = tools
            params["tool_choice"] = "auto"

    # Create completion with retry logic
    response = await groq_client.create_completion_with_retry(**params)

    # Handle tool calls if present
    if response.choices[0].message.tool_calls:
        # Execute tool calls and get results
        tool_messages = []
        for tool_call in response.choices[0].message.tool_calls:
            result = await execute_tool_call(user_id, tool_call)
            tool_messages.append(
                {"role": "tool", "tool_call_id": tool_call.id, "content": result}
            )

        # Add assistant message with tool calls
        messages.append(
            {
                "role": "assistant",
                "content": response.choices[0].message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": tc.type,
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in response.choices[0].message.tool_calls
                ],
            }
        )

        # Add tool results
        messages.extend(tool_messages)

        # Get final response after tool execution
        response = await groq_client.create_completion_with_retry(
            model=model, messages=messages, temperature=0.7, max_tokens=1000
        )

    return response


async def stream_chat_completion(
    user_id: UUID, messages: List[Dict[str, str]], use_tools: bool = True
) -> AsyncGenerator[str, None]:
    """
    Stream a chat completion with the AI assistant using Groq.

    This function streams the assistant's response token by token,
    providing a better user experience for long responses.

    Args:
        user_id: User identifier for tool authorization
        messages: Conversation history in OpenAI format
        use_tools: Whether to enable MCP tool usage (default: True)

    Yields:
        str: Response tokens as they are generated

    Example:
        >>> async for token in stream_chat_completion(user_id, messages):
        ...     print(token, end="", flush=True)
    """
    client = groq_client.get_client()
    model = groq_client.get_model()

    # Prepare request parameters
    params = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1000,
        "stream": True,
    }

    # Add MCP tools if enabled
    if use_tools:
        tools = get_mcp_tools()
        if tools:
            params["tools"] = tools
            params["tool_choice"] = "auto"

    # Stream completion with retry
    response = await groq_client.create_completion_with_retry(**params)

    # Collect tool calls if present
    tool_calls = []
    current_tool_call = None

    async for chunk in response:
        if not chunk.choices:
            continue

        delta = chunk.choices[0].delta

        # Handle tool calls
        if delta.tool_calls:
            for tool_call_delta in delta.tool_calls:
                if tool_call_delta.index is not None:
                    # New tool call
                    if (
                        current_tool_call is None
                        or tool_call_delta.index != current_tool_call.get("index")
                    ):
                        if current_tool_call:
                            tool_calls.append(current_tool_call)
                        current_tool_call = {
                            "index": tool_call_delta.index,
                            "id": tool_call_delta.id or "",
                            "type": tool_call_delta.type or "function",
                            "function": {
                                "name": tool_call_delta.function.name or "",
                                "arguments": tool_call_delta.function.arguments or "",
                            },
                        }
                    else:
                        # Continue existing tool call
                        if tool_call_delta.function.arguments:
                            current_tool_call["function"]["arguments"] += (
                                tool_call_delta.function.arguments
                            )

        # Handle content
        if delta.content:
            yield delta.content

    # Add final tool call if present
    if current_tool_call:
        tool_calls.append(current_tool_call)

    # Execute tool calls if present
    if tool_calls:
        yield "\n\n[Executing tools...]\n\n"

        for tool_call in tool_calls:
            # Create tool call object
            from openai.types.chat.chat_completion_message_tool_call import (
                ChatCompletionMessageToolCall,
            )
            from openai.types.chat.chat_completion_message_tool_call import Function

            tc = ChatCompletionMessageToolCall(
                id=tool_call["id"],
                type=tool_call["type"],
                function=Function(
                    name=tool_call["function"]["name"],
                    arguments=tool_call["function"]["arguments"],
                ),
            )

            result = await execute_tool_call(user_id, tc)
            yield f"Tool: {tool_call['function']['name']}\nResult: {result}\n\n"
