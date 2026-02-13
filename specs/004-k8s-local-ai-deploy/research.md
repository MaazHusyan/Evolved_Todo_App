# Research Findings: Phase IV - Local Kubernetes Deployment

**Feature**: Local Kubernetes Deployment with AI-Assisted DevOps
**Date**: 2026-02-12
**Status**: Complete

---

## 1. Tool Availability Assessment

### 1.1 Docker and Docker AI (Gordon)

**Status**: ✅ Available

**Findings**:
- Docker version 29.2.0 installed and operational
- Docker AI (Gordon) confirmed available via `docker ai --help`
- Gordon capabilities include:
  - Natural language Docker commands
  - Dockerfile generation and optimization
  - Container troubleshooting
  - Security scanning suggestions

**Decision**: Use Docker AI (Gordon) as primary AI tool for containerization

**Usage Examples**:
```bash
# Generate Dockerfile
docker ai "create optimized multi-stage Dockerfile for Next.js frontend"

# Optimize existing Dockerfile
docker ai "optimize this Dockerfile for production"

# Security analysis
docker ai "analyze security vulnerabilities in my Docker images"
```

**Fallback**: Standard Docker CLI commands documented for all operations

---

### 1.2 Minikube

**Status**: ❌ Not Installed (Required)

**Findings**:
- Minikube not currently installed on system
- Required for local Kubernetes cluster
- Latest stable version recommended

**Decision**: Install Minikube as prerequisite

**Installation**:
```bash
# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

**Configuration**:
```bash
# Start with adequate resources
minikube start --cpus=2 --memory=4096 --driver=docker

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
```

---

### 1.3 kubectl

**Status**: ❌ Not Installed (Required)

**Findings**:
- kubectl not currently installed on system
- Required for Kubernetes cluster management
- Version should match Minikube's Kubernetes version

**Decision**: Install kubectl as prerequisite

**Installation**:
```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client
```

---

### 1.4 Helm

**Status**: ❌ Not Installed (Required)

**Findings**:
- Helm not currently installed on system
- Required for Kubernetes package management
- Helm 3.10+ recommended

**Decision**: Install Helm 3.x as prerequisite

**Installation**:
```bash
# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installation
helm version
```

---

### 1.5 kubectl-ai

**Status**: ❌ Not Installed (Optional)

**Findings**:
- kubectl-ai is an experimental tool for natural language Kubernetes operations
- Not available in standard package managers
- May require manual installation from GitHub

**Decision**: Make kubectl-ai optional enhancement, not required for MVP

**Research Notes**:
- kubectl-ai wraps kubectl with AI-powered natural language processing
- Useful for developers learning Kubernetes
- Fallback to standard kubectl commands is essential

**Installation** (if desired):
```bash
# Research installation method from official repository
# Document as optional post-MVP enhancement
```

**Alternative**: Use standard kubectl with good documentation

---

### 1.6 kagent

**Status**: ❌ Not Installed (Optional)

**Findings**:
- kagent is an AI agent for Kubernetes cluster analysis
- Experimental tool, installation method unclear
- May not be production-ready

**Decision**: Make kagent optional enhancement, not required for MVP

**Research Notes**:
- kagent provides intelligent cluster health analysis
- Useful for troubleshooting and optimization
- Standard kubectl describe/logs provide similar functionality

**Alternative**: Use kubectl describe, kubectl logs, kubectl top for analysis

---

## 2. Best Practices Research

### 2.1 Multi-Stage Docker Builds

**Research Question**: How to optimize Docker images for production?

**Findings**:
- Multi-stage builds separate build dependencies from runtime
- Reduces final image size by 50-80%
- Improves security by excluding build tools from production images

**Best Practices**:
1. Use specific base image tags (not `latest`)
2. Use Alpine or Slim variants for smaller size
3. Separate stages: dependencies → build → production
4. Copy only necessary artifacts to final stage
5. Run as non-root user (UID > 1000)
6. Use .dockerignore to exclude unnecessary files

**Decision**: Implement multi-stage Dockerfiles for both frontend and backend

**Example Pattern**:
```dockerfile
# Stage 1: Dependencies
FROM base AS deps
COPY package.json ./
RUN install dependencies

# Stage 2: Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN build

# Stage 3: Production
FROM base-slim AS runner
COPY --from=builder /app/dist ./dist
USER nonroot
CMD ["start"]
```

---

### 2.2 Kubernetes Health Checks

**Research Question**: What health check patterns should we use?

**Findings**:
- Liveness probe: Determines if container should be restarted
- Readiness probe: Determines if container can receive traffic
- Startup probe: Handles slow-starting containers

**Best Practices**:
1. Liveness: Simple check (app is running)
2. Readiness: Comprehensive check (dependencies ready)
3. Use HTTP GET for web applications
4. Set appropriate initialDelaySeconds (allow startup time)
5. Set reasonable periodSeconds (balance responsiveness vs load)

**Decision**: Implement `/health` (liveness) and `/ready` (readiness) endpoints

**Implementation**:
```python
# Backend (FastAPI)
@app.get("/health")
async def health_check():
    """Liveness probe - is the app running?"""
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_check():
    """Readiness probe - can we serve traffic?"""
    try:
        # Check database connectivity
        await db.execute("SELECT 1")
        return {"status": "ready"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Not ready")
```

---

### 2.3 Kubernetes Service Discovery

**Research Question**: How should frontend discover backend in Kubernetes?

**Findings**:
- Kubernetes provides built-in DNS for service discovery
- Service name resolves to ClusterIP within cluster
- Format: `<service-name>.<namespace>.svc.cluster.local`
- Short form: `<service-name>` (within same namespace)

**Best Practices**:
1. Use ClusterIP for internal services (backend)
2. Use NodePort or LoadBalancer for external access (frontend)
3. Pass service URLs via environment variables
4. Use ConfigMaps for non-sensitive configuration

**Decision**: Frontend uses `NEXT_PUBLIC_API_URL=http://todo-backend-service:8000`

**Implementation**:
```yaml
# Frontend ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  API_URL: "http://todo-backend-service:8000"

# Frontend Deployment
env:
- name: NEXT_PUBLIC_API_URL
  valueFrom:
    configMapKeyRef:
      name: frontend-config
      key: API_URL
```

---

### 2.4 Secrets Management

**Research Question**: How to securely manage database credentials in Kubernetes?

**Findings**:
- Kubernetes Secrets provide base64 encoding (not encryption by default)
- Secrets can be mounted as environment variables or files
- Best practice: Use external secret managers for production (Vault, AWS Secrets Manager)
- For local development: Kubernetes Secrets are sufficient

**Best Practices**:
1. Never commit secrets to Git
2. Use Kubernetes Secrets for sensitive data
3. Use ConfigMaps for non-sensitive data
4. Mount secrets as environment variables for simplicity
5. Use stringData for easier secret creation

**Decision**: Store DATABASE_URL in Kubernetes Secret

**Implementation**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@neon-host.neon.tech/db?sslmode=require"
```

**Usage**:
```yaml
env:
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: backend-secrets
      key: DATABASE_URL
```

---

### 2.5 Helm Chart Structure

**Research Question**: What's the best structure for Helm charts?

**Findings**:
- Standard Helm chart structure: Chart.yaml, values.yaml, templates/
- Templates use Go templating syntax
- Values files enable environment-specific configuration
- Helm 3 removed Tiller, simplified architecture

**Best Practices**:
1. One chart per service (microservices pattern)
2. Use values.yaml for defaults
3. Create environment-specific values files (values-dev.yaml, values-prod.yaml)
4. Template all configurable values
5. Use helpers.tpl for reusable template snippets
6. Run `helm lint` before deployment

**Decision**: Create separate Helm charts for frontend and backend

**Chart Structure**:
```
helm/
├── frontend/
│   ├── Chart.yaml          # Chart metadata
│   ├── values.yaml         # Default values
│   ├── values-dev.yaml     # Development overrides
│   ├── values-prod.yaml    # Production overrides
│   └── templates/
│       ├── _helpers.tpl    # Template helpers
│       ├── deployment.yaml # Deployment template
│       ├── service.yaml    # Service template
│       ├── configmap.yaml  # ConfigMap template
│       └── ingress.yaml    # Ingress template
└── backend/
    └── (same structure)
```

---

### 2.6 Minikube Configuration

**Research Question**: What's the optimal Minikube configuration for local development?

**Findings**:
- Minikube supports multiple drivers (Docker, VirtualBox, KVM2)
- Docker driver is simplest and most compatible
- Adequate resources prevent pod evictions and OOM errors
- Addons extend Minikube functionality

**Best Practices**:
1. Use Docker driver for simplicity
2. Allocate at least 4GB RAM, 2 CPUs
3. Enable ingress addon for local domain access
4. Enable metrics-server for resource monitoring
5. Use `eval $(minikube docker-env)` to build images in Minikube context

**Decision**: Configure Minikube with Docker driver, 4GB RAM, 2 CPUs

**Configuration**:
```bash
# Start Minikube
minikube start \
  --driver=docker \
  --cpus=2 \
  --memory=4096 \
  --kubernetes-version=v1.28.0

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Configure Docker environment
eval $(minikube docker-env)

# Verify configuration
minikube status
kubectl cluster-info
```

---

### 2.7 Image Pull Policy for Local Development

**Research Question**: How to use locally built images in Minikube?

**Findings**:
- Minikube has its own Docker daemon
- Images built on host are not available in Minikube by default
- Solution: Build images in Minikube's Docker context
- Set `imagePullPolicy: Never` to prevent pulling from registry

**Best Practices**:
1. Use `eval $(minikube docker-env)` before building images
2. Set `imagePullPolicy: Never` in Kubernetes manifests
3. Tag images consistently (e.g., `todo-frontend:latest`)
4. Rebuild images in Minikube context after changes

**Decision**: Build images in Minikube Docker context, use `imagePullPolicy: Never`

**Implementation**:
```bash
# Configure Docker to use Minikube's daemon
eval $(minikube docker-env)

# Build images
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend

# Verify images are in Minikube
docker images | grep todo
```

```yaml
# Deployment manifest
spec:
  containers:
  - name: frontend
    image: todo-frontend:latest
    imagePullPolicy: Never  # Don't try to pull from registry
```

---

### 2.8 Resource Limits and Requests

**Research Question**: What resource limits should we set for containers?

**Findings**:
- Requests: Guaranteed resources for scheduling
- Limits: Maximum resources container can use
- Setting both prevents resource starvation and overcommitment
- Kubernetes uses these for scheduling and eviction decisions

**Best Practices**:
1. Set requests based on typical usage
2. Set limits 1.5-2x higher than requests
3. Monitor actual usage with `kubectl top`
4. Adjust based on observed behavior

**Decision**: Conservative limits for local development

**Resource Allocation**:
```yaml
# Frontend (Next.js)
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# Backend (FastAPI)
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

---

## 3. Technology Decisions Summary

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Container Runtime | Docker Desktop 29.2.0 | Already installed, includes Gordon |
| AI Containerization | Docker AI (Gordon) | Available, proven, good documentation |
| Local Kubernetes | Minikube | Standard for local development, well-supported |
| Kubernetes CLI | kubectl | Required, standard tool |
| Package Manager | Helm 3.x | Industry standard, simplifies deployments |
| AI Kubernetes Ops | kubectl-ai (optional) | Experimental, not required for MVP |
| AI Cluster Analysis | kagent (optional) | Experimental, not required for MVP |
| Base Images | Alpine/Slim variants | Minimal size, security benefits |
| Service Discovery | Kubernetes DNS | Built-in, reliable, standard |
| Secrets Management | Kubernetes Secrets | Sufficient for local development |
| Ingress Controller | Nginx (Minikube addon) | Default, well-supported |

---

## 4. Prerequisites Checklist

### Required Tools

- [x] Docker Desktop 29.2.0+ (installed)
- [x] Docker AI (Gordon) (available)
- [ ] Minikube (needs installation)
- [ ] kubectl (needs installation)
- [ ] Helm 3.10+ (needs installation)
- [x] Git (assumed installed)

### Optional Tools

- [ ] kubectl-ai (optional enhancement)
- [ ] kagent (optional enhancement)

### System Requirements

- [x] Operating System: Linux (confirmed)
- [ ] RAM: 8GB minimum (verify)
- [ ] CPU: 4 cores minimum (verify)
- [ ] Disk Space: 20GB free (verify)

### Installation Priority

1. **High Priority** (blocking):
   - Minikube
   - kubectl
   - Helm

2. **Low Priority** (optional):
   - kubectl-ai
   - kagent

---

## 5. Alternatives Considered

### Alternative 1: Kind (Kubernetes in Docker)

**Pros**:
- Faster startup than Minikube
- Better for CI/CD pipelines
- Multiple cluster support

**Cons**:
- Less user-friendly for local development
- Fewer built-in addons
- More complex networking setup

**Decision**: Rejected - Minikube is more beginner-friendly and has better documentation

---

### Alternative 2: k3s (Lightweight Kubernetes)

**Pros**:
- Very lightweight (< 100MB)
- Fast startup
- Production-ready

**Cons**:
- Different from standard Kubernetes
- Less community support for local development
- Fewer learning resources

**Decision**: Rejected - Minikube provides better learning experience and matches production Kubernetes more closely

---

### Alternative 3: Docker Compose (No Kubernetes)

**Pros**:
- Simpler than Kubernetes
- Faster setup
- Easier to understand

**Cons**:
- Doesn't meet Phase IV requirements
- No Kubernetes learning opportunity
- Not production-representative

**Decision**: Rejected - Phase IV specifically requires Kubernetes deployment

---

## 6. Open Questions and Risks

### Open Questions

1. **kubectl-ai Installation**: What's the official installation method?
   - **Resolution**: Document as optional, provide installation guide if available

2. **kagent Availability**: Is kagent publicly available?
   - **Resolution**: Document as optional, focus on standard kubectl tools

3. **System Resources**: Does user's machine meet minimum requirements?
   - **Resolution**: Add resource check to setup script

### Risks

1. **AI Tool Unavailability**: kubectl-ai and kagent may not work
   - **Mitigation**: Comprehensive fallback documentation

2. **Resource Constraints**: User's machine may be underpowered
   - **Mitigation**: Minimal resource configuration, clear requirements

3. **Network Issues**: Port conflicts, DNS resolution
   - **Mitigation**: Port conflict checking, multiple access methods

---

## 7. Next Steps

1. Install required tools (Minikube, kubectl, Helm)
2. Verify system resources meet requirements
3. Proceed to Phase 1: Containerization
4. Implement health check endpoints
5. Create Dockerfiles with Gordon assistance
6. Build and test images locally

---

**Research Status**: Complete
**Blockers**: None (prerequisites can be installed)
**Ready for Implementation**: Yes
