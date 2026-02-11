# Implementation Plan: AI-Powered Todo Chatbot with MCP Architecture

**Feature ID**: 003-ai-chatbot-mcp
**Created**: 2026-02-08
**Status**: Planning
**Phase**: III

---

## Executive Summary

This plan outlines the technical architecture and implementation strategy for adding an AI-powered conversational interface to the Evolve Todo App. The system uses Model Context Protocol (MCP) server architecture with OpenAI Agents SDK for orchestration, maintaining stateless design and zero breaking changes to existing Phase II infrastructure.

**Key Architectural Decisions**:
- MCP Server using official Python SDK v2 with SSE transport
- OpenAI Agents SDK for AI orchestration and tool calling
- ChatKit React for frontend chat interface
- Stateless design with all state in PostgreSQL
- Additive database schema (no modifications to existing tables)
- Better Auth integration preserved

---

## Technical Context

### Technology Stack

**Backend**:
- **MCP Server**: Official Python SDK (`mcp[cli]` v2.0+)
- **AI Orchestration**: OpenAI Agents SDK
- **Web Framework**: FastAPI (existing)
- **ORM**: SQLModel (existing)
- **Database**: Neon PostgreSQL (existing)
- **Authentication**: Better Auth (existing)
- **Transport**: SSE (Server-Sent Events) for HTTP compatibility

**Frontend**:
- **Framework**: Next.js 16 with App Router (existing)
- **Chat UI**: ChatKit React (`@chatscope/chat-ui-kit-react`)
- **Styling**: Tailwind CSS with glassmorphism design (existing)
- **State Management**: React hooks with SWR for data fetching

**External Services**:
- **AI Model**: OpenAI GPT-4 via OpenAI API
- **Database Hosting**: Neon Serverless PostgreSQL (existing)

### Architecture Principles

1. **Stateless Design**: No in-memory conversation state; all state persists to database
2. **Additive Changes Only**: No modifications to existing Task model or API endpoints
3. **Separation of Concerns**: MCP server handles tool logic, OpenAI handles conversation
4. **Horizontal Scalability**: Any server instance can handle any request
5. **Security First**: Validate authentication on every request, parameterized queries
6. **Performance**: P95 response time < 2 seconds, optimized database queries

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chat Interface (ChatKit React)                          │  │
│  │  - Message input/display                                 │  │
│  │  - Glassmorphism UI                                      │  │
│  │  - Real-time message streaming                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ HTTPS                             │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                    Backend (FastAPI)                             │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  Chat API Endpoint                                       │   │
│  │  POST /api/{user_id}/chat                                │   │
│  │  - Validate authentication                               │   │
│  │  - Retrieve conversation history                         │   │
│  │  - Call OpenAI Agents SDK                                │   │
│  │  - Save messages to database                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │  OpenAI Agents SDK                                       │   │
│  │  - Agent orchestration                                   │   │
│  │  - Tool calling logic                                    │   │
│  │  - Context management                                    │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│                              │ Tool Calls                        │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MCP Server (SSE Transport)                              │   │
│  │  /mcp/sse endpoint                                       │   │
│  │                                                          │   │
│  │  Tools:                                                  │   │
│  │  - add_task(title, description, due_date, priority)     │   │
│  │  - list_tasks(status, priority, due_date)               │   │
│  │  - complete_task(task_id)                                │   │
│  │  - update_task(task_id, ...)                             │   │
│  │  - delete_task(task_id)                                  │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│                              │ Database Queries                  │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Database Layer (SQLModel)                               │   │
│  │  - Task CRUD operations (existing)                       │   │
│  │  - Conversation management (new)                         │   │
│  │  - Message persistence (new)                             │   │
│  └──────────────────────────┬───────────────────────────────┘   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               │ SQL
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Neon PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Existing Tables:                                        │   │
│  │  - users (Better Auth)                                   │   │
│  │  - tasks (Phase II)                                      │   │
│  │                                                          │   │
│  │  New Tables:                                             │   │
│  │  - conversations (user_id, created_at, updated_at)      │   │
│  │  - messages (conversation_id, role, content, ...)       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

**User sends message: "Add a task to buy groceries tomorrow"**

1. **Frontend** → POST `/api/{user_id}/chat` with message and auth token
2. **Chat API** validates Better Auth token, extracts user_id
3. **Chat API** retrieves last 50 messages from database for context
4. **Chat API** calls OpenAI Agents SDK with message + conversation history
5. **OpenAI Agent** analyzes message, determines intent: "create task"
6. **OpenAI Agent** calls MCP tool: `add_task(title="Buy groceries", due_date="2026-02-09")`
7. **MCP Server** validates user_id, creates task in database
8. **MCP Server** returns success: "Task created: Buy groceries (ID: abc123)"
9. **OpenAI Agent** generates natural response: "I've added 'Buy groceries' to your tasks, due tomorrow."
10. **Chat API** saves user message and assistant response to database
11. **Chat API** returns response to frontend
12. **Frontend** displays AI response in chat interface

---

## Component Design

### 1. MCP Server (`backend/src/mcp/server.py`)

**Purpose**: Provides MCP tools for task operations, handles tool invocations from AI

**Key Components**:

```python
from mcp.server import Server
from mcp.types import Tool, TextContent
from mcp.server.sse import SseServerTransport

# Initialize MCP Server
mcp_app = Server("todo-mcp-server")

# Tool definitions
@mcp_app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(name="add_task", ...),
        Tool(name="list_tasks", ...),
        Tool(name="complete_task", ...),
        Tool(name="update_task", ...),
        Tool(name="delete_task", ...)
    ]

# Tool handlers
@mcp_app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    # Extract user_id from request context
    # Call appropriate task operation
    # Return result as TextContent
```

**Responsibilities**:
- Define tool schemas with input validation
- Handle tool invocations from OpenAI Agent
- Validate user authentication for each tool call
- Execute task CRUD operations via existing database layer
- Return structured responses to AI

**Integration Points**:
- Uses existing SQLModel Task model
- Validates user_id matches authenticated user
- Returns results in MCP TextContent format

---

### 2. Chat API Endpoint (`backend/src/api/chat.py`)

**Purpose**: Main API endpoint for chat interactions, orchestrates conversation flow

**Endpoint**: `POST /api/{user_id}/chat`

**Request Schema**:
```json
{
  "message": "Add a task to buy groceries tomorrow",
  "conversation_id": "uuid-optional"
}
```

**Response Schema**:
```json
{
  "response": "I've added 'Buy groceries' to your tasks, due tomorrow.",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {"title": "Buy groceries", "due_date": "2026-02-09"},
      "result": "success"
    }
  ]
}
```

**Key Functions**:

```python
async def handle_chat_message(
    user_id: str,
    message: str,
    conversation_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ChatResponse:
    # 1. Validate user_id matches authenticated user
    # 2. Get or create conversation
    # 3. Retrieve last 50 messages for context
    # 4. Call OpenAI Agent with message + context
    # 5. Save user message and AI response
    # 6. Return response
```

**Responsibilities**:
- Authenticate requests using Better Auth
- Manage conversation lifecycle (create/retrieve)
- Retrieve conversation history (last 50 messages)
- Call OpenAI Agents SDK with proper context
- Persist messages to database
- Handle errors gracefully

---

### 3. OpenAI Agent Integration (`backend/src/ai/agent.py`)

**Purpose**: Orchestrates AI conversation, manages tool calling

**Key Components**:

```python
from openai import OpenAI
from openai.agents import Agent

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create agent with MCP tools
agent = Agent(
    name="todo-assistant",
    model="gpt-4",
    instructions="""You are a helpful todo task management assistant.
    Help users create, view, update, complete, and delete their tasks.
    Be friendly, concise, and proactive in understanding user intent.
    When users reference tasks (e.g., 'the first one'), use context to resolve references.""",
    tools=[
        {"type": "mcp", "server": "http://localhost:8000/mcp/sse"}
    ]
)

async def process_message(
    user_id: str,
    message: str,
    conversation_history: list[Message]
) -> AgentResponse:
    # Build messages array from history
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in conversation_history
    ]
    messages.append({"role": "user", "content": message})

    # Call agent
    response = await agent.run(messages=messages)

    return response
```

**Responsibilities**:
- Initialize OpenAI Agent with system instructions
- Configure MCP server connection
- Format conversation history for AI
- Handle tool calling flow
- Return AI-generated responses

---

### 4. Database Models (`backend/src/models/`)

**New Models** (additive only, no changes to existing Task model):

```python
# backend/src/models/conversation.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
import uuid

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: list["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(
        foreign_key="conversations.id",
        index=True
    )
    role: str = Field(max_length=20)  # 'user' or 'assistant'
    content: str = Field()
    tool_calls: Optional[dict] = Field(
        default=None,
        sa_column_kwargs={"type_": "JSONB"}
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
```

**Database Constraints**:
- `conversations.user_id` → CASCADE DELETE (delete conversations when user deleted)
- `messages.conversation_id` → CASCADE DELETE (delete messages when conversation deleted)
- Indexes on: `conversations.user_id`, `messages.conversation_id`, `messages.created_at`

---

### 5. Frontend Chat Interface (`frontend/src/app/chat/page.jsx`)

**Purpose**: Conversational UI for task management

**Key Components**:

```jsx
'use client';

import { useState, useEffect } from 'react';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { useAuth } from '@/hooks/useAuth';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const handleSend = async (message) => {
    // Add user message to UI
    setMessages([...messages, { role: 'user', content: message }]);
    setIsTyping(true);

    try {
      // Call backend API
      const response = await fetch(`/api/${user.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId
        })
      });

      const data = await response.json();

      // Update conversation ID
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response
      setMessages([...messages,
        { role: 'user', content: message },
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      // Show error message to user
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-full">
      <MainContainer>
        <ChatContainer>
          <MessageList typingIndicator={isTyping ? <TypingIndicator /> : null}>
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
          <MessageInput
            placeholder="Type a message..."
            onSend={handleSend}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
```

**Styling**: Apply glassmorphism design consistent with existing UI

**Responsibilities**:
- Display conversation history
- Handle user input
- Show typing indicators
- Handle errors gracefully
- Maintain conversation state

---

## Database Schema Design

### New Tables (Additive Only)

**conversations table**:
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

**messages table**:
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Migration Strategy**:
1. Create new tables using Alembic migration
2. No changes to existing `tasks` or `users` tables
3. Test migration on development database first
4. Run migration on production with zero downtime

---

## Security & Authentication

### Authentication Flow

1. **Frontend**: User authenticates via Better Auth (existing)
2. **Frontend**: Includes JWT token in Authorization header
3. **Backend**: Validates token using Better Auth shared secret
4. **Backend**: Extracts user_id from validated token
5. **Backend**: Ensures user_id in URL matches authenticated user
6. **Backend**: All database queries filtered by authenticated user_id

### Security Measures

**Input Validation**:
- Validate all user inputs before processing
- Sanitize message content to prevent injection attacks
- Limit message length (max 2000 characters)

**Database Security**:
- Use parameterized queries (SQLModel handles this)
- Enforce user_id filtering on all queries
- No raw SQL queries

**API Security**:
- Rate limiting: 60 requests per minute per user
- CORS configuration: Allow only frontend domain
- HTTPS only in production

**Data Privacy**:
- Conversation data encrypted at rest (Neon handles this)
- No logging of message content (only metadata)
- GDPR compliance: CASCADE DELETE on user deletion

---

## Performance Optimization

### Database Optimization

**Indexes**:
- `conversations.user_id` - Fast user lookup
- `messages.conversation_id` - Fast conversation retrieval
- `messages.created_at` - Efficient ordering and limiting

**Query Optimization**:
```sql
-- Retrieve last 50 messages efficiently
SELECT * FROM messages
WHERE conversation_id = ?
ORDER BY created_at DESC
LIMIT 50;
```

**Connection Pooling**:
- Use SQLModel's connection pool
- Configure pool size: min=5, max=20
- Connection timeout: 30 seconds

### Caching Strategy

**What to Cache**:
- User authentication tokens (Redis, 15-minute TTL)
- Frequently accessed task lists (5-minute TTL)

**What NOT to Cache**:
- Conversation history (always fetch fresh)
- AI responses (always generate fresh)

### Response Time Targets

- Simple queries (list tasks): < 1 second
- Complex operations (multi-step): < 3 seconds
- P95 latency: < 2 seconds
- Loading indicators for operations > 500ms

---

## Implementation Phases

### Phase 1: Backend Foundation (Week 1)

**Tasks**:
1. Set up MCP server with official Python SDK
2. Implement 5 MCP tools (add_task, list_tasks, complete_task, update_task, delete_task)
3. Create database models (Conversation, Message)
4. Write and run database migrations
5. Test MCP tools independently

**Deliverables**:
- Working MCP server at `/mcp/sse`
- Database tables created
- Unit tests for MCP tools

**Validation**:
- All MCP tools callable via MCP client
- Database migrations run successfully
- Unit tests pass

---

### Phase 2: AI Integration (Week 1-2)

**Tasks**:
1. Set up OpenAI Agents SDK
2. Configure agent with system instructions
3. Connect agent to MCP server
4. Implement chat API endpoint
5. Test conversation flow end-to-end

**Deliverables**:
- Working chat API at `/api/{user_id}/chat`
- OpenAI Agent configured and connected
- Integration tests for chat flow

**Validation**:
- Agent successfully calls MCP tools
- Conversation context maintained across turns
- Messages persisted to database

---

### Phase 3: Frontend Development (Week 2)

**Tasks**:
1. Install ChatKit React library
2. Create chat page component
3. Implement message sending/receiving
4. Apply glassmorphism styling
5. Add loading states and error handling

**Deliverables**:
- Chat interface at `/chat` route
- Styled with glassmorphism design
- Responsive on mobile devices

**Validation**:
- Users can send and receive messages
- UI matches design specifications
- Mobile responsive

---

### Phase 4: Testing & Refinement (Week 2-3)

**Tasks**:
1. Write comprehensive test suite
2. Perform load testing (100 concurrent users)
3. Test all user scenarios from spec
4. Fix bugs and optimize performance
5. Security audit

**Deliverables**:
- Test suite with >80% coverage
- Load test results showing P95 < 2s
- Security audit report

**Validation**:
- All tests pass
- Performance targets met
- No security vulnerabilities

---

### Phase 5: Deployment (Week 3)

**Tasks**:
1. Deploy to staging environment
2. Run smoke tests
3. Deploy to production
4. Monitor metrics
5. Create user documentation

**Deliverables**:
- Production deployment
- Monitoring dashboards
- User documentation

**Validation**:
- Zero downtime deployment
- All existing tests still pass
- Monitoring shows healthy metrics

---

## Testing Strategy

### Unit Tests

**MCP Tools**:
- Test each tool with valid inputs
- Test error handling (invalid task IDs, missing fields)
- Test authentication validation
- Mock database calls

**Database Models**:
- Test model creation and relationships
- Test CASCADE DELETE behavior
- Test constraints and validations

### Integration Tests

**Chat Flow**:
- Test full conversation flow (user message → AI response → database save)
- Test context resolution across multiple turns
- Test tool calling accuracy
- Test concurrent user sessions

**API Endpoints**:
- Test authentication validation
- Test error responses
- Test rate limiting

### End-to-End Tests

**User Scenarios**:
- Test all 4 scenarios from specification
- Test edge cases
- Test error recovery
- Test on multiple browsers and devices

### Performance Tests

**Load Testing**:
- 100 concurrent users sending messages
- Measure P95 response time
- Monitor database query performance
- Monitor OpenAI API latency

---

## Deployment Considerations

### Environment Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# MCP Configuration
MCP_SERVER_URL=http://localhost:8000/mcp/sse
MCP_CONTEXT_WINDOW_SIZE=50

# Database Configuration (existing)
DATABASE_URL=postgresql://...

# Authentication (existing)
BETTER_AUTH_SECRET=...

# Rate Limiting
CHAT_RATE_LIMIT_PER_MINUTE=60
```

### Infrastructure Requirements

**Backend**:
- FastAPI server (existing infrastructure)
- Support for SSE (Server-Sent Events)
- Sufficient memory for MCP server

**Database**:
- Neon PostgreSQL (existing)
- Additional storage for conversation data
- Connection pool configured

**External Services**:
- OpenAI API access
- API key with sufficient quota

### Monitoring

**Metrics to Track**:
- Chat API response times (P50, P95, P99)
- OpenAI API latency
- Database query performance
- Error rates
- OpenAI API costs
- User adoption (% of users trying chat)

**Alerts**:
- Response time > 3 seconds
- Error rate > 5%
- OpenAI API costs exceed budget
- Database connection pool exhausted

---

## Risk Mitigation

### Technical Risks

**Risk**: OpenAI API downtime
**Mitigation**: Implement retry logic, show user-friendly error message, monitor API status

**Risk**: Database performance degradation
**Mitigation**: Optimize queries, add indexes, monitor query performance, use connection pooling

**Risk**: Context window limitations
**Mitigation**: Limit to 50 messages, implement smart context pruning, allow manual context reset

### Business Risks

**Risk**: High OpenAI API costs
**Mitigation**: Implement rate limiting, monitor costs in real-time, set up budget alerts

**Risk**: Low user adoption
**Mitigation**: Prominent UI placement, onboarding tutorial, user feedback collection

**Risk**: AI misinterpretation causing data loss
**Mitigation**: Confirmation for destructive operations, undo functionality, comprehensive logging

---

## Success Metrics

### Technical Metrics
- ✅ P95 response time < 2 seconds
- ✅ Tool invocation accuracy ≥ 95%
- ✅ Error rate < 1%
- ✅ Zero breaking changes to Phase II functionality
- ✅ All existing tests pass

### Business Metrics
- ✅ 30% of users try chat within first month
- ✅ 60% of chat users return within one week
- ✅ Average session duration increases by 20%

### User Experience Metrics
- ✅ User satisfaction score ≥ 4/5
- ✅ Task completion rate ≥ 90%
- ✅ Context resolution accuracy ≥ 90%

---

## Appendices

### A. MCP Tool Schemas

See `contracts/mcp-tools.json` for complete tool definitions

### B. API Contracts

See `contracts/chat-api.yaml` for OpenAPI specification

### C. Database Schema

See `data-model.md` for complete schema documentation

### D. Implementation Guide

See `quickstart.md` for step-by-step implementation instructions

---

**Plan Status**: ✅ APPROVED - Ready for Task Breakdown

**Next Steps**:
1. Review and approve this plan
2. Run `/sp.tasks` to generate detailed implementation tasks
3. Run `/sp.implement` to begin development
