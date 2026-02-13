# Research: AI-Powered Todo Chatbot with MCP Architecture

**Feature ID**: 003-ai-chatbot-mcp
**Created**: 2026-02-08
**Status**: Research Phase

---

## Overview

This document contains research findings, implementation guides, and technical references for building the AI-Powered Todo Chatbot using Model Context Protocol (MCP) architecture.

---

## MCP Python SDK Implementation Guide

### Official MCP Python SDK v2

**Source**: Official Anthropic MCP Python SDK Documentation
**Package**: `mcp[cli]`
**Architecture**: Stateless MCP Server with SSE Transport

### Core Implementation Pattern

```python
from mcp.server import Server
from mcp.types import Tool, TextContent
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Route
import uvicorn

# Initialize MCP Server
app = Server("todo-mcp-server")

# Define Tools
@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="add_task",
            description="Create a new todo task",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "due_date": {"type": "string"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]}
                },
                "required": ["title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="List user's tasks with optional filters",
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "enum": ["pending", "completed", "all"]},
                    "priority": {"type": "string"},
                    "due_date": {"type": "string"}
                }
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"}
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="update_task",
            description="Update task properties",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "due_date": {"type": "string"},
                    "priority": {"type": "string"}
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task permanently",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"}
                },
                "required": ["task_id"]
            }
        )
    ]

# Tool Call Handlers
@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    # Extract user_id from request context (authentication)
    user_id = get_current_user_id()

    if name == "add_task":
        task = await create_task(user_id, arguments)
        return [TextContent(
            type="text",
            text=f"Task created: {task.title} (ID: {task.id})"
        )]

    elif name == "list_tasks":
        tasks = await get_tasks(user_id, arguments)
        task_list = "\n".join([f"{i+1}. {t.title} (due: {t.due_date})" for i, t in enumerate(tasks)])
        return [TextContent(
            type="text",
            text=f"Your tasks:\n{task_list}"
        )]

    elif name == "complete_task":
        task = await mark_task_complete(user_id, arguments["task_id"])
        return [TextContent(
            type="text",
            text=f"Task completed: {task.title}"
        )]

    elif name == "update_task":
        task = await update_task_data(user_id, arguments["task_id"], arguments)
        return [TextContent(
            type="text",
            text=f"Task updated: {task.title}"
        )]

    elif name == "delete_task":
        await delete_task_data(user_id, arguments["task_id"])
        return [TextContent(
            type="text",
            text="Task deleted successfully"
        )]

    raise ValueError(f"Unknown tool: {name}")

# SSE Transport Setup
async def handle_sse(request):
    async with SseServerTransport("/mcp/sse") as transport:
        await app.run(
            transport.read_stream,
            transport.write_stream,
            app.create_initialization_options()
        )

# Starlette App
starlette_app = Starlette(
    routes=[
        Route("/mcp/sse", endpoint=handle_sse)
    ]
)

# Run Server
if __name__ == "__main__":
    uvicorn.run(starlette_app, host="0.0.0.0", port=8000)
```

### Key Implementation Details

#### 1. Stateless Design
- **No in-memory state**: All conversation history stored in PostgreSQL
- **Session management**: Use Better Auth tokens for user identification
- **Database queries**: Fetch conversation context from database on each request
- **Horizontal scalability**: Any server instance can handle any request

#### 2. Authentication Integration
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user_id(token: str = Depends(security)) -> str:
    # Validate Better Auth token
    user = await validate_auth_token(token.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return user.id
```

#### 3. Database Schema (Additive Only)

```sql
-- New tables (no modifications to existing Task table)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### 4. SQLModel Integration

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
import uuid

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: list["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id")
    role: str = Field(max_length=20)  # 'user' or 'assistant'
    content: str
    tool_calls: Optional[dict] = Field(default=None, sa_column_kwargs={"type_": "JSONB"})
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: Conversation = Relationship(back_populates="messages")
```

---

## OpenAI Agents SDK Integration

### Agent Orchestration Pattern

```python
from openai import OpenAI
from openai.agents import Agent

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create agent with MCP tools
agent = Agent(
    name="todo-assistant",
    model="gpt-4",
    instructions="""You are a helpful todo task management assistant.
    Help users create, view, update, complete, and delete their tasks through natural conversation.
    Be friendly, concise, and proactive in understanding user intent.""",
    tools=[
        {"type": "mcp", "server": "http://localhost:8000/mcp/sse"}
    ]
)

# Handle user message
async def handle_chat_message(user_id: str, message: str, conversation_id: str):
    # Fetch conversation history
    history = await get_conversation_history(conversation_id)

    # Build messages array
    messages = [{"role": msg.role, "content": msg.content} for msg in history]
    messages.append({"role": "user", "content": message})

    # Call agent
    response = await agent.run(messages=messages)

    # Save messages to database
    await save_message(conversation_id, "user", message)
    await save_message(conversation_id, "assistant", response.content, response.tool_calls)

    return response.content
```

---

## ChatKit React Frontend Integration

### Installation
```bash
npm install @chatscope/chat-ui-kit-react
```

### Component Structure

```tsx
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

export function TodoChatbot() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message: string) => {
    // Add user message
    setMessages([...messages, { role: 'user', content: message }]);
    setIsTyping(true);

    // Call backend API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    // Add assistant response
    setMessages([...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: data.response }
    ]);
    setIsTyping(false);
  };

  return (
    <MainContainer>
      <ChatContainer>
        <MessageList typingIndicator={isTyping ? <TypingIndicator content="AI is thinking..." /> : null}>
          {messages.map((msg, i) => (
            <Message
              key={i}
              model={{
                message: msg.content,
                sender: msg.role === 'user' ? 'You' : 'AI Assistant',
                direction: msg.role === 'user' ? 'outgoing' : 'incoming'
              }}
            />
          ))}
        </MessageList>
        <MessageInput placeholder="Type a message..." onSend={handleSend} />
      </ChatContainer>
    </MainContainer>
  );
}
```

---

## Performance Optimization Strategies

### 1. Database Query Optimization
- Index on `conversations.user_id` for fast user lookup
- Index on `messages.conversation_id` for conversation retrieval
- Limit conversation history to last 50 messages in context
- Use connection pooling for database connections

### 2. Caching Strategy
- Cache user authentication tokens (Redis)
- Cache frequently accessed task lists (5-minute TTL)
- No caching of conversation history (always fresh)

### 3. Response Time Targets
- Simple queries (list tasks): < 1 second
- Complex operations (multi-step): < 3 seconds
- P95 latency: < 2 seconds
- Loading indicators for operations > 500ms

---

## Security Considerations

### 1. Authentication & Authorization
- Validate Better Auth token on every request
- Ensure users can only access their own tasks and conversations
- Use parameterized queries to prevent SQL injection
- Validate all user inputs

### 2. Rate Limiting
- Limit chat messages per user: 60 per minute
- Limit tool calls per conversation: 100 per hour
- Monitor for abuse patterns

### 3. Data Privacy
- Encrypt conversation data at rest
- Log only metadata, not message content
- Implement data retention policy
- GDPR compliance: delete all data on account deletion

---

## Testing Strategy

### 1. Unit Tests
- Test each MCP tool handler independently
- Test conversation history retrieval
- Test authentication validation
- Test error handling

### 2. Integration Tests
- Test full chat flow (user message → AI response → database save)
- Test tool calling accuracy
- Test context resolution across multiple turns
- Test concurrent user sessions

### 3. Performance Tests
- Load test with 100 concurrent users
- Measure P95 response times
- Test database query performance
- Test under high tool call volume

### 4. User Acceptance Tests
- Test all user scenarios from spec
- Test edge cases
- Test error recovery
- Test on mobile devices

---

## Deployment Considerations

### 1. Environment Variables
```bash
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
MCP_SERVER_URL=http://localhost:8000/mcp/sse
```

### 2. Infrastructure Requirements
- FastAPI backend (existing)
- PostgreSQL database (existing Neon)
- OpenAI API access
- SSE-compatible hosting (Vercel supports SSE)

### 3. Monitoring
- Track AI response times
- Monitor tool invocation accuracy
- Track error rates
- Monitor OpenAI API costs

---

## References

1. **MCP Python SDK**: https://github.com/anthropics/mcp-python-sdk
2. **OpenAI Agents SDK**: https://platform.openai.com/docs/agents
3. **ChatKit React**: https://chatscope.io/
4. **FastAPI Documentation**: https://fastapi.tiangolo.com/
5. **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
6. **Better Auth**: https://www.better-auth.com/

---

## Next Steps

1. Review and validate research findings
2. Resolve open questions in specification
3. Proceed to `/sp.plan` for detailed architecture design
4. Create implementation tasks in `/sp.tasks`
5. Begin implementation with `/sp.implement`
