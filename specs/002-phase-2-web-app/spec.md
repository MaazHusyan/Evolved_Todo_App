# Feature Specification: Phase II - Todo Full-Stack Web Application

**Feature Branch**: `002-phase-2-web-app`
**Status**: Revised
**Objective**: Transform the existing CLI todo app into a modern multi-user web application using Next.js (App Router), FastAPI, and Better Auth.

## ⚠️ OVERRIDE & REFACTOR MANDATE
This specification explicitly **OVERRIDES** previous instructions and requires the **REMOVAL or REFACTORING** of existing incompatible code:
1. **Frontend Router**: The current `src/pages` (Pages Router) implementation is **DEPRECATED**. It MUST be replaced with **Next.js App Router** (`src/app`).
2. **Authentication**: Any existing "Custom JWT" implementation in the backend MUST be replaced/refactored to integrate with **Better Auth**.

---

## 1. Core Architecture & Stack
- **Frontend**: Next.js 16+ (JavaScript) using **App Router**.
- **Backend**: Python FastAPI.
- **Database**: Neon Serverless PostgreSQL (via MCP).
- **ORM**: SQLModel.
- **Authentication**: **Better Auth** (User management, session/token handling).
- **Deployment**: Backend → Hugging Face Spaces (Docker); Frontend → Vercel.
- **Logic**: Reuse existing decoupled core engine where possible, extending for multi-user support.

## 2. Phase Organization (Sequential)

### Section I: Backend Infrastructure (FastAPI + Neon + Better Auth)
- **Database**: Setup Neon PostgreSQL via MCP. Define SQLModel schemas (User, Task).
- **Auth**: Integrate **Better Auth** for Python.
  - Implement/Verify User Sign-up/Sign-in endpoints.
  - Secure API middleware to validate Better Auth sessions/tokens.
- **API Endpoints**:
  - `GET /api/v1/tasks` (List own tasks)
  - `POST /api/v1/tasks` (Create task)
  - `GET /api/v1/tasks/{id}` (Get task)
  - `PUT /api/v1/tasks/{id}` (Update task)
  - `DELETE /api/v1/tasks/{id}` (Delete task)
  - `PATCH /api/v1/tasks/{id}/complete` (Toggle status)
- **Constraint**: All endpoints must derive user context from the auth token; users see *only* their data.

### Section II: Frontend Development (Next.js App Router)
- **Setup**: Initialize Next.js 16+ App Router structure (`src/app`).
  - **Action**: Delete/Archive existing `src/pages` directory.
- **Integration**:
  - Setup Better Auth client-side library.
  - Create API client for backend communication.
- **Views**:
  - `/login` & `/register`: Auth forms.
  - `/dashboard`: Main task list view.
- **Constraint**: Functional implementation first. Minimal styling.

### Section III: UI Design (Orchestrator Skill)
- **Mandate**: Use the **`nextjs-stunning-ui-orchestrator`** Claude skill.
- **Scope**: Apply modern styling, responsiveness, and theming to the functional components built in Section II.

### Section IV: Integration & Deployment
- **Backend**: Create `Dockerfile` for Hugging Face Spaces.
- **Frontend**: Configure for Vercel deployment.
- **Validation**: End-to-end testing of the full flow (Auth -> Create Task -> Persist -> Logout -> Login -> Verify).

## 3. Data Model & Security
- **User**: `id` (PK), `email`, `name`, `created_at`.
- **Task**: `id` (PK), `user_id` (FK), `title`, `description`, `is_completed`, `created_at`.
- **Security**:
  - API rejects requests without valid Better Auth credentials (401).
  - Database queries ALWAYS filter by `user_id` from the auth context.

## 4. Success Criteria
- [ ] Backend: Validates Better Auth tokens and isolates user data.
- [ ] Frontend: Uses App Router (`src/app`); `src/pages` is removed.
- [ ] UI: Professionally styled via Orchestrator skill.
- [ ] Deploy: Live on Vercel (Front) and Hugging Face (Back).
