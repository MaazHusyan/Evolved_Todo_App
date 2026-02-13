# AI Chatbot Architecture

## Overview

The Evolve Todo application includes an AI-powered chatbot that helps users manage their tasks through natural language interactions. The chatbot is built using the Model Context Protocol (MCP) and supports multiple AI providers.

## Architecture Components

### 1. Backend AI Module (`backend/src/ai/`)

The AI module consists of several key components:

- **Agent SDK** (`agent_sdk.py`): Core agent implementation using Claude Agent SDK
- **Configuration** (`config_sdk.py`): AI provider configuration and settings
- **MCP Integration**: Model Context Protocol for tool calling and context management

### 2. AI Providers

The chatbot supports multiple AI providers:

- **Anthropic Claude**: Primary provider using Claude 3.5 Sonnet
- **Groq**: Alternative provider for faster inference
- **OpenAI**: Optional provider for GPT models

### 3. MCP Tools

The chatbot has access to the following tools via MCP:

#### Task Management Tools
- `create_task`: Create a new task
- `list_tasks`: List all tasks with optional filtering
- `update_task`: Update an existing task
- `delete_task`: Delete a task
- `mark_complete`: Mark a task as complete

#### Context Tools
- `get_user_context`: Retrieve user information and preferences
- `search_tasks`: Search tasks by keywords or criteria

## Data Flow

```
User Input → Frontend → Backend API → AI Agent → MCP Tools → Database
                                          ↓
                                    AI Response
                                          ↓
                                    Frontend Display
```

## Key Features

### 1. Natural Language Understanding

The chatbot can understand various task-related intents:
- Creating tasks: "Add a task to buy groceries"
- Listing tasks: "Show me my tasks for today"
- Updating tasks: "Change the due date of task 5 to tomorrow"
- Completing tasks: "Mark task 3 as done"

### 2. Context Awareness

The agent maintains conversation context and can:
- Reference previous messages
- Remember user preferences
- Provide personalized suggestions

### 3. Tool Calling

The agent uses MCP tools to:
- Execute database operations
- Retrieve task information
- Update task status
- Search and filter tasks

## Configuration

### Environment Variables

```bash
# AI Provider Configuration
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
ANTHROPIC_API_KEY=your_anthropic_key

# Agent Configuration
AI_PROVIDER=anthropic  # anthropic, groq, or openai
AI_MODEL=claude-3-5-sonnet-20241022
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4096
```

### Provider Selection

The agent automatically selects the best available provider based on:
1. Configured API keys
2. Provider availability
3. Model capabilities

## Security Considerations

### 1. API Key Management
- Store API keys in Kubernetes secrets
- Never commit keys to version control
- Rotate keys regularly

### 2. Input Validation
- Sanitize user inputs before processing
- Validate tool parameters
- Implement rate limiting

### 3. Access Control
- Authenticate users before AI interactions
- Ensure users can only access their own tasks
- Log all AI operations for audit

## Performance Optimization

### 1. Caching
- Cache frequent queries
- Store conversation context efficiently
- Implement response caching for common requests

### 2. Streaming
- Use Server-Sent Events (SSE) for real-time responses
- Stream AI responses as they're generated
- Provide immediate feedback to users

### 3. Resource Management
- Set appropriate token limits
- Implement request timeouts
- Monitor API usage and costs

## Error Handling

The AI module implements comprehensive error handling:

```python
try:
    response = await agent.run(user_message)
except ProviderError as e:
    # Handle provider-specific errors
    logger.error(f"Provider error: {e}")
    return fallback_response()
except ToolError as e:
    # Handle tool execution errors
    logger.error(f"Tool error: {e}")
    return error_response()
except Exception as e:
    # Handle unexpected errors
    logger.error(f"Unexpected error: {e}")
    return generic_error_response()
```

## Monitoring and Observability

### Metrics to Track
- Request latency
- Token usage
- Error rates
- Tool call frequency
- User satisfaction

### Logging
- Log all AI interactions
- Track tool executions
- Monitor API costs
- Record error patterns

## Future Enhancements

1. **Multi-turn Conversations**: Implement conversation history management
2. **Custom Tools**: Add domain-specific tools for advanced task management
3. **Voice Interface**: Support voice input/output
4. **Multilingual Support**: Add support for multiple languages
5. **Personalization**: Learn user preferences over time
6. **Integration**: Connect with external services (calendar, email, etc.)

## References

- [Claude Agent SDK Documentation](https://github.com/anthropics/anthropic-sdk-python)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
