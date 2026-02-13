# API Documentation: AI-Powered Chat Feature

**Feature ID**: 003-ai-chatbot-mcp
**Version**: 3.0.0
**Last Updated**: 2026-02-12

---

## Overview

This document provides comprehensive API documentation for the AI-powered conversational task management feature. The chat API enables users to manage their todo tasks through natural language conversation with an AI assistant.

---

## Base URL

```
Production: https://api.evolve-todo.com
Development: http://localhost:8001
```

---

## Authentication

All chat endpoints require authentication using Better Auth JWT tokens.

### Authentication Header

```http
Authorization: Bearer <jwt_token>
```

### Getting a Token

Authenticate using the existing auth endpoints:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user"
  }
}
```

---

## Chat Endpoints

### Send Chat Message

Send a message to the AI assistant for task management.

**Endpoint:** `POST /api/chat`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-User-Id: <user_uuid>
```

**Request Body:**
```json
{
  "message": "Add a task to buy groceries tomorrow",
  "conversation_id": "optional-uuid"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | User's natural language message (max 2000 chars) |
| conversation_id | string (UUID) | No | Existing conversation ID to continue |

**Response (200 OK):**
```json
{
  "response": "I've added 'Buy groceries' to your tasks, due tomorrow. Anything else?",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "tool_calls": [
    {
      "tool": "create_task",
      "arguments": {
        "title": "Buy groceries",
        "due_date": "2026-02-13"
      },
      "result": "success"
    }
  ],
  "created_at": "2026-02-12T10:30:00Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| response | string | AI assistant's natural language response |
| conversation_id | string (UUID) | Conversation identifier for context |
| message_id | string (UUID) | Unique message identifier |
| tool_calls | array | List of tools invoked by AI (optional) |
| created_at | string (ISO 8601) | Message timestamp |

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Message cannot be empty"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Maximum 60 requests per minute exceeded. Please try again later.",
  "retry_after": 30
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again."
}
```

---

### Get Conversation History

Retrieve conversation history for the authenticated user.

**Endpoint:** `GET /api/chat/history`

**Headers:**
```http
Authorization: Bearer <jwt_token>
X-User-Id: <user_uuid>
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| conversation_id | string (UUID) | No | - | Specific conversation to retrieve |
| limit | integer | No | 50 | Number of messages to retrieve (max 100) |
| offset | integer | No | 0 | Pagination offset |

**Response (200 OK):**
```json
{
  "conversation_id": "uuid",
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "What do I need to do today?",
      "created_at": "2026-02-12T10:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "You have 3 tasks due today: 1) Buy groceries 2) Call dentist 3) Submit report",
      "tool_calls": [
        {
          "tool": "list_tasks",
          "arguments": {"status": "pending"},
          "result": "success"
        }
      ],
      "created_at": "2026-02-12T10:00:02Z"
    }
  ],
  "total": 2,
  "has_more": false
}
```

---

## MCP Tools

The AI assistant has access to the following tools for task management:

### 1. create_task

Create a new task for the user.

**Tool Schema:**
```json
{
  "name": "create_task",
  "description": "Create a new task for the user",
  "parameters": {
    "user_id": "string (UUID, required)",
    "title": "string (required)",
    "description": "string (optional)",
    "due_date": "string ISO 8601 (optional)",
    "priority": "enum: low|medium|high (optional, default: medium)",
    "tags": "array of strings (optional)"
  }
}
```

**Example Usage:**
```
User: "Add a task to buy groceries tomorrow"
AI calls: create_task(user_id="...", title="Buy groceries", due_date="2026-02-13")
```

---

### 2. list_tasks

List tasks for the user with optional filters.

**Tool Schema:**
```json
{
  "name": "list_tasks",
  "description": "List tasks for the user with optional filters",
  "parameters": {
    "user_id": "string (UUID, required)",
    "status": "enum: pending|completed (optional)",
    "priority": "enum: low|medium|high (optional)",
    "tag": "string (optional)",
    "limit": "integer (optional, default: 50, max: 100)"
  }
}
```

**Example Usage:**
```
User: "What do I need to do today?"
AI calls: list_tasks(user_id="...", status="pending")
```

---

### 3. update_task

Update an existing task.

**Tool Schema:**
```json
{
  "name": "update_task",
  "description": "Update an existing task",
  "parameters": {
    "user_id": "string (UUID, required)",
    "task_id": "string (UUID, required)",
    "title": "string (optional)",
    "description": "string (optional)",
    "status": "enum: pending|completed (optional)",
    "due_date": "string ISO 8601 (optional)",
    "priority": "enum: low|medium|high (optional)",
    "tags": "array of strings (optional)"
  }
}
```

**Example Usage:**
```
User: "Mark the first one done"
AI calls: update_task(user_id="...", task_id="...", status="completed")
```

---

### 4. delete_task

Delete a task.

**Tool Schema:**
```json
{
  "name": "delete_task",
  "description": "Delete a task",
  "parameters": {
    "user_id": "string (UUID, required)",
    "task_id": "string (UUID, required)"
  }
}
```

**Example Usage:**
```
User: "Delete the third task"
AI calls: delete_task(user_id="...", task_id="...")
```

---

## Rate Limiting

**Limits:**
- 60 requests per minute per user
- Rate limit applies to all chat endpoints

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1644667200
```

**Handling Rate Limits:**
When rate limit is exceeded, wait for the time specified in `retry_after` (seconds) before retrying.

---

## Performance Metrics

**Target Response Times:**
- Simple queries (list tasks): < 1 second
- Complex operations (multi-step): < 3 seconds
- P95 latency: < 2 seconds

**Monitoring:**
All responses include a performance header:
```http
X-Process-Time: 0.523
```

---

## Error Handling

### Error Response Format

All errors follow this format:
```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context (optional)"
  }
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary service disruption |

---

## WebSocket Support (Future)

WebSocket support for real-time streaming responses is planned for Phase IV.

**Planned Endpoint:** `ws://api.evolve-todo.com/ws/chat`

---

## Security Considerations

### Input Validation
- All user inputs are validated and sanitized
- Message length limited to 2000 characters
- SQL injection prevention via parameterized queries

### Authentication
- JWT tokens expire after 24 hours
- Tokens must be refreshed regularly
- All requests validate user ownership

### Data Privacy
- Conversation data encrypted at rest
- Message content not logged (only metadata)
- GDPR/CCPA compliant data deletion

---

## Example Workflows

### Workflow 1: Create Task

**Request:**
```bash
curl -X POST https://api.evolve-todo.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "X-User-Id: <user_id>" \
  -d '{
    "message": "Add a task to buy groceries tomorrow"
  }'
```

**Response:**
```json
{
  "response": "I've added 'Buy groceries' to your tasks, due tomorrow.",
  "conversation_id": "uuid",
  "message_id": "uuid",
  "tool_calls": [
    {
      "tool": "create_task",
      "arguments": {
        "title": "Buy groceries",
        "due_date": "2026-02-13"
      },
      "result": "success"
    }
  ]
}
```

---

### Workflow 2: List and Complete Tasks

**Request 1: List Tasks**
```bash
curl -X POST https://api.evolve-todo.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "X-User-Id: <user_id>" \
  -d '{
    "message": "What do I need to do today?"
  }'
```

**Response 1:**
```json
{
  "response": "You have 3 tasks due today:\n1. Buy groceries\n2. Call dentist\n3. Submit report",
  "conversation_id": "uuid",
  "tool_calls": [{"tool": "list_tasks", "result": "success"}]
}
```

**Request 2: Complete Task (with context)**
```bash
curl -X POST https://api.evolve-todo.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "X-User-Id: <user_id>" \
  -d '{
    "message": "Mark the first one done",
    "conversation_id": "uuid"
  }'
```

**Response 2:**
```json
{
  "response": "Great! I've marked 'Buy groceries' as complete. You have 2 tasks remaining today.",
  "conversation_id": "uuid",
  "tool_calls": [{"tool": "update_task", "result": "success"}]
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://api.evolve-todo.com';

class ChatAPI {
  constructor(private token: string, private userId: string) {}

  async sendMessage(message: string, conversationId?: string) {
    const response = await axios.post(
      `${API_BASE_URL}/api/chat`,
      { message, conversation_id: conversationId },
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'X-User-Id': this.userId,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  async getHistory(conversationId?: string, limit = 50) {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);
    params.append('limit', limit.toString());

    const response = await axios.get(
      `${API_BASE_URL}/api/chat/history?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'X-User-Id': this.userId
        }
      }
    );
    return response.data;
  }
}

// Usage
const chat = new ChatAPI(token, userId);
const result = await chat.sendMessage('Add a task to buy groceries');
console.log(result.response);
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class ChatAPI:
    def __init__(self, token: str, user_id: str, base_url: str = "https://api.evolve-todo.com"):
        self.token = token
        self.user_id = user_id
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {token}",
            "X-User-Id": user_id,
            "Content-Type": "application/json"
        }

    def send_message(self, message: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        payload = {"message": message}
        if conversation_id:
            payload["conversation_id"] = conversation_id

        response = requests.post(
            f"{self.base_url}/api/chat",
            json=payload,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def get_history(self, conversation_id: Optional[str] = None, limit: int = 50) -> Dict[str, Any]:
        params = {"limit": limit}
        if conversation_id:
            params["conversation_id"] = conversation_id

        response = requests.get(
            f"{self.base_url}/api/chat/history",
            params=params,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage
chat = ChatAPI(token, user_id)
result = chat.send_message("Add a task to buy groceries")
print(result["response"])
```

---

## Testing

### Health Check

```bash
curl https://api.evolve-todo.com/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "todo-api",
  "version": "3.0.0"
}
```

### MCP Server Status

```bash
curl https://api.evolve-todo.com/mcp/sse
```

**Response:** SSE stream with connection status

---

## Changelog

### Version 3.0.0 (2026-02-12)
- Initial release of AI-powered chat feature
- Added chat endpoints for conversational task management
- Implemented MCP server with 4 task management tools
- Added conversation history persistence
- Implemented rate limiting (60 req/min)
- Added comprehensive error handling

---

## Support

For API support and questions:
- Documentation: https://docs.evolve-todo.com
- GitHub Issues: https://github.com/evolve-todo/issues
- Email: support@evolve-todo.com

---

**End of API Documentation**
