# Quickstart: AI-Powered Todo Chatbot Implementation

**Feature ID**: 003-ai-chatbot-mcp
**Created**: 2026-02-08
**Estimated Time**: 2-3 weeks

---

## Overview

This guide provides step-by-step instructions for implementing the AI-powered conversational task management feature. Follow these steps in order to ensure proper integration with existing Phase II infrastructure.

**What You'll Build**:
- MCP Server with 5 task management tools
- OpenAI Agent integration for conversation orchestration
- Chat API endpoint for frontend communication
- React-based chat interface with glassmorphism design
- Database schema for conversation persistence

---

## Prerequisites

### Required Tools
- Python 3.11+
- Node.js 18+
- PostgreSQL (Neon)
- Git

### Required Accounts
- OpenAI API account with GPT-4 access
- Neon PostgreSQL database (existing)

### Environment Setup

```bash
# Clone repository (if not already done)
git clone <repo-url>
cd Evolve_Todo_App

# Checkout feature branch
git checkout 003-ai-chatbot-mcp

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

---

## Phase 1: Backend Foundation (Week 1)

### Step 1.1: Install Dependencies

**Add to `backend/requirements.txt`**:
```txt
# MCP and AI dependencies
mcp[cli]==2.0.0
openai==1.12.0
openai-agents-sdk==0.5.0
sse-starlette==1.8.2

# Existing dependencies remain unchanged
fastapi==0.109.0
sqlmodel==0.0.14
uvicorn==0.27.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
alembic==1.13.1
```

**Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

---

### Step 1.2: Create Database Models

**Create `backend/src/models/conversation.py`**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
import uuid

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["Message"] = Relationship(back_populates="conversation")

    def update_timestamp(self):
        self.updated_at = datetime.utcnow()
```

**Create `backend/src/models/message.py`**:
```python
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)
    content: str = Field()
    tool_calls: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    conversation: Conversation = Relationship(back_populates="messages")
```

**Update `backend/src/models/__init__.py`**:
```python
from .conversation import Conversation
from .message import Message

__all__ = ["Conversation", "Message"]
```

---

### Step 1.3: Create Database Migration

**Generate migration**:
```bash
cd backend
alembic revision --autogenerate -m "Add chat tables for AI chatbot"
```

**Review and edit migration file** (`backend/alembic/versions/003_add_chat_tables.py`):
```python
"""Add chat tables for AI chatbot

Revision ID: 003_add_chat_tables
Revises: 002_phase_2_tables
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = '003_add_chat_tables'
down_revision = '002_phase_2_tables'

def upgrade():
    op.create_table(
        'conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])

    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.VARCHAR(20), nullable=False),
        sa.Column('content', sa.TEXT, nullable=False),
        sa.Column('tool_calls', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.CheckConstraint("role IN ('user', 'assistant')", name='check_message_role'),
    )
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('idx_messages_created_at', 'messages', ['created_at'])

def downgrade():
    op.drop_index('idx_messages_created_at', table_name='messages')
    op.drop_index('idx_messages_conversation_id', table_name='messages')
    op.drop_table('messages')
    op.drop_index('idx_conversations_user_id', table_name='conversations')
    op.drop_table('conversations')
```

**Run migration**:
```bash
alembic upgrade head
```

**Verify tables created**:
```bash
# Connect to database and verify
psql $DATABASE_URL -c "\dt"
# Should show: conversations, messages tables
```

---

### Step 1.4: Create MCP Server

**Create `backend/src/mcp/server.py`**:
```python
from mcp.server import Server
from mcp.types import Tool, TextContent
from mcp.server.sse import SseServerTransport
from sqlmodel import Session, select
from typing import Optional
import uuid

from ..models.task import Task
from ..database import get_db

# Initialize MCP Server
mcp_app = Server("todo-mcp-server")

@mcp_app.list_tools()
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
                    "due_date": {"type": "string", "format": "date"},
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
                "properties": {"task_id": {"type": "string"}},
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
                "properties": {"task_id": {"type": "string"}},
                "required": ["task_id"]
            }
        )
    ]

@mcp_app.call_tool()
async def call_tool(name: str, arguments: dict, context: dict) -> list[TextContent]:
    # Extract user_id from context (set by authentication middleware)
    user_id = context.get("user_id")
    if not user_id:
        return [TextContent(type="text", text="Error: Authentication required")]

    db = next(get_db())

    try:
        if name == "add_task":
            task = Task(
                user_id=uuid.UUID(user_id),
                title=arguments["title"],
                description=arguments.get("description"),
                due_date=arguments.get("due_date"),
                priority=arguments.get("priority", "medium"),
                status="pending"
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            return [TextContent(
                type="text",
                text=f"Task created: {task.title} (ID: {task.id})"
            )]

        elif name == "list_tasks":
            query = select(Task).where(Task.user_id == uuid.UUID(user_id))

            status = arguments.get("status", "pending")
            if status != "all":
                query = query.where(Task.status == status)

            tasks = db.exec(query).all()
            task_list = "\n".join([
                f"{i+1}. {t.title} (due: {t.due_date}, priority: {t.priority})"
                for i, t in enumerate(tasks)
            ])
            return [TextContent(
                type="text",
                text=f"Your tasks:\n{task_list}" if tasks else "No tasks found"
            )]

        elif name == "complete_task":
            task = db.get(Task, uuid.UUID(arguments["task_id"]))
            if not task or task.user_id != uuid.UUID(user_id):
                return [TextContent(type="text", text="Error: Task not found")]

            task.status = "completed"
            db.commit()
            return [TextContent(type="text", text=f"Task completed: {task.title}")]

        elif name == "update_task":
            task = db.get(Task, uuid.UUID(arguments["task_id"]))
            if not task or task.user_id != uuid.UUID(user_id):
                return [TextContent(type="text", text="Error: Task not found")]

            for key, value in arguments.items():
                if key != "task_id" and hasattr(task, key):
                    setattr(task, key, value)

            db.commit()
            return [TextContent(type="text", text=f"Task updated: {task.title}")]

        elif name == "delete_task":
            task = db.get(Task, uuid.UUID(arguments["task_id"]))
            if not task or task.user_id != uuid.UUID(user_id):
                return [TextContent(type="text", text="Error: Task not found")]

            title = task.title
            db.delete(task)
            db.commit()
            return [TextContent(type="text", text=f"Task deleted: {title}")]

        else:
            return [TextContent(type="text", text=f"Error: Unknown tool {name}")]

    except Exception as e:
        return [TextContent(type="text", text=f"Error: {str(e)}")]
    finally:
        db.close()
```

---

### Step 1.5: Create OpenAI Agent Integration

**Create `backend/src/ai/agent.py`**:
```python
from openai import OpenAI
import os
from typing import List, Dict, Any

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_INSTRUCTIONS = """You are a helpful todo task management assistant.
Help users create, view, update, complete, and delete their tasks through natural conversation.

Guidelines:
- Be friendly, concise, and proactive
- When users reference tasks (e.g., 'the first one'), use context to resolve references
- Confirm destructive operations (deletion) before executing
- Provide clear feedback about what actions were taken
- If user intent is unclear, ask clarifying questions
"""

async def process_message(
    user_id: str,
    message: str,
    conversation_history: List[Dict[str, str]],
    mcp_server_url: str = "http://localhost:8000/mcp/sse"
) -> Dict[str, Any]:
    """
    Process a user message through OpenAI Agent with MCP tools.

    Args:
        user_id: Authenticated user ID
        message: User's message
        conversation_history: List of previous messages
        mcp_server_url: MCP server endpoint

    Returns:
        Dict with response, tool_calls, and metadata
    """
    # Build messages array
    messages = [{"role": "system", "content": SYSTEM_INSTRUCTIONS}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": message})

    # Call OpenAI with function calling
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Create a new todo task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "due_date": {"type": "string"},
                            "priority": {"type": "string"}
                        },
                        "required": ["title"]
                    }
                }
            },
            # Add other tools...
        ],
        tool_choice="auto"
    )

    # Extract response and tool calls
    assistant_message = response.choices[0].message

    return {
        "response": assistant_message.content,
        "tool_calls": assistant_message.tool_calls if assistant_message.tool_calls else [],
        "finish_reason": response.choices[0].finish_reason
    }
```

---

### Step 1.6: Create Chat API Endpoint

**Create `backend/src/api/chat.py`**:
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional
import uuid

from ..models.conversation import Conversation
from ..models.message import Message
from ..database import get_db
from ..auth import get_current_user
from ..ai.agent import process_message

router = APIRouter(prefix="/api/{user_id}/chat", tags=["chat"])

@router.post("")
async def send_chat_message(
    user_id: str,
    message: str,
    conversation_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Send a message to the AI assistant"""

    # Validate user_id matches authenticated user
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access other user's chat"
        )

    # Get or create conversation
    if conversation_id:
        conversation = db.get(Conversation, uuid.UUID(conversation_id))
        if not conversation or conversation.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        # Get user's existing conversation or create new one
        conversation = db.exec(
            select(Conversation).where(Conversation.user_id == current_user.id)
        ).first()

        if not conversation:
            conversation = Conversation(user_id=current_user.id)
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

    # Retrieve last 50 messages for context
    messages = db.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(50)
    ).all()

    # Reverse to chronological order
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(messages)
    ]

    # Process message through AI
    ai_response = await process_message(
        user_id=str(current_user.id),
        message=message,
        conversation_history=conversation_history
    )

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=message
    )
    db.add(user_msg)

    # Save assistant response
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_response["response"],
        tool_calls={"calls": ai_response["tool_calls"]} if ai_response["tool_calls"] else None
    )
    db.add(assistant_msg)

    # Update conversation timestamp
    conversation.update_timestamp()

    db.commit()
    db.refresh(assistant_msg)

    return {
        "response": ai_response["response"],
        "conversation_id": str(conversation.id),
        "message_id": str(assistant_msg.id),
        "tool_calls": ai_response["tool_calls"]
    }
```

**Register router in `backend/src/main.py`**:
```python
from .api import chat

app.include_router(chat.router)
```

---

## Phase 2: Frontend Development (Week 2)

### Step 2.1: Install Dependencies

```bash
cd frontend
npm install @chatscope/chat-ui-kit-react @chatscope/chat-ui-kit-styles
```

### Step 2.2: Create Chat Page

**Create `frontend/src/app/chat/page.jsx`**:
```jsx
'use client';

import { useState, useEffect } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { useAuth } from '@/hooks/useAuth';

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const handleSend = async (message) => {
    // Add user message to UI immediately
    const newMessages = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
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

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Update conversation ID if first message
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add assistant response
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto h-full p-4">
        <div className="h-full rounded-2xl overflow-hidden shadow-2xl backdrop-blur-lg bg-white/70">
          <MainContainer>
            <ChatContainer>
              <MessageList
                typingIndicator={isTyping ? <TypingIndicator content="AI is thinking..." /> : null}
              >
                {messages.map((msg, i) => (
                  <Message
                    key={i}
                    model={{
                      message: msg.content,
                      sender: msg.role === 'user' ? 'You' : 'AI Assistant',
                      direction: msg.role === 'user' ? 'outgoing' : 'incoming',
                      position: 'single'
                    }}
                  />
                ))}
              </MessageList>
              <MessageInput
                placeholder="Type a message... (e.g., 'Add a task to buy groceries tomorrow')"
                onSend={handleSend}
                attachButton={false}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </div>
  );
}
```

### Step 2.3: Add Navigation Link

**Update `frontend/src/components/Navigation.jsx`**:
```jsx
<Link href="/chat" className="nav-link">
  💬 Chat
</Link>
```

---

## Phase 3: Testing (Week 2-3)

### Step 3.1: Unit Tests

**Create `backend/tests/test_mcp_tools.py`**:
```python
import pytest
from src.mcp.server import call_tool

@pytest.mark.asyncio
async def test_add_task():
    result = await call_tool(
        name="add_task",
        arguments={"title": "Test task", "priority": "high"},
        context={"user_id": "test-user-id"}
    )
    assert "Task created" in result[0].text

# Add more tests...
```

### Step 3.2: Integration Tests

**Create `backend/tests/test_chat_api.py`**:
```python
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_send_chat_message():
    response = client.post(
        "/api/test-user-id/chat",
        json={"message": "Add a task to buy groceries"},
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 200
    assert "response" in response.json()
```

### Step 3.3: Run Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

---

## Phase 4: Deployment

### Step 4.1: Environment Variables

**Add to `.env`**:
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
MCP_SERVER_URL=http://localhost:8000/mcp/sse
MCP_CONTEXT_WINDOW_SIZE=50
CHAT_RATE_LIMIT_PER_MINUTE=60
```

### Step 4.2: Deploy Backend

```bash
# Run migrations on production
alembic upgrade head

# Start server
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Step 4.3: Deploy Frontend

```bash
cd frontend
npm run build
npm start
```

---

## Verification Checklist

- [ ] Database tables created (conversations, messages)
- [ ] MCP server responds to tool calls
- [ ] Chat API endpoint accepts messages
- [ ] OpenAI integration working
- [ ] Frontend displays chat interface
- [ ] Messages persist to database
- [ ] Authentication validated on all requests
- [ ] All existing Phase II tests still pass
- [ ] New tests pass
- [ ] Performance meets targets (P95 < 2s)

---

## Troubleshooting

### Issue: MCP tools not being called
**Solution**: Check OpenAI API key, verify tool schemas match MCP server

### Issue: Database connection errors
**Solution**: Verify DATABASE_URL, check connection pool settings

### Issue: Authentication failures
**Solution**: Verify BETTER_AUTH_SECRET matches frontend, check token format

### Issue: Slow response times
**Solution**: Check OpenAI API latency, optimize database queries, add indexes

---

## Next Steps

After completing implementation:
1. Run `/sp.tasks` to generate detailed task breakdown
2. Run `/sp.implement` to begin implementation
3. Monitor metrics and gather user feedback
4. Iterate based on performance and user experience

---

**Quickstart Status**: ✅ READY FOR IMPLEMENTATION

**Estimated Timeline**:
- Week 1: Backend foundation (MCP server, database, API)
- Week 2: Frontend development and integration
- Week 3: Testing, refinement, and deployment
