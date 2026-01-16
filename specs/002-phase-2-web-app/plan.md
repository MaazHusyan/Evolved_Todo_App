# Implementation Plan: Phase II - Todo Web App

**Spec**: [specs/002-phase-2-web-app/spec.md](./spec.md)
**Status**: Revised

## Execution Strategy
This plan follows a strict sequential order. **Do not jump between sections.**

### 🛑 Prerequisite: Cleanup & Refactor
- **Task**: Remove `frontend/src/pages` directory.
- **Task**: Move/Refactor any reusable logic (services/components) to support App Router structure.

### Section I: Backend (Infrastructure & Auth)
1. **Database**: Initialize Neon PostgreSQL. Create SQLModel tables (`User`, `Task`).
2. **Auth Integration**:
   - Install/Configure Better Auth for FastAPI.
   - Replace existing "Custom JWT" logic with Better Auth verification.
3. **API Implementation**:
   - Update `main.py` and routers to use `api/v1` prefix.
   - Refactor CRUD endpoints to enforce `user_id` from auth context.
   - Verify: `curl` tests to ensure data isolation.

### Section II: Frontend (Functional App Router)
1. **Structure**: Create `frontend/src/app`.
   - `app/layout.js`: Root layout with Auth Provider.
   - `app/page.js`: Landing/Redirect.
   - `app/(auth)/login/page.js`: Login route.
   - `app/(dashboard)/dashboard/page.js`: Protected task view.
2. **Client**: Implement API client with auth header injection.
3. **State**: Simple React state management for Task list (Add/Edit/Delete).

### Section III: UI Polish (Skill Invocation)
1. **Action**: Invoke `nextjs-stunning-ui-orchestrator`.
   - Target: `frontend/src/app` components.
   - Goal: Modern, responsive UI transformation.

### Section IV: Deployment
1. **Backend**:
   - Create `backend/Dockerfile` (Python 3.10+).
   - Configure Hugging Face Space (Docker).
2. **Frontend**:
   - Configure Vercel build settings.
   - Set environment variables (`NEXT_PUBLIC_API_URL`, etc.).

## Verification Checklist
- [ ] Old `src/pages` does not exist.
- [ ] Backend rejects unauthenticated requests.
- [ ] User A cannot see User B's tasks.
- [ ] UI is responsive and styled.
