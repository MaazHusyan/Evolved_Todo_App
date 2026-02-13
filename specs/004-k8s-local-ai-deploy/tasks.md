# Implementation Tasks: Phase IV - Local Kubernetes Deployment

**Feature**: Local Kubernetes Deployment with AI-Assisted DevOps
**Branch**: `004-k8s-local-ai-deploy`
**Status**: Ready for Implementation
**Created**: 2026-02-12

---

## Overview

This document contains actionable, dependency-ordered tasks for implementing Phase IV. Tasks are organized by user story to enable independent implementation and testing. Each task follows the strict checklist format with task ID, parallelization marker, story label, and file path.

**Total Tasks**: 68
**Estimated Time**: 3-5 days with AI assistance
**MVP Scope**: US1 (Containerization) + US2 (Minikube Setup) + US3 (Kubernetes Manifests)

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential number (T001, T002, etc.)
- **[P]**: Parallelizable task (different files, no dependencies)
- **[Story]**: User story label ([US1], [US2], etc.) - only for user story phases
- **Description**: Clear action with exact file path

---

## Dependencies

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational)
                ↓
Phase 3 (US1: Containerization)
                ↓
Phase 4 (US2: Minikube Setup)
                ↓
Phase 5 (US3: Kubernetes Manifests)
                ↓
Phase 6 (US4: Helm Charts)
                ↓
Phase 7 (US5: Automation Scripts)
                ↓
Phase 8 (US6: AI Tools Documentation)
                ↓
Phase 9 (Polish & Documentation)
```

**Critical Path**: Setup → Foundational → US1 → US2 → US3 → US4 → US5

**Parallel Opportunities**:
- Within US1: Frontend and backend Dockerfiles can be created in parallel
- Within US3: Frontend and backend manifests can be created in parallel
- Within US4: Frontend and backend Helm charts can be created in parallel
- US6 (AI Tools Documentation) can be done in parallel with US5 (Automation)

---

## Phase 1: Setup (Project Initialization)

**Goal**: Set up project structure and verify prerequisites

**Tasks**: 5

- [x] T001 Create project directory structure for Kubernetes artifacts in project root
- [x] T002 Create `k8s/` directory for Kubernetes manifests
- [x] T003 Create `helm/` directory for Helm charts
- [x] T004 Create `scripts/` directory for automation scripts
- [x] T005 Create `docs/` directory for Kubernetes documentation

**Acceptance Criteria**:
- ✅ All directories created
- ✅ Directory structure matches plan.md specification
- ✅ No errors during directory creation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Implement health check endpoints required for Kubernetes probes

**Tasks**: 4

- [x] T006 Implement `/health` liveness endpoint in backend at `backend/src/api/health.py`
- [x] T007 Implement `/ready` readiness endpoint with database connectivity check in `backend/src/api/health.py`
- [x] T008 Register health check routes in FastAPI app at `backend/src/main.py`
- [x] T009 Test health check endpoints locally with curl

**Acceptance Criteria**:
- ✅ `/health` endpoint returns `{"status": "healthy"}` with 200 status
- ✅ `/ready` endpoint checks database connectivity and returns 200 if ready, 503 if not
- ✅ Endpoints registered in FastAPI app
- ✅ Local testing confirms endpoints work

---

## Phase 3: US1 - AI-Assisted Containerization

**User Story**: As a developer, I want to containerize the frontend and backend applications using Docker AI (Gordon) so that they can run in Kubernetes with optimized images under 500MB each.

**Functional Requirements**: FR-001 (AI-Assisted Docker Operations), FR-002 (Multi-Service Containerization)

**Priority**: High

**Tasks**: 12

### Backend Containerization

- [x] T010 [P] [US1] Create `.dockerignore` file for backend at `backend/.dockerignore`
- [x] T011 [US1] Use Gordon to generate multi-stage Dockerfile for FastAPI backend: `docker ai "create optimized multi-stage Dockerfile for FastAPI Python 3.13 backend with minimal image size"`
- [x] T012 [US1] Review and refine Gordon-generated Dockerfile, save to `backend/Dockerfile`
- [x] T013 [US1] Add non-root user (UID 1001) to backend Dockerfile
- [x] T014 [US1] Configure backend Dockerfile to expose port 8000
- [ ] T015 [US1] Test backend Docker build locally: `docker build -t todo-backend:latest ./backend`
- [ ] T016 [US1] Verify backend image size is under 300MB: `docker images todo-backend:latest`

### Frontend Containerization

- [x] T017 [P] [US1] Create `.dockerignore` file for frontend at `frontend/.dockerignore`
- [x] T018 [US1] Use Gordon to generate multi-stage Dockerfile for Next.js frontend: `docker ai "create optimized multi-stage Dockerfile for Next.js 16 frontend with production build"`
- [x] T019 [US1] Review and refine Gordon-generated Dockerfile, save to `frontend/Dockerfile`
- [x] T020 [US1] Add non-root user (UID 1001) to frontend Dockerfile
- [x] T021 [US1] Configure frontend Dockerfile to expose port 3000
- [ ] T022 [US1] Test frontend Docker build locally: `docker build -t todo-frontend:latest ./frontend`
- [ ] T023 [US1] Verify frontend image size is under 250MB: `docker images todo-frontend:latest`

### Testing

- [ ] T024 [US1] Test backend container locally: `docker run -p 8000:8000 -e DATABASE_URL=<test-url> todo-backend:latest`
- [ ] T025 [US1] Test frontend container locally: `docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8000 todo-frontend:latest`
- [ ] T026 [US1] Verify health check endpoints work in containers

**Independent Test Criteria**:
- ✅ Backend Dockerfile builds successfully
- ✅ Frontend Dockerfile builds successfully
- ✅ Backend image < 300MB
- ✅ Frontend image < 250MB
- ✅ Both containers run successfully locally
- ✅ Health check endpoints respond correctly in containers
- ✅ Non-root users configured (UID 1001)

---

## Phase 4: US2 - Minikube Cluster Setup

**User Story**: As a developer, I want to set up a local Minikube cluster with required addons so that I can deploy Kubernetes applications locally.

**Functional Requirements**: FR-003 (Local Kubernetes with Minikube)

**Priority**: High

**Tasks**: 8

- [ ] T027 [US2] Create Minikube setup script at `scripts/minikube-setup.sh`
- [ ] T028 [US2] Add prerequisites check to setup script (Docker, Minikube, kubectl, Helm)
- [ ] T029 [US2] Add system resource check to setup script (8GB RAM, 4 CPU cores minimum)
- [ ] T030 [US2] Add Minikube start command with configuration: `minikube start --cpus=2 --memory=4096 --driver=docker`
- [ ] T031 [US2] Add ingress addon enable command: `minikube addons enable ingress`
- [ ] T032 [US2] Add metrics-server addon enable command: `minikube addons enable metrics-server`
- [ ] T033 [US2] Add Docker environment configuration: `eval $(minikube docker-env)`
- [ ] T034 [US2] Test Minikube setup script and verify cluster is running

**Independent Test Criteria**:
- ✅ Minikube starts successfully
- ✅ Ingress addon enabled
- ✅ Metrics-server addon enabled
- ✅ Docker environment configured for Minikube
- ✅ `kubectl cluster-info` shows cluster running
- ✅ `minikube status` shows all components running

---

## Phase 5: US3 - Kubernetes Manifests and Service Discovery

**User Story**: As a developer, I want to create Kubernetes manifests for frontend and backend so that they can be deployed to the cluster with proper service discovery and configuration.

**Functional Requirements**: FR-007 (Service Discovery and Communication)

**Priority**: High

**Tasks**: 14

### Backend Kubernetes Resources

- [ ] T035 [P] [US3] Create backend Deployment manifest at `k8s/backend-deployment.yaml`
- [ ] T036 [P] [US3] Configure backend Deployment with 2 replicas, image `todo-backend:latest`, imagePullPolicy `Never`
- [ ] T037 [P] [US3] Add resource limits to backend Deployment: requests (512Mi RAM, 0.5 CPU), limits (1Gi RAM, 1.0 CPU)
- [ ] T038 [P] [US3] Add liveness probe to backend Deployment: `httpGet /health` on port 8000
- [ ] T039 [P] [US3] Add readiness probe to backend Deployment: `httpGet /ready` on port 8000
- [ ] T040 [P] [US3] Create backend Service manifest at `k8s/backend-service.yaml` with type ClusterIP, port 8000
- [ ] T041 [P] [US3] Create backend Secret manifest at `k8s/backend-secret.yaml` for DATABASE_URL

### Frontend Kubernetes Resources

- [ ] T042 [P] [US3] Create frontend Deployment manifest at `k8s/frontend-deployment.yaml`
- [ ] T043 [P] [US3] Configure frontend Deployment with 2 replicas, image `todo-frontend:latest`, imagePullPolicy `Never`
- [ ] T044 [P] [US3] Add resource limits to frontend Deployment: requests (256Mi RAM, 0.25 CPU), limits (512Mi RAM, 0.5 CPU)
- [ ] T045 [P] [US3] Add liveness probe to frontend Deployment: `httpGet /` on port 3000
- [ ] T046 [P] [US3] Add readiness probe to frontend Deployment: `httpGet /` on port 3000
- [ ] T047 [P] [US3] Create frontend Service manifest at `k8s/frontend-service.yaml` with type NodePort, port 3000, nodePort 30000
- [ ] T048 [P] [US3] Create frontend ConfigMap manifest at `k8s/frontend-configmap.yaml` with API_URL: `http://todo-backend-service:8000`

### Ingress

- [ ] T049 [US3] Create Ingress manifest at `k8s/ingress.yaml` for todo.local domain routing

### Testing

- [ ] T050 [US3] Apply backend Secret with actual DATABASE_URL: `kubectl create secret generic backend-secrets --from-literal=DATABASE_URL=<neon-url>`
- [ ] T051 [US3] Apply backend manifests: `kubectl apply -f k8s/backend-deployment.yaml -f k8s/backend-service.yaml`
- [ ] T052 [US3] Apply frontend manifests: `kubectl apply -f k8s/frontend-configmap.yaml -f k8s/frontend-deployment.yaml -f k8s/frontend-service.yaml`
- [ ] T053 [US3] Apply Ingress manifest: `kubectl apply -f k8s/ingress.yaml`
- [ ] T054 [US3] Verify all pods are Running: `kubectl get pods`
- [ ] T055 [US3] Verify services have endpoints: `kubectl get endpoints`
- [ ] T056 [US3] Test frontend to backend connectivity: `kubectl exec -it deployment/todo-frontend -- curl http://todo-backend-service:8000/health`

**Independent Test Criteria**:
- ✅ All Kubernetes manifests created
- ✅ Backend pods Running (2 replicas)
- ✅ Frontend pods Running (2 replicas)
- ✅ Backend service has endpoints
- ✅ Frontend service has endpoints
- ✅ Frontend can reach backend via service DNS
- ✅ Health checks passing
- ✅ Ingress configured for todo.local

---

## Phase 6: US4 - Helm Chart Packaging

**User Story**: As a developer, I want to create Helm charts for frontend and backend so that I can easily deploy and manage configurations across different environments.

**Functional Requirements**: FR-006 (Helm Chart Packaging)

**Priority**: High

**Tasks**: 20

### Backend Helm Chart

- [ ] T057 [P] [US4] Initialize backend Helm chart: `helm create helm/backend`
- [ ] T058 [P] [US4] Update backend Chart.yaml with correct metadata at `helm/backend/Chart.yaml`
- [ ] T059 [P] [US4] Create backend Deployment template at `helm/backend/templates/deployment.yaml`
- [ ] T060 [P] [US4] Create backend Service template at `helm/backend/templates/service.yaml`
- [ ] T061 [P] [US4] Create backend Secret template at `helm/backend/templates/secret.yaml`
- [ ] T062 [P] [US4] Create backend values.yaml with defaults at `helm/backend/values.yaml`
- [ ] T063 [P] [US4] Create backend values-dev.yaml for development at `helm/backend/values-dev.yaml`
- [ ] T064 [P] [US4] Create backend values-prod.yaml for production at `helm/backend/values-prod.yaml`
- [ ] T065 [P] [US4] Add _helpers.tpl for backend chart at `helm/backend/templates/_helpers.tpl`
- [ ] T066 [US4] Run helm lint on backend chart: `helm lint helm/backend`

### Frontend Helm Chart

- [ ] T067 [P] [US4] Initialize frontend Helm chart: `helm create helm/frontend`
- [ ] T068 [P] [US4] Update frontend Chart.yaml with correct metadata at `helm/frontend/Chart.yaml`
- [ ] T069 [P] [US4] Create frontend Deployment template at `helm/frontend/templates/deployment.yaml`
- [ ] T070 [P] [US4] Create frontend Service template at `helm/frontend/templates/service.yaml`
- [ ] T071 [P] [US4] Create frontend ConfigMap template at `helm/frontend/templates/configmap.yaml`
- [ ] T072 [P] [US4] Create frontend Ingress template at `helm/frontend/templates/ingress.yaml`
- [ ] T073 [P] [US4] Create frontend values.yaml with defaults at `helm/frontend/values.yaml`
- [ ] T074 [P] [US4] Create frontend values-dev.yaml for development at `helm/frontend/values-dev.yaml`
- [ ] T075 [P] [US4] Create frontend values-prod.yaml for production at `helm/frontend/values-prod.yaml`
- [ ] T076 [P] [US4] Add _helpers.tpl for frontend chart at `helm/frontend/templates/_helpers.tpl`
- [ ] T077 [US4] Run helm lint on frontend chart: `helm lint helm/frontend`

### Testing

- [ ] T078 [US4] Uninstall previous kubectl deployments: `kubectl delete -f k8s/`
- [ ] T079 [US4] Install backend Helm chart: `helm install todo-backend ./helm/backend --set secrets.databaseUrl=<neon-url>`
- [ ] T080 [US4] Install frontend Helm chart: `helm install todo-frontend ./helm/frontend`
- [ ] T081 [US4] Verify Helm releases: `helm list`
- [ ] T082 [US4] Verify all pods Running: `kubectl get pods`
- [ ] T083 [US4] Test Helm upgrade: `helm upgrade todo-frontend ./helm/frontend --set replicaCount=3`
- [ ] T084 [US4] Test Helm rollback: `helm rollback todo-frontend`

**Independent Test Criteria**:
- ✅ Backend Helm chart created with all templates
- ✅ Frontend Helm chart created with all templates
- ✅ Both charts pass `helm lint` validation
- ✅ Charts install successfully with default values
- ✅ All pods reach Running state
- ✅ Environment-specific values files work
- ✅ Helm upgrade and rollback work correctly

---

## Phase 7: US5 - One-Command Automation

**User Story**: As a developer, I want a single setup script that automates the entire deployment process so that I can get the application running locally in under 5 minutes.

**Functional Requirements**: FR-008 (One-Command Local Development)

**Priority**: High

**Tasks**: 10

- [ ] T085 [US5] Create main setup script at `scripts/k8s-local-setup.sh`
- [ ] T086 [US5] Add prerequisites check function to setup script (Docker, Minikube, kubectl, Helm)
- [ ] T087 [US5] Add system resource check function to setup script (8GB RAM, 4 CPU cores)
- [ ] T088 [US5] Add port conflict check function to setup script (ports 3000, 8000, 30000)
- [ ] T089 [US5] Add Minikube start logic to setup script
- [ ] T090 [US5] Add Docker environment configuration to setup script: `eval $(minikube docker-env)`
- [ ] T091 [US5] Add image build logic to setup script (frontend and backend)
- [ ] T092 [US5] Add Helm chart installation logic to setup script
- [ ] T093 [US5] Add pod readiness wait logic to setup script: `kubectl wait --for=condition=ready pod -l app=todo-frontend --timeout=300s`
- [ ] T094 [US5] Add /etc/hosts configuration instructions to setup script for todo.local
- [ ] T095 [US5] Add success message with access URLs to setup script
- [ ] T096 [US5] Create teardown script at `scripts/k8s-teardown.sh`
- [ ] T097 [US5] Create rebuild script at `scripts/k8s-rebuild.sh` for incremental updates
- [ ] T098 [US5] Make all scripts executable: `chmod +x scripts/*.sh`
- [ ] T099 [US5] Test complete setup flow from clean state
- [ ] T100 [US5] Measure setup time and verify < 5 minutes

**Independent Test Criteria**:
- ✅ Setup script completes successfully
- ✅ All prerequisites checked
- ✅ Minikube starts automatically
- ✅ Images built in Minikube context
- ✅ Helm charts installed automatically
- ✅ All pods reach Running state
- ✅ Application accessible at http://todo.local or NodePort
- ✅ Setup completes in under 5 minutes
- ✅ Teardown script removes all resources
- ✅ Rebuild script works for incremental updates

---

## Phase 8: US6 - AI Tools Documentation

**User Story**: As a developer, I want comprehensive documentation for AI-assisted operations (Gordon, kubectl-ai, kagent) so that I can leverage AI tools for containerization and cluster management.

**Functional Requirements**: FR-001 (AI-Assisted Docker Operations), FR-004 (AI-Assisted Kubernetes), FR-005 (Intelligent Cluster Analysis)

**Priority**: Medium

**Tasks**: 8

- [ ] T101 [P] [US6] Create AI-assisted operations guide at `docs/ai-assisted-operations.md`
- [ ] T102 [P] [US6] Document Docker AI (Gordon) commands with examples in operations guide
- [ ] T103 [P] [US6] Document kubectl-ai commands with examples in operations guide
- [ ] T104 [P] [US6] Document kagent commands with examples in operations guide
- [ ] T105 [P] [US6] Document standard CLI fallback commands for all AI operations
- [ ] T106 [P] [US6] Create kubectl-ai installation guide at `docs/kubectl-ai-installation.md`
- [ ] T107 [P] [US6] Create kagent installation guide at `docs/kagent-installation.md`
- [ ] T108 [US6] Test all documented AI commands and verify they work or have fallbacks

**Independent Test Criteria**:
- ✅ AI-assisted operations guide complete
- ✅ Gordon commands documented with examples
- ✅ kubectl-ai commands documented with examples
- ✅ kagent commands documented with examples
- ✅ Standard CLI fallbacks provided for all operations
- ✅ Installation guides created for optional tools
- ✅ All commands tested or fallbacks verified

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Complete documentation, create architecture diagrams, and perform final testing

**Tasks**: 12

### Documentation

- [ ] T109 Create Kubernetes deployment guide at `docs/k8s-deployment-guide.md`
- [ ] T110 Create troubleshooting guide at `docs/troubleshooting.md`
- [ ] T111 Document common issues and solutions in troubleshooting guide
- [ ] T112 Create architecture diagram showing component relationships
- [ ] T113 Update main README.md with Phase IV information and setup instructions
- [ ] T114 Document Helm chart values in `helm/frontend/README.md`
- [ ] T115 Document Helm chart values in `helm/backend/README.md`

### Testing & Validation

- [ ] T116 Perform end-to-end testing: create, read, update, delete tasks via frontend
- [ ] T117 Test scaling operations: `kubectl scale deployment todo-backend --replicas=3`
- [ ] T118 Test Helm upgrades with different values files
- [ ] T119 Test cleanup and re-deployment from scratch
- [ ] T120 Verify all success criteria from spec.md are met

**Acceptance Criteria**:
- ✅ All documentation complete
- ✅ Architecture diagrams created
- ✅ Troubleshooting guide covers common issues
- ✅ README updated with Phase IV information
- ✅ Helm chart values documented
- ✅ End-to-end testing passes
- ✅ All success criteria met

---

## Parallel Execution Examples

### Example 1: Containerization (Phase 3)

**Parallel Tasks** (can run simultaneously):
```bash
# Terminal 1: Backend containerization
T010, T011, T012, T013, T014, T015, T016

# Terminal 2: Frontend containerization
T017, T018, T019, T020, T021, T022, T023
```

**Sequential Tasks** (must run after parallel tasks):
```bash
T024, T025, T026  # Testing requires both containers built
```

---

### Example 2: Kubernetes Manifests (Phase 5)

**Parallel Tasks** (can run simultaneously):
```bash
# Terminal 1: Backend manifests
T035, T036, T037, T038, T039, T040, T041

# Terminal 2: Frontend manifests
T042, T043, T044, T045, T046, T047, T048
```

**Sequential Tasks** (must run after parallel tasks):
```bash
T049  # Ingress depends on services
T050-T056  # Testing requires all manifests
```

---

### Example 3: Helm Charts (Phase 6)

**Parallel Tasks** (can run simultaneously):
```bash
# Terminal 1: Backend Helm chart
T057-T066

# Terminal 2: Frontend Helm chart
T067-T077
```

**Sequential Tasks** (must run after parallel tasks):
```bash
T078-T084  # Testing requires both charts
```

---

### Example 4: Documentation (Phase 8 + Phase 9)

**Parallel Tasks** (can run simultaneously):
```bash
# Terminal 1: AI tools documentation
T101-T107

# Terminal 2: General documentation
T109-T115
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Phases to Complete**:
1. Phase 1: Setup ✅
2. Phase 2: Foundational ✅
3. Phase 3: US1 - Containerization ✅
4. Phase 4: US2 - Minikube Setup ✅
5. Phase 5: US3 - Kubernetes Manifests ✅

**MVP Deliverables**:
- Dockerfiles for frontend and backend
- Kubernetes manifests for deployment
- Application running on Minikube
- Basic documentation

**MVP Success Criteria**:
- ✅ Application containerized
- ✅ Deployed to local Minikube
- ✅ Accessible via NodePort
- ✅ Health checks working

---

### Full Feature Scope

**Additional Phases**:
6. Phase 6: US4 - Helm Charts
7. Phase 7: US5 - Automation Scripts
8. Phase 8: US6 - AI Tools Documentation
9. Phase 9: Polish & Documentation

**Full Feature Deliverables**:
- Helm charts for easy deployment
- One-command setup script
- AI-assisted operations guide
- Comprehensive documentation

**Full Feature Success Criteria**:
- ✅ All functional requirements met
- ✅ Setup completes in < 5 minutes
- ✅ AI tools documented
- ✅ All success criteria from spec.md met

---

## Task Summary

| Phase | User Story | Task Count | Parallelizable | Priority |
|-------|------------|------------|----------------|----------|
| Phase 1 | Setup | 5 | 5 | High |
| Phase 2 | Foundational | 4 | 0 | High |
| Phase 3 | US1: Containerization | 17 | 14 | High |
| Phase 4 | US2: Minikube Setup | 8 | 0 | High |
| Phase 5 | US3: Kubernetes Manifests | 22 | 14 | High |
| Phase 6 | US4: Helm Charts | 28 | 20 | High |
| Phase 7 | US5: Automation | 16 | 0 | High |
| Phase 8 | US6: AI Tools Docs | 8 | 7 | Medium |
| Phase 9 | Polish | 12 | 7 | Medium |
| **Total** | | **120** | **67** | |

---

## Validation Checklist

Before marking tasks.md as complete, verify:

- [x] All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- [x] Task IDs are sequential (T001-T120)
- [x] [P] markers only on parallelizable tasks
- [x] [Story] labels only on user story phase tasks (US1-US6)
- [x] All tasks have clear descriptions with file paths
- [x] Dependencies clearly documented
- [x] Parallel execution examples provided
- [x] MVP scope defined
- [x] Independent test criteria for each user story
- [x] Task summary table complete

---

## Next Steps

1. **Review tasks.md** with stakeholders
2. **Run `/sp.analyze`** to validate consistency across spec, plan, and tasks
3. **Create ADRs** for the 5 architectural decisions
4. **Install prerequisites** (Minikube, kubectl, Helm)
5. **Begin implementation** starting with Phase 1 (Setup)

---

**Tasks Status**: Ready for Implementation
**Last Updated**: 2026-02-12
