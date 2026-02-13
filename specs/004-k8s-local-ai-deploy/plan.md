# Implementation Plan: Phase IV - Local Kubernetes Deployment with AI-Assisted DevOps

**Feature**: Local Kubernetes Deployment (Minikube, Helm Charts, kubectl-ai, Kagent, Docker Desktop, Gordon)
**Branch**: `004-k8s-local-ai-deploy`
**Status**: Planning
**Created**: 2026-02-12

---

## 1. Executive Summary

This plan outlines the technical architecture for deploying the Todo Chatbot application on a local Kubernetes cluster using Minikube. The implementation leverages AI-assisted DevOps tools (Docker AI/Gordon, kubectl-ai, kagent) to simplify containerization and cluster management, with comprehensive fallback documentation for standard Docker/Kubernetes commands.

**Key Objectives**:
- Containerize frontend (Next.js) and backend (FastAPI) with optimized multi-stage Dockerfiles
- Create production-ready Helm charts for both services
- Deploy on local Minikube cluster with proper service discovery
- Enable one-command setup for new developers (< 5 minutes)
- Provide AI-assisted operations with standard CLI fallbacks

---

## 2. Scope and Dependencies

### 2.1 In Scope

**Containerization**:
- Multi-stage Dockerfiles for frontend and backend
- Docker AI (Gordon) assisted Dockerfile generation
- Production-optimized images (< 500MB each)
- Development images with hot-reload support
- Health check endpoints implementation

**Kubernetes Deployment**:
- Minikube cluster setup and configuration
- Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets, Ingress)
- kubectl-ai and kagent assisted operations
- Service discovery via Kubernetes DNS
- Resource limits and requests configuration

**Helm Charts**:
- Reusable Helm charts for frontend and backend
- Templated Kubernetes resources
- Environment-specific values files (dev, staging, production)
- ConfigMap and Secret management

**Automation**:
- One-command setup script (`k8s-local-setup.sh`)
- Prerequisites checking (Docker, Minikube, Helm, kubectl)
- Automated image building and deployment
- Cleanup and teardown scripts

**Documentation**:
- AI-assisted operations guide (Gordon, kubectl-ai, kagent)
- Standard CLI fallback commands
- Troubleshooting guide
- Architecture diagrams

### 2.2 Out of Scope

- Cloud Kubernetes deployment (AWS EKS, GCP GKE, Azure AKS)
- CI/CD pipeline automation
- Advanced monitoring (Prometheus/Grafana)
- Service mesh (Istio, Linkerd)
- GitOps (ArgoCD, Flux)
- Database deployment in Kubernetes (Neon remains external)
- Certificate management (use self-signed for local)
- Load testing and performance benchmarking

### 2.3 External Dependencies

**Required Tools**:
- Docker Desktop 4.53+ (with Docker AI/Gordon support)
- Minikube (latest stable version)
- kubectl (matching Minikube Kubernetes version)
- Helm 3.10+
- Git

**Optional AI Tools**:
- Docker AI (Gordon) - for AI-assisted containerization
- kubectl-ai - for natural language Kubernetes operations
- kagent - for intelligent cluster analysis

**External Services**:
- Neon PostgreSQL (from Phase II/III) - remains external
- Better Auth configuration (from Phase II/III)

**Application Dependencies**:
- Phase III Todo Chatbot (frontend and backend)
- Existing database schema and migrations

---

## 3. Key Architectural Decisions

### 3.1 Containerization Strategy

**Decision**: Use multi-stage Dockerfiles with production optimization

**Rationale**:
- Single Dockerfile per service reduces maintenance overhead
- Multi-stage builds separate build dependencies from runtime
- Achieves < 500MB image size requirement
- Supports both development and production builds via build args

**Alternatives Considered**:
- Separate Dockerfiles for dev/prod: More files to maintain, harder to keep in sync
- Single-stage builds: Larger images, includes unnecessary build tools in production

**Implementation**:
```dockerfile
# Frontend: Node.js base → build stage → production stage
# Backend: Python base → dependencies stage → production stage
# Build arg: BUILD_ENV=development|production
```

---

### 3.2 Service Discovery and Communication

**Decision**: Use Kubernetes DNS with environment variables for service discovery

**Rationale**:
- Standard Kubernetes pattern, no additional tools required
- Frontend discovers backend via `NEXT_PUBLIC_API_URL` environment variable
- Backend service accessible at `http://todo-backend-service:8000` within cluster
- Simple, reliable, well-documented approach

**Alternatives Considered**:
- Ingress-based routing: More complex, requires path rewriting
- Service mesh: Out of scope, overkill for local development

**Implementation**:
```yaml
# Frontend ConfigMap
NEXT_PUBLIC_API_URL: "http://todo-backend-service:8000"

# Backend Service
name: todo-backend-service
port: 8000
type: ClusterIP
```

---

### 3.3 Database Connection Security

**Decision**: Store complete DATABASE_URL in Kubernetes Secret

**Rationale**:
- Single environment variable simplifies backend configuration
- Kubernetes Secrets provide encryption at rest
- Connection string includes SSL mode for Neon PostgreSQL
- Standard practice for database credentials

**Alternatives Considered**:
- Separate Secret fields: More granular but requires backend code changes
- ConfigMap for non-sensitive parts: Unnecessary complexity for local dev

**Implementation**:
```yaml
# Kubernetes Secret
DATABASE_URL: postgresql://user:pass@neon-host.neon.tech/db?sslmode=require
```

---

### 3.4 Health Check Endpoints

**Decision**: Implement `/health` (liveness) and `/ready` (readiness) endpoints

**Rationale**:
- Standard Kubernetes pattern for pod lifecycle management
- `/health`: Checks if application is running (simple ping)
- `/ready`: Checks database connectivity and dependencies
- Enables proper startup ordering and traffic routing

**Alternatives Considered**:
- Single `/health` endpoint: Less granular, can't distinguish startup issues
- Three endpoints (add `/startup`): Unnecessary for this application's startup time

**Implementation**:
```python
# Backend (FastAPI)
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_check():
    # Check database connectivity
    # Return 200 if ready, 503 if not
```

---

### 3.5 Helm Chart Structure

**Decision**: Separate Helm charts for frontend and backend with shared values pattern

**Rationale**:
- Independent versioning and deployment of services
- Reusable across environments (dev, staging, production)
- Standard Helm best practices
- Easy to extend for additional services

**Alternatives Considered**:
- Single umbrella chart: Tighter coupling, harder to deploy services independently
- No Helm (raw manifests): Less flexible, harder to manage configurations

**Implementation**:
```
helm/
├── frontend/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── values-prod.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── configmap.yaml
│       └── ingress.yaml
└── backend/
    ├── Chart.yaml
    ├── values.yaml
    ├── values-dev.yaml
    ├── values-prod.yaml
    └── templates/
        ├── deployment.yaml
        ├── service.yaml
        ├── configmap.yaml
        └── secret.yaml
```

---

### 3.6 AI Tools Integration Strategy

**Decision**: Use Docker AI (Gordon) as primary AI tool with comprehensive fallback documentation

**Rationale**:
- Gordon is available in Docker Desktop 4.53+ (confirmed installed)
- kubectl-ai and kagent are experimental and not currently installed
- Fallback to standard kubectl/helm commands ensures reliability
- Can add kubectl-ai/kagent as optional enhancements post-MVP

**Alternatives Considered**:
- Require all AI tools: Blocks progress if tools unavailable
- No AI tools: Misses opportunity to leverage Gordon for containerization

**Implementation**:
- Use Gordon for Dockerfile generation and optimization
- Document both AI commands and standard CLI equivalents
- Provide installation guides for kubectl-ai and kagent as optional enhancements

---

## 4. Technical Architecture

### 4.1 Technology Stack

**Containerization**:
- Docker Desktop 29.2.0 (with Docker AI/Gordon)
- Multi-stage Dockerfiles
- Alpine Linux base images for minimal size

**Orchestration**:
- Minikube (latest stable)
- Kubernetes 1.28+
- kubectl CLI

**Package Management**:
- Helm 3.10+
- Helm charts with templating

**AI DevOps Tools**:
- Docker AI (Gordon) - primary
- kubectl-ai - optional
- kagent - optional

**Application Stack** (from Phase III):
- Frontend: Next.js 16.0.0, React 19
- Backend: FastAPI, Python 3.13
- Database: Neon PostgreSQL (external)
- Auth: Better Auth

### 4.2 Container Architecture

**Frontend Container**:
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
```

**Backend Container**:
```dockerfile
# Stage 1: Base
FROM python:3.13-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Stage 2: Dependencies
FROM base AS deps
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

# Stage 3: Production
FROM python:3.13-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 && rm -rf /var/lib/apt/lists/*
RUN addgroup --gid 1001 --system appuser && \
    adduser --uid 1001 --system --gid 1001 appuser
COPY --from=deps /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY src ./src
USER appuser
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Image Size Targets**:
- Frontend: < 250MB (Next.js standalone build)
- Backend: < 300MB (Python slim base)

### 4.3 Kubernetes Resources

**Frontend Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
    spec:
      containers:
      - name: frontend
        image: todo-frontend:latest
        imagePullPolicy: Never  # Local Minikube
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: API_URL
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

**Backend Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
    spec:
      containers:
      - name: backend
        image: todo-backend:latest
        imagePullPolicy: Never  # Local Minikube
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: backend-secrets
              key: DATABASE_URL
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 5
```

**Services**:
```yaml
# Frontend Service (NodePort for external access)
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend-service
spec:
  type: NodePort
  selector:
    app: todo-frontend
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30000

---
# Backend Service (ClusterIP for internal access)
apiVersion: v1
kind: Service
metadata:
  name: todo-backend-service
spec:
  type: ClusterIP
  selector:
    app: todo-backend
  ports:
  - port: 8000
    targetPort: 8000
```

**Ingress** (for todo.local domain):
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: todo.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: todo-frontend-service
            port:
              number: 3000
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: todo-backend-service
            port:
              number: 8000
```

### 4.4 Helm Chart Structure

**Frontend Chart** (`helm/frontend/values.yaml`):
```yaml
replicaCount: 2

image:
  repository: todo-frontend
  tag: latest
  pullPolicy: Never

service:
  type: NodePort
  port: 3000
  nodePort: 30000

resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"

config:
  apiUrl: "http://todo-backend-service:8000"

ingress:
  enabled: true
  host: todo.local
  path: /
```

**Backend Chart** (`helm/backend/values.yaml`):
```yaml
replicaCount: 2

image:
  repository: todo-backend
  tag: latest
  pullPolicy: Never

service:
  type: ClusterIP
  port: 8000

resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"

secrets:
  databaseUrl: ""  # Set via --set or values file

healthCheck:
  liveness:
    path: /health
    initialDelaySeconds: 30
  readiness:
    path: /ready
    initialDelaySeconds: 15
```

---

## 5. Implementation Phases

### Phase 0: Prerequisites and Research

**Objectives**:
- Verify tool availability and versions
- Research best practices for Minikube setup
- Document AI tool installation procedures

**Tasks**:
1. Check Docker Desktop version and Gordon availability
2. Install Minikube, kubectl, Helm if not present
3. Research kubectl-ai and kagent installation (optional)
4. Document system requirements and prerequisites
5. Create research.md with findings

**Deliverables**:
- `research.md` with tool availability and best practices
- Prerequisites checklist
- Installation guides for optional AI tools

### Phase 1: Containerization

**Objectives**:
- Create optimized Dockerfiles for frontend and backend
- Implement health check endpoints
- Build and test Docker images locally

**Tasks**:
1. Implement `/health` and `/ready` endpoints in backend
2. Create multi-stage Dockerfile for frontend
3. Create multi-stage Dockerfile for backend
4. Use Gordon to optimize Dockerfiles (if available)
5. Build images and verify size < 500MB each
6. Test containers locally with docker run
7. Document Docker AI commands and standard CLI equivalents

**Deliverables**:
- `frontend/Dockerfile`
- `backend/Dockerfile`
- Health check endpoints in backend code
- Docker build and run documentation

### Phase 2: Kubernetes Manifests

**Objectives**:
- Create Kubernetes resource manifests
- Configure service discovery and secrets
- Test deployments on Minikube

**Tasks**:
1. Create Deployment manifests (frontend, backend)
2. Create Service manifests (ClusterIP, NodePort)
3. Create ConfigMap for frontend configuration
4. Create Secret for backend database connection
5. Create Ingress for todo.local domain
6. Test kubectl apply and verify pod status
7. Document kubectl-ai commands (if available)

**Deliverables**:
- `k8s/frontend-deployment.yaml`
- `k8s/backend-deployment.yaml`
- `k8s/services.yaml`
- `k8s/configmap.yaml`
- `k8s/secrets.yaml`
- `k8s/ingress.yaml`

### Phase 3: Helm Charts

**Objectives**:
- Create reusable Helm charts
- Template all Kubernetes resources
- Support multiple environments

**Tasks**:
1. Initialize Helm chart structure for frontend
2. Initialize Helm chart structure for backend
3. Template Deployments, Services, ConfigMaps, Secrets
4. Create values.yaml with sensible defaults
5. Create values-dev.yaml and values-prod.yaml
6. Test helm install and helm upgrade
7. Run helm lint validation

**Deliverables**:
- `helm/frontend/` (complete chart)
- `helm/backend/` (complete chart)
- Environment-specific values files
- Helm chart documentation

### Phase 4: Automation and Setup

**Objectives**:
- Create one-command setup script
- Automate Minikube configuration
- Enable easy teardown and cleanup

**Tasks**:
1. Create `scripts/k8s-local-setup.sh`
2. Implement prerequisites checking
3. Automate Minikube start with required addons
4. Configure Docker environment for Minikube
5. Automate image building in Minikube context
6. Automate Helm chart installation
7. Create cleanup script `scripts/k8s-teardown.sh`
8. Test complete setup flow (< 5 minutes)

**Deliverables**:
- `scripts/k8s-local-setup.sh`
- `scripts/k8s-teardown.sh`
- `scripts/k8s-rebuild.sh` (incremental updates)
- Setup documentation

### Phase 5: Documentation and Testing

**Objectives**:
- Comprehensive documentation for all operations
- AI-assisted and standard CLI commands
- Troubleshooting guide

**Tasks**:
1. Document AI-assisted operations (Gordon, kubectl-ai, kagent)
2. Document standard CLI fallback commands
3. Create architecture diagrams
4. Write troubleshooting guide
5. Test complete workflow with new developer persona
6. Verify < 5 minute setup time
7. Document common issues and solutions

**Deliverables**:
- `docs/k8s-deployment-guide.md`
- `docs/ai-assisted-operations.md`
- `docs/troubleshooting.md`
- Architecture diagrams
- README updates

---

## 6. Non-Functional Requirements

### 6.1 Performance

**Targets**:
- Setup time: < 5 minutes from zero to running application
- Image build time: < 3 minutes per service
- Helm deployment time: < 2 minutes
- Pod startup time: < 30 seconds
- Application response time: < 500ms (p95)

**Resource Allocation**:
- Frontend: 256Mi-512Mi RAM, 0.25-0.5 CPU
- Backend: 512Mi-1Gi RAM, 0.5-1.0 CPU
- Minikube: 4GB RAM, 2 CPUs minimum

### 6.2 Reliability

**Availability**:
- 2 replicas per service for high availability
- Health checks prevent traffic to unhealthy pods
- Readiness probes ensure proper startup ordering

**Error Handling**:
- Graceful degradation if backend unavailable
- Clear error messages in logs
- Automatic pod restarts on failures

### 6.3 Security

**Container Security**:
- Non-root users (UID 1001) in all containers
- Minimal base images (Alpine, Slim)
- No hardcoded secrets in images

**Kubernetes Security**:
- Secrets for sensitive data (DATABASE_URL)
- ConfigMaps for non-sensitive configuration
- Resource limits prevent resource exhaustion

**Network Security**:
- ClusterIP for internal services (backend)
- NodePort/Ingress for external access (frontend)
- SSL/TLS for Neon PostgreSQL connection

### 6.4 Observability

**Logging**:
- Structured logs from all containers
- kubectl logs access for debugging
- Log aggregation via kubectl logs -f

**Monitoring**:
- Minikube metrics-server addon
- Resource usage via kubectl top
- Health check endpoints for status

**Debugging**:
- kubectl describe for resource inspection
- kubectl exec for container access
- kagent for intelligent analysis (if available)

---

## 7. Risk Analysis and Mitigation

### Risk 1: AI Tool Unavailability (Medium)

**Description**: kubectl-ai and kagent may not be available or may not work as expected

**Impact**: Reduced developer experience, more manual operations required

**Mitigation**:
- Focus on Docker AI (Gordon) as primary AI tool (confirmed available)
- Provide comprehensive fallback documentation for standard kubectl/helm
- Make kubectl-ai and kagent optional enhancements
- Test all workflows with standard CLI tools

**Contingency**: Proceed with standard Kubernetes tools if AI tools unavailable

### Risk 2: Minikube Resource Constraints (Medium)

**Description**: User's machine may not have sufficient resources (< 8GB RAM, < 4 CPU cores)

**Impact**: Slow performance, pod evictions, out-of-memory errors

**Mitigation**:
- Check system resources before starting Minikube
- Provide minimal resource configuration in Helm values
- Document resource requirements clearly
- Suggest cloud-based alternatives for constrained systems

**Contingency**: Reduce replica counts to 1, lower resource limits

### Risk 3: Port Conflicts (Low)

**Description**: Default ports (3000, 8000, 30000) may be in use

**Impact**: Services cannot bind to ports, deployment fails

**Mitigation**:
- Check for port conflicts in setup script
- Use NodePort with dynamic port assignment
- Provide configuration options in Helm values
- Document how to change ports

**Contingency**: Use alternative ports via Helm values override

### Risk 4: Image Build Failures (Low)

**Description**: Docker builds may fail due to network issues or missing dependencies

**Impact**: Cannot deploy application

**Mitigation**:
- Use Minikube's Docker daemon to avoid image pull issues
- Cache dependencies in Docker layers
- Provide clear error messages
- Document common build issues

**Contingency**: Provide pre-built images as fallback

### Risk 5: Database Connection Issues (Low)

**Description**: Backend pods may fail to connect to external Neon PostgreSQL

**Impact**: Backend pods in CrashLoopBackOff, application non-functional

**Mitigation**:
- Verify DATABASE_URL before deployment
- Implement connection retry logic in backend
- Use readiness probe to prevent traffic to non-ready pods
- Document connection string format

**Contingency**: Test database connectivity with kubectl exec before full deployment

---

## 8. Operational Readiness

### 8.1 Deployment Strategy

**Initial Deployment**:
1. Run `scripts/k8s-local-setup.sh`
2. Script checks prerequisites
3. Starts Minikube with required addons
4. Builds images in Minikube Docker context
5. Installs Helm charts
6. Verifies all pods are running
7. Outputs access URLs

**Updates**:
1. Run `scripts/k8s-rebuild.sh <service>`
2. Rebuilds specified service image
3. Runs `helm upgrade` with new image
4. Verifies rollout status

**Rollback**:
```bash
helm rollback todo-frontend
helm rollback todo-backend
```

### 8.2 Monitoring and Alerting

**Health Monitoring**:
- Kubernetes liveness probes (automatic restart)
- Kubernetes readiness probes (traffic routing)
- kubectl get pods for status overview

**Resource Monitoring**:
```bash
kubectl top nodes
kubectl top pods
minikube dashboard  # Web UI
```

**Log Access**:
```bash
kubectl logs -f deployment/todo-frontend
kubectl logs -f deployment/todo-backend
kubectl logs -f deployment/todo-backend --previous  # Previous crash
```

### 8.3 Troubleshooting Runbook

**Pod Not Starting**:
1. Check pod status: `kubectl describe pod <pod-name>`
2. Check logs: `kubectl logs <pod-name>`
3. Verify image exists: `docker images | grep todo`
4. Check resource constraints: `kubectl top nodes`
5. Use kagent if available: `kagent "why are pods failing?"`

**Service Not Accessible**:
1. Check service: `kubectl get svc`
2. Check endpoints: `kubectl get endpoints`
3. Verify ingress: `kubectl get ingress`
4. Test internal connectivity: `kubectl exec -it <pod> -- curl http://todo-backend-service:8000/health`
5. Check /etc/hosts for todo.local entry

**Database Connection Failures**:
1. Verify secret: `kubectl get secret backend-secrets -o yaml`
2. Check DATABASE_URL format
3. Test connection from pod: `kubectl exec -it <backend-pod> -- python -c "import asyncpg; ..."`
4. Verify Neon PostgreSQL is accessible
5. Check SSL mode in connection string

---

## 9. Definition of Done

### 9.1 Functional Completeness

- [ ] Frontend and backend containerized with Dockerfiles
- [ ] Images built successfully and < 500MB each
- [ ] Health check endpoints implemented and tested
- [ ] Kubernetes manifests created for all resources
- [ ] Helm charts created with templating
- [ ] Service discovery working (frontend → backend)
- [ ] Database connection working (backend → Neon)
- [ ] Ingress configured for todo.local
- [ ] One-command setup script working
- [ ] Setup completes in < 5 minutes

### 9.2 Quality Gates

- [ ] All pods reach Running state
- [ ] Health checks passing (liveness and readiness)
- [ ] Application accessible at http://todo.local
- [ ] End-to-end task operations working (CRUD)
- [ ] Helm charts pass `helm lint` validation
- [ ] No hardcoded secrets in code or images
- [ ] Resource limits configured for all containers
- [ ] Documentation complete and tested

### 9.3 AI Tools Integration

- [ ] Docker AI (Gordon) commands documented
- [ ] kubectl-ai commands documented (with fallback)
- [ ] kagent commands documented (with fallback)
- [ ] Standard CLI equivalents provided for all operations
- [ ] Installation guides for optional AI tools

### 9.4 Documentation

- [ ] Architecture diagrams created
- [ ] Setup guide complete and tested
- [ ] AI-assisted operations guide complete
- [ ] Troubleshooting guide with common issues
- [ ] README updated with Phase IV information
- [ ] All Helm values documented

---

## 10. Architectural Decision Records (ADRs)

The following architectural decisions should be documented in ADRs:

### ADR-001: Multi-Stage Dockerfiles for Optimization
- **Decision**: Use multi-stage builds for both frontend and backend
- **Rationale**: Achieves < 500MB image size, separates build from runtime
- **Alternatives**: Single-stage builds, separate dev/prod Dockerfiles

### ADR-002: Kubernetes DNS for Service Discovery
- **Decision**: Use Kubernetes DNS with environment variables
- **Rationale**: Standard pattern, simple, reliable
- **Alternatives**: Ingress-based routing, service mesh

### ADR-003: Helm Charts for Deployment Management
- **Decision**: Separate Helm charts for frontend and backend
- **Rationale**: Independent versioning, reusable across environments
- **Alternatives**: Single umbrella chart, raw Kubernetes manifests

### ADR-004: External Database (Neon PostgreSQL)
- **Decision**: Keep Neon PostgreSQL external, not in Kubernetes
- **Rationale**: Simplifies local setup, maintains Phase II/III architecture
- **Alternatives**: Deploy PostgreSQL in Kubernetes with StatefulSet

### ADR-005: AI Tools as Optional Enhancements
- **Decision**: Make kubectl-ai and kagent optional, focus on Gordon
- **Rationale**: Gordon confirmed available, other tools experimental
- **Alternatives**: Require all AI tools, use no AI tools

---

## 11. Next Steps

After plan approval:

1. **Run `/sp.tasks`** to generate actionable task list
2. **Run `/sp.analyze`** to validate consistency across spec, plan, tasks
3. **Create ADRs** for the 5 architectural decisions identified
4. **Begin implementation** starting with Phase 0 (Prerequisites and Research)

---

**Plan Status**: Ready for Review
**Estimated Implementation Time**: 3-5 days (with AI assistance)
**Risk Level**: Medium (AI tool availability, resource constraints)
