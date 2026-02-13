# MCP Integration Guide

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). It enables AI agents to interact with external tools, data sources, and services in a consistent way.

## MCP in Evolve Todo

The Evolve Todo application uses MCP to enable the AI chatbot to interact with the task management system. This allows the chatbot to:

- Create, read, update, and delete tasks
- Search and filter tasks
- Access user context and preferences
- Execute complex task operations

## MCP Architecture

```
┌─────────────────┐
│   AI Agent      │
│  (Claude SDK)   │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼────────┐
│  MCP Server     │
│  (FastAPI)      │
└────────┬────────┘
         │
         │ Database Operations
         │
┌────────▼────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

## MCP Tools Implementation

### 1. Tool Definition

Each MCP tool is defined with:
- **Name**: Unique identifier for the tool
- **Description**: What the tool does
- **Parameters**: Input schema (JSON Schema)
- **Handler**: Function that executes the tool

Example tool definition:

```python
@mcp_server.tool()
async def create_task(
    title: str,
    description: str = "",
    due_date: Optional[str] = None,
    priority: str = "medium"
) -> dict:
    """
    Create a new task.

    Args:
        title: Task title (required)
        description: Task description (optional)
        due_date: Due date in ISO format (optional)
        priority: Task priority (low, medium, high)

    Returns:
        Created task object
    """
    # Implementation
    pass
```

### 2. Available Tools

#### Task Management Tools

**create_task**
- Creates a new task with specified properties
- Parameters: title, description, due_date, priority
- Returns: Created task object

**list_tasks**
- Lists tasks with optional filtering
- Parameters: status, priority, limit, offset
- Returns: Array of task objects

**update_task**
- Updates an existing task
- Parameters: task_id, title, description, due_date, priority, status
- Returns: Updated task object

**delete_task**
- Deletes a task by ID
- Parameters: task_id
- Returns: Success confirmation

**mark_complete**
- Marks a task as complete
- Parameters: task_id
- Returns: Updated task object

**search_tasks**
- Searches tasks by keywords
- Parameters: query, limit
- Returns: Array of matching tasks

#### Context Tools

**get_user_context**
- Retrieves user information and preferences
- Parameters: user_id
- Returns: User context object

## MCP Server Setup

### 1. Server Configuration

```python
from mcp import MCPServer

# Initialize MCP server
mcp_server = MCPServer(
    name="evolve-todo-mcp",
    version="1.0.0",
    description="MCP server for Evolve Todo task management"
)

# Register tools
@mcp_server.tool()
async def create_task(...):
    pass

# Start server
await mcp_server.start()
```

### 2. Integration with FastAPI

```python
from fastapi import FastAPI
from mcp import MCPServer

app = FastAPI()
mcp_server = MCPServer()

@app.post("/chat")
async def chat_endpoint(message: str):
    # Agent uses MCP tools to process message
    response = await agent.run(message, tools=mcp_server.tools)
    return response
```

## Agent Configuration

### 1. Claude Agent SDK Setup

```python
from anthropic import Anthropic
from mcp import MCPClient

# Initialize Anthropic client
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Initialize MCP client
mcp_client = MCPClient(server_url="http://localhost:8000/mcp")

# Create agent with MCP tools
agent = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    tools=mcp_client.get_tools(),
    messages=[{"role": "user", "content": "Create a task"}]
)
```

### 2. Tool Execution Flow

1. User sends message to chatbot
2. Agent analyzes message and determines required tools
3. Agent calls MCP tools with appropriate parameters
4. MCP server executes tool and returns result
5. Agent processes result and generates response
6. Response is sent back to user

## Error Handling

### Tool Execution Errors

```python
@mcp_server.tool()
async def create_task(title: str, **kwargs):
    try:
        # Validate input
        if not title or len(title) < 3:
            raise ValueError("Title must be at least 3 characters")

        # Execute operation
        task = await db.create_task(title=title, **kwargs)
        return task

    except ValueError as e:
        return {"error": str(e), "type": "validation_error"}
    except DatabaseError as e:
        return {"error": "Database operation failed", "type": "database_error"}
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {"error": "Internal server error", "type": "server_error"}
```

## Testing MCP Tools

### Unit Tests

```python
import pytest
from mcp import MCPServer

@pytest.mark.asyncio
async def test_create_task():
    server = MCPServer()

    result = await server.call_tool(
        "create_task",
        title="Test task",
        description="Test description"
    )

    assert result["title"] == "Test task"
    assert result["description"] == "Test description"
```

### Integration Tests

```python
@pytest.mark.asyncio
async def test_agent_with_mcp():
    agent = create_agent_with_mcp()

    response = await agent.run("Create a task to buy groceries")

    assert "task" in response
    assert response["task"]["title"] == "Buy groceries"
```

## Security Best Practices

### 1. Authentication
- Verify user identity before tool execution
- Pass user context to all tool calls
- Implement role-based access control

### 2. Input Validation
- Validate all tool parameters
- Sanitize user inputs
- Implement parameter type checking

### 3. Rate Limiting
- Limit tool calls per user
- Implement request throttling
- Monitor for abuse patterns

### 4. Audit Logging
- Log all tool executions
- Track user actions
- Monitor for suspicious activity

## Performance Optimization

### 1. Caching
```python
from functools import lru_cache

@lru_cache(maxsize=100)
async def get_user_context(user_id: str):
    # Cache user context for faster access
    return await db.get_user(user_id)
```

### 2. Batch Operations
```python
@mcp_server.tool()
async def batch_update_tasks(task_ids: list[str], updates: dict):
    # Update multiple tasks in a single operation
    return await db.update_many(task_ids, updates)
```

### 3. Connection Pooling
```python
# Use connection pooling for database operations
db_pool = await asyncpg.create_pool(
    dsn=DATABASE_URL,
    min_size=10,
    max_size=20
)
```

## Monitoring and Debugging

### Logging Tool Calls

```python
import structlog

logger = structlog.get_logger()

@mcp_server.tool()
async def create_task(title: str, **kwargs):
    logger.info(
        "tool_called",
        tool="create_task",
        params={"title": title, **kwargs}
    )

    result = await execute_create_task(title, **kwargs)

    logger.info(
        "tool_completed",
        tool="create_task",
        result=result
    )

    return result
```

### Metrics Collection

```python
from prometheus_client import Counter, Histogram

tool_calls = Counter(
    'mcp_tool_calls_total',
    'Total number of MCP tool calls',
    ['tool_name', 'status']
)

tool_duration = Histogram(
    'mcp_tool_duration_seconds',
    'Duration of MCP tool execution',
    ['tool_name']
)
```

## Troubleshooting

### Common Issues

1. **Tool not found**: Ensure tool is registered with MCP server
2. **Parameter validation errors**: Check parameter types and required fields
3. **Database connection errors**: Verify database configuration
4. **Authentication failures**: Check user context and permissions

### Debug Mode

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Enable MCP debug mode
mcp_server = MCPServer(debug=True)
```

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude Agent SDK](https://github.com/anthropics/anthropic-sdk-python)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Anthropic API Reference](https://docs.anthropic.com/)
