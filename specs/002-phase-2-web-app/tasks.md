# Tasks: Phase II - Todo Full-Stack Web Application

**Feature**: `002-phase-2-web-app`
**Status**: Pending
**Spec**: [specs/002-phase-2-web-app/spec.md](./spec.md)

## Phase 1: Setup & Cleanup (Prerequisite)
*Goal: Prepare the codebase for the new architecture by removing legacy artifacts.*

- [ ] T001 Remove deprecated Pages Router directory `frontend/src/pages`
- [ ] T002 Create App Router directory structure `frontend/src/app`
- [ ] T003 Clean up `frontend/src/components` of unused legacy components
- [ ] T004 Create `frontend/src/app/layout.js` (or .jsx) with root layout structure

## Phase 2: Section I - Backend Infrastructure
*Goal: Implement secure, persistent backend with Better Auth token verification.*

- [ ] T005 [P] Setup Neon PostgreSQL connection using `sqlmodel` in `backend/src/models/base.py`
- [ ] T006 [P] Define `User` and `Task` SQLModel classes in `backend/src/models/` matching the spec
- [ ] T007 Configure `BETTER_AUTH_SECRET` in backend environment and `backend/src/auth/config.py`
- [ ] T008 Implement JWT validation middleware in `backend/src/auth/middleware.py` (Must verify tokens signed by Better Auth)
- [ ] T009 Refactor `backend/src/api/tasks.py` to use `api/v1` prefix and enforce user isolation
- [ ] T010 Refactor `backend/src/main.py` to mount the v1 routers
- [ ] T011 Verify backend rejects unauthenticated requests (curl/test)

## Phase 3: Section II - Frontend Development
*Goal: Build the functional Next.js application using App Router and Better Auth.*

- [ ] T012 Install and configure `@better-auth/cli` and client libraries in `frontend/package.json`
- [ ] T013 Create Better Auth API route handler in `frontend/src/app/api/auth/[...all]/route.js`
- [ ] T014 Implement Auth Client helper in `frontend/src/lib/auth-client.js`
- [ ] T015 Create Login page at `frontend/src/app/(auth)/login/page.jsx`
- [ ] T016 Create Register page at `frontend/src/app/(auth)/register/page.jsx`
- [ ] T017 Create Dashboard page at `frontend/src/app/(dashboard)/dashboard/page.jsx`
- [ ] T018 Implement `frontend/src/services/api.js` to attach Auth headers to requests
- [ ] T019 Connect Dashboard UI to Backend API (Fetch/Create/Delete tasks)

## Phase 4: Section III - UI Polish
*Goal: Apply professional styling using the Orchestrator skill.*

- [ ] T020 [SKILL] Invoke `nextjs-stunning-ui-orchestrator` to style the Auth pages
- [ ] T021 [SKILL] Invoke `nextjs-stunning-ui-orchestrator` to style the Dashboard and Task list

## Phase 5: Section IV - Integration & Deployment
*Goal: Deploy the full stack to production environments.*

- [ ] T022 Create `backend/Dockerfile` optimized for Hugging Face Spaces
- [ ] T023 Create `vercel.json` (if needed) and configure build settings for Frontend
- [ ] T024 Perform end-to-end verification of the full user flow (Signup -> Task -> Logout -> Login -> Verify)

## Dependencies
- Phase 2 MUST complete before Phase 3 (API needed for Frontend integration)
- Phase 3 MUST complete before Phase 4 (Components need to exist to be styled)
- Phase 4 MUST complete before Phase 5 (Production build)
