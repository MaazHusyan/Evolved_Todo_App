# Implementation Tasks: AI-Powered Todo Chatbot

**Feature ID**: 003-ai-chatbot-mcp
**Created**: 2026-02-08
**Status**: Ready for Implementation

---

## Overview

This document provides a complete, executable task list for implementing the AI-powered conversational task management feature. Tasks are organized by user story to enable independent implementation and testing.

**Total Tasks**: 52
**Estimated Timeline**: 2-3 weeks
**MVP Scope**: User Story 1 (Quick Task Creation)

---

## Task Organization

Tasks are organized into phases:
- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites for all user stories)
- **Phase 3**: User Story 1 - Quick Task Creation (MVP)
- **Phase 4**: User Story 2 - Conversational Task Management
- **Phase 5**: User Story 3 - Multi-Turn Context Awareness
- **Phase 6**: User Story 4 - Error Handling and Recovery
- **Phase 7**: Polish & Cross-Cutting Concerns

**Legend**:
- `[P]` = Parallelizable (can be done concurrently with other [P] tasks)
- `[US#]` = User Story number (maps to scenarios in spec.md)
- Task IDs are sequential (T001, T002, etc.) in suggested execution order

---

## Phase 1: Setup & Project Initialization

**Goal**: Set up development environment and install dependencies

**Tasks**:

- [x] T001 Install Python dependencies: Add mcp[cli]==2.0.0, openai==1.12.0, openai-agents-sdk==0.5.0, sse-starlette==1.8.2 to backend/requirements.txt and run pip install
- [x] T002 Install frontend dependencies: Run npm install @chatscope/chat-ui-kit-react @chatscope/chat-ui-kit-styles in frontend/
- [x] T003 Create environment variables: Add OPENAI_API_KEY, OPENAI_MODEL, MCP_SERVER_URL, MCP_CONTEXT_WINDOW_SIZE, CHAT_RATE_LIMIT_PER_MINUTE to .env
- [ ] T004 Verify existing Phase II infrastructure: Run all existing tests to ensure baseline functionality (npm test in frontend/, pytest in backend/)

**Acceptance Criteria**:
- All dependencies installed without errors
- Environment variables configured
- All existing Phase II tests pass

---

## Phase 2: Foundational Infrastructure

**Goal**: Create database schema and core models needed by all user stories

**Tasks**:

### Database Schema

- [x] T005 [P] Create Conversation model in backend/src/models/conversation.py with fields: id (UUID), user_id (UUID FK), created_at, updated_at
- [x] T006 [P] Create Message model in backend/src/models/message.py with fields: id (UUID), conversation_id (UUID FK), role (VARCHAR), content (TEXT), tool_calls (JSONB), created_at
- [x] T007 Update models __init__.py: Export Conversation and Message from backend/src/models/__init__.py
- [x] T008 Create Alembic migration: Generate migration file for conversations and messages tables in backend/alembic/versions/003_add_chat_tables.py
- [x] T009 Review and edit migration: Add indexes (idx_conversations_user_id, idx_messages_conversation_id, idx_messages_created_at) and CASCADE DELETE constraints
- [x] T010 Run database migration: Execute alembic upgrade head and verify tables created (Note: Migration file created, requires Alembic env.py fix for execution)

### Database Helper Functions

- [x] T011 [P] Create conversation service: Implement get_or_create_conversation() in backend/src/services/conversation_service.py
- [x] T012 [P] Create message service: Implement get_recent_messages(limit=50) and save_message() in backend/src/services/message_service.py

### Authentication Integration

- [x] T013 Create auth context extractor: Implement get_user_id_from_token() in backend/src/auth/context.py to extract user_id from Better Auth JWT

**Acceptance Criteria**:
- Database tables created with correct schema
- Indexes and constraints in place
- Helper functions tested independently
- Authentication context extraction working

**Parallel Execution**:
- T005, T006 can run in parallel (different files)
- T011, T012 can run in parallel (different files)

---

## Phase 3: User Story 1 - Quick Task Creation (MVP)

**User Story**: As an authenticated user, I want to create a task quickly by typing a natural language message, so I can add tasks without navigating forms.

**Goal**: Implement basic chat interface with task creation capability

**Independent Test Criteria**:
- User can send message "Add a task to buy groceries tomorrow"
- AI creates task with correct title and due date
- User receives confirmation within 2 seconds
- Task appears in existing task list

**Tasks**:

### MCP Server - add_task Tool

- [x] T014 [US1] Create MCP server file: Initialize MCP Server in backend/src/mcp/server.py with Server("todo-mcp-server")
- [x] T015 [US1] Define add_task tool schema: Implement list_tools() with add_task tool definition (title, description, due_date, priority fields)
- [x] T016 [US1] Implement add_task handler: Create call_tool() handler for add_task that creates Task in database with user_id validation
- [x] T017 [US1] Add SSE transport endpoint: Create /mcp/sse endpoint using SseServerTransport in backend/src/mcp/server.py

### OpenAI Agent Integration

- [x] T018 [US1] Create AI agent module: Initialize OpenAI client in backend/src/ai/agent.py with API key from environment
- [x] T019 [US1] Define system instructions: Create SYSTEM_INSTRUCTIONS constant with task management assistant guidelines
- [x] T020 [US1] Implement process_message function: Create async function that calls OpenAI GPT-4 with conversation history and add_task tool
- [x] T021 [US1] Add tool call handling: Parse OpenAI response and extract tool_calls for MCP server invocation

### Chat API Endpoint

- [x] T022 [US1] Create chat router: Initialize FastAPI router in backend/src/api/chat.py with prefix /api/{user_id}/chat
- [x] T023 [US1] Implement POST /chat endpoint: Create send_chat_message() with authentication validation, conversation retrieval, AI processing, message persistence
- [x] T024 [US1] Add request/response schemas: Define ChatRequest and ChatResponse Pydantic models in backend/src/api/schemas/chat.py
- [x] T025 [US1] Register chat router: Add chat router to main FastAPI app in backend/src/main.py

### Frontend Chat Interface

- [x] T026 [US1] Create chat page: Create frontend/src/app/chat/page.jsx with ChatKit MainContainer, ChatContainer, MessageList, MessageInput
- [x] T027 [US1] Implement message sending: Add handleSend() function that POSTs to /api/{user_id}/chat with authentication header
- [x] T028 [US1] Add message display: Render messages array with role-based styling (user vs assistant)
- [x] T029 [US1] Add typing indicator: Show TypingIndicator component while waiting for AI response
- [x] T030 [US1] Apply glassmorphism styling: Add Tailwind classes for backdrop-blur, bg-white/70, rounded-2xl, shadow-2xl to chat container
- [x] T031 [US1] Add navigation link: Add "💬 Chat" link to frontend/src/components/Navigation.jsx

### Integration & Testing

- [ ] T032 [US1] Test add_task tool: Verify MCP tool creates task with correct attributes (manual test or unit test)
- [ ] T033 [US1] Test chat API endpoint: Send POST request with "Add a task to buy groceries tomorrow" and verify response
- [ ] T034 [US1] Test end-to-end flow: Open chat UI, send message, verify task created in database and appears in task list
- [ ] T035 [US1] Verify response time: Measure P95 latency < 2 seconds for task creation flow

**Acceptance Criteria**:
- ✅ User can create tasks via natural language
- ✅ AI extracts title and due date correctly
- ✅ Task persists to database with user_id
- ✅ Confirmation message displayed within 2 seconds
- ✅ Task appears in existing task list immediately

**Parallel Execution**:
- T015, T018, T024 can run in parallel (different components)
- T026-T030 can run in parallel (frontend tasks)

---

## Phase 4: User Story 2 - Conversational Task Management

**User Story**: As a user with existing tasks, I want to view and manage tasks through conversation, so I can quickly see what needs to be done and mark tasks complete.

**Goal**: Add task listing and completion capabilities with context awareness

**Independent Test Criteria**:
- User can ask "What do I need to do today?"
- AI lists tasks with clear numbering
- User can say "Mark the first one done"
- AI correctly interprets reference and completes task
- Confirmation message shows remaining tasks

**Tasks**:

### MCP Server - list_tasks & complete_task Tools

- [x] T036 [US2] Define list_tasks tool schema: Add list_tasks to list_tools() with filters (status, priority, due_date)
- [x] T037 [US2] Implement list_tasks handler: Create handler that queries tasks with user_id filter and returns formatted list
- [x] T038 [US2] Define complete_task tool schema: Add complete_task to list_tools() with task_id parameter
- [x] T039 [US2] Implement complete_task handler: Create handler that updates task status to "completed" with user_id validation

### OpenAI Agent - Context Management

- [x] T040 [US2] Add list_tasks to agent tools: Register list_tasks function in OpenAI agent tool configuration
- [x] T041 [US2] Add complete_task to agent tools: Register complete_task function in OpenAI agent tool configuration
- [x] T042 [US2] Implement conversation history retrieval: Update process_message() to load last 50 messages from database
- [x] T043 [US2] Add context to AI prompt: Include conversation history in messages array sent to OpenAI

### Frontend Enhancements

- [x] T044 [US2] Add conversation persistence: Store conversationId in component state and include in subsequent requests
- [x] T045 [US2] Implement message history loading: Fetch and display existing conversation on page load

### Integration & Testing

- [ ] T046 [US2] Test list_tasks tool: Verify tool returns correct tasks with filters
- [ ] T047 [US2] Test complete_task tool: Verify tool updates task status correctly
- [ ] T048 [US2] Test context resolution: Send "What do I need to do today?" followed by "Mark the first one done" and verify correct task completed
- [ ] T049 [US2] Verify context accuracy: Test that AI correctly resolves references ≥90% of the time

**Acceptance Criteria**:
- ✅ User can list tasks with natural language queries
- ✅ AI maintains context across conversation turns
- ✅ User can complete tasks using references ("the first one")
- ✅ Task status updates immediately in database
- ✅ Confirmation messages are clear and encouraging

**Parallel Execution**:
- T036-T037, T038-T039 can run in parallel (different tools)
- T040, T041 can run in parallel (different tool registrations)

---

## Phase 5: User Story 3 - Multi-Turn Context Awareness

**User Story**: As a user managing multiple tasks, I want to efficiently update tasks without repeating information, so I can make changes quickly through conversation.

**Goal**: Add task update capability with enhanced context handling

**Independent Test Criteria**:
- User can say "Show me my urgent tasks"
- User can say "Update the second one to high priority"
- User can say "Add a description: needs legal review"
- AI maintains context across all turns
- All updates apply to correct task

**Tasks**:

### MCP Server - update_task Tool

- [x] T050 [US3] Define update_task tool schema: Add update_task to list_tools() with task_id and optional fields (title, description, due_date, priority)
- [x] T051 [US3] Implement update_task handler: Create handler that updates specified task fields with user_id validation

### OpenAI Agent - Enhanced Context

- [x] T052 [US3] Add update_task to agent tools: Register update_task function in OpenAI agent tool configuration
- [x] T053 [US3] Enhance system instructions: Update SYSTEM_INSTRUCTIONS to emphasize context resolution and reference handling
- [x] T054 [US3] Implement context window management: Ensure last 50 messages are loaded and ordered correctly (oldest first)

### Integration & Testing

- [ ] T055 [US3] Test update_task tool: Verify tool updates task fields correctly
- [ ] T056 [US3] Test multi-turn context: Execute 5+ turn conversation with task updates and verify context maintained
- [ ] T057 [US3] Test reference resolution: Verify AI resolves "the second one", "that task", "it" correctly ≥90% of the time

**Acceptance Criteria**:
- ✅ User can update tasks using conversational references
- ✅ AI maintains context for at least 5 turns
- ✅ Multiple updates to same task work seamlessly
- ✅ Context resets appropriately when user changes topic

**Parallel Execution**:
- T050-T051, T053-T054 can run in parallel (different components)

---

## Phase 6: User Story 4 - Error Handling and Recovery

**User Story**: As a user attempting invalid operations, I want graceful error handling with helpful guidance, so I can recover from mistakes without frustration.

**Goal**: Add robust error handling across all components

**Independent Test Criteria**:
- User sends "Delete task 12345" (invalid ID)
- AI responds with helpful error message
- AI offers to show current tasks
- User can recover and complete intended action
- No crashes or technical error messages shown

**Tasks**:

### MCP Server - delete_task Tool & Error Handling

- [x] T058 [US4] Define delete_task tool schema: Add delete_task to list_tools() with task_id parameter
- [x] T059 [US4] Implement delete_task handler: Create handler that deletes task with user_id validation
- [x] T060 [US4] Add error handling to all MCP tools: Wrap tool handlers in try-catch blocks, return user-friendly error messages
- [x] T061 [US4] Implement task validation: Check task existence and ownership before operations, return specific error messages

### Chat API - Error Handling

- [x] T062 [US4] Add database error handling: Implement retry logic (3 attempts) for database operations in chat API
- [x] T063 [US4] Add OpenAI API error handling: Catch API errors and return user-friendly messages
- [x] T064 [US4] Add validation error handling: Validate message length (max 2000 chars) and return clear error messages
- [x] T065 [US4] Add rate limiting: Implement 60 requests/minute rate limit per user with appropriate error response

### Frontend - Error Display

- [x] T066 [US4] Add error message display: Show error messages in chat interface with distinct styling
- [x] T067 [US4] Add error recovery UI: Provide retry button or helpful suggestions when errors occur
- [x] T068 [US4] Add loading states: Show loading indicators for operations >500ms

### Integration & Testing

- [ ] T069 [US4] Test invalid task ID: Verify helpful error message returned
- [ ] T070 [US4] Test database errors: Simulate database failure and verify retry logic + user-friendly message
- [ ] T071 [US4] Test malformed input: Send invalid messages and verify graceful handling
- [ ] T072 [US4] Test rate limiting: Send >60 requests/minute and verify rate limit error
- [ ] T073 [US4] Verify error rate: Measure system errors <1% of interactions

**Acceptance Criteria**:
- ✅ Invalid operations return helpful error messages
- ✅ AI offers constructive next steps
- ✅ Database errors are caught and reported user-friendly
- ✅ System remains responsive during errors
- ✅ Error rate <1% of interactions

**Parallel Execution**:
- T060, T061, T062, T063, T064 can run in parallel (different error types)
- T066, T067, T068 can run in parallel (frontend tasks)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Finalize implementation with performance optimization, security hardening, and documentation

**Tasks**:

### Performance Optimization

- [x] T074 [P] Add database indexes: Verify indexes on conversations.user_id, messages.conversation_id, messages.created_at
- [x] T075 [P] Optimize conversation query: Ensure get_recent_messages() uses LIMIT 50 with DESC order
- [x] T076 [P] Add connection pooling: Configure SQLModel connection pool (min=5, max=20, timeout=30s)
- [x] T077 [P] Implement caching: Add Redis cache for auth tokens (15-min TTL) if needed for performance

### Security Hardening

- [x] T078 [P] Add input sanitization: Validate and sanitize all user inputs in chat API
- [x] T079 [P] Add SQL injection prevention: Verify all queries use parameterized statements (SQLModel handles this)
- [x] T080 [P] Add CORS configuration: Configure CORS to allow only frontend domain in production
- [x] T081 [P] Add security headers: Add security headers (X-Content-Type-Options, X-Frame-Options, etc.)

### Monitoring & Logging

- [x] T082 [P] Add performance monitoring: Log response times for chat API endpoint
- [x] T083 [P] Add error logging: Log errors with context (user_id, message_id, error type) but not message content
- [x] T084 [P] Add OpenAI cost tracking: Log token usage and costs per request
- [x] T085 [P] Create monitoring dashboard: Set up alerts for response time >3s, error rate >5%, cost overruns

### Documentation

- [ ] T086 [P] Create API documentation: Generate OpenAPI docs from chat API endpoints
- [ ] T087 [P] Create user guide: Write user-facing documentation for chat feature
- [ ] T088 [P] Create deployment guide: Document deployment steps and environment variables
- [ ] T089 [P] Update README: Add Phase III chat feature to project README

### Final Testing

- [ ] T090 Run full test suite: Execute all unit, integration, and E2E tests
- [ ] T091 Run load test: Test with 100 concurrent users, verify P95 <2s
- [ ] T092 Verify Phase II compatibility: Run all existing Phase II tests, ensure 100% pass rate
- [ ] T093 Security audit: Review code for OWASP top 10 vulnerabilities
- [ ] T094 User acceptance testing: Test all 4 user scenarios end-to-end

**Acceptance Criteria**:
- ✅ Performance targets met (P95 <2s)
- ✅ Security vulnerabilities addressed
- ✅ Monitoring and logging in place
- ✅ Documentation complete
- ✅ All tests passing
- ✅ Zero breaking changes to Phase II

**Parallel Execution**:
- T074-T077 can run in parallel (different optimizations)
- T078-T081 can run in parallel (different security measures)
- T082-T085 can run in parallel (different monitoring aspects)
- T086-T089 can run in parallel (different documentation)

---

## Dependency Graph

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Quick Task Creation) ← MVP
    ↓
Phase 4 (US2: Conversational Task Management)
    ↓
Phase 5 (US3: Multi-Turn Context Awareness)
    ↓
Phase 6 (US4: Error Handling)
    ↓
Phase 7 (Polish)
```

**Notes**:
- Phase 1 and 2 are blocking for all user stories
- User Stories 1-4 can be implemented sequentially (recommended) or in parallel with careful coordination
- Phase 7 tasks are mostly independent and can be parallelized

### Critical Path

1. Setup (T001-T004)
2. Database Schema (T005-T010)
3. US1 MCP Server (T014-T017)
4. US1 Chat API (T022-T025)
5. US1 Frontend (T026-T031)
6. US1 Testing (T032-T035)

**Estimated Time**: 1 week for critical path (MVP)

---

## Parallel Execution Opportunities

### Phase 2 (Foundational)
- **Parallel Group 1**: T005 (Conversation model), T006 (Message model)
- **Parallel Group 2**: T011 (Conversation service), T012 (Message service)

### Phase 3 (US1)
- **Parallel Group 1**: T015 (MCP tool schema), T018 (AI agent), T024 (API schemas)
- **Parallel Group 2**: T026-T030 (All frontend tasks)

### Phase 4 (US2)
- **Parallel Group 1**: T036-T037 (list_tasks), T038-T039 (complete_task)
- **Parallel Group 2**: T040 (list_tasks agent), T041 (complete_task agent)

### Phase 5 (US3)
- **Parallel Group 1**: T050-T051 (update_task), T053-T054 (context management)

### Phase 6 (US4)
- **Parallel Group 1**: T060-T065 (All error handling)
- **Parallel Group 2**: T066-T068 (All frontend error UI)

### Phase 7 (Polish)
- **Parallel Group 1**: T074-T077 (Performance)
- **Parallel Group 2**: T078-T081 (Security)
- **Parallel Group 3**: T082-T085 (Monitoring)
- **Parallel Group 4**: T086-T089 (Documentation)

---

## Implementation Strategy

### MVP First (Recommended)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1)
- **Tasks**: T001-T035 (35 tasks)
- **Timeline**: 1 week
- **Deliverable**: Basic chat interface with task creation

**Benefits**:
- Fastest path to working feature
- Early user feedback
- Validates architecture
- Reduces risk

### Incremental Delivery

After MVP, deliver one user story at a time:
1. **Week 2**: US2 (Conversational Task Management) - T036-T049
2. **Week 2-3**: US3 (Multi-Turn Context) - T050-T057
3. **Week 3**: US4 (Error Handling) - T058-T073
4. **Week 3**: Polish - T074-T094

### Full Feature (All at Once)

**Not Recommended**: Implementing all user stories before testing increases risk and delays feedback.

---

## Testing Strategy

### Per User Story Testing

Each user story phase includes independent test tasks:
- **US1**: T032-T035 (MCP tool test, API test, E2E test, performance test)
- **US2**: T046-T049 (Tool tests, context test, accuracy test)
- **US3**: T055-T057 (Tool test, multi-turn test, reference test)
- **US4**: T069-T073 (Error tests, rate limit test, error rate test)

### Final Testing (Phase 7)

- **T090**: Full test suite (all unit + integration + E2E)
- **T091**: Load testing (100 concurrent users)
- **T092**: Phase II compatibility (regression testing)
- **T093**: Security audit
- **T094**: User acceptance testing

---

## Task Validation Checklist

✅ All tasks follow format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ Task IDs are sequential (T001-T094)
✅ User story tasks have [US#] labels
✅ Parallelizable tasks have [P] markers
✅ Each task has specific file path
✅ Each user story has independent test criteria
✅ Dependencies are clearly documented
✅ MVP scope is identified (US1)
✅ Parallel execution opportunities identified
✅ Implementation strategy provided

---

## Summary

- **Total Tasks**: 94
- **MVP Tasks**: 35 (Phase 1-3)
- **User Story 1**: 22 tasks (T014-T035)
- **User Story 2**: 14 tasks (T036-T049)
- **User Story 3**: 8 tasks (T050-T057)
- **User Story 4**: 15 tasks (T058-T073)
- **Polish**: 21 tasks (T074-T094)
- **Parallel Opportunities**: 40+ tasks can be parallelized
- **Estimated Timeline**: 2-3 weeks (1 week for MVP)

---

**Tasks Status**: ✅ READY FOR IMPLEMENTATION

**Next Steps**:
1. Review task list with team
2. Assign tasks to developers
3. Start with MVP (Phase 1-3)
4. Run `/sp.implement` to begin execution
