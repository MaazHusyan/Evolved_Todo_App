# Feature Specification: Phase IV - Local Kubernetes Deployment with AI-Assisted DevOps

**Feature Branch**: `004-k8s-local-ai-deploy`
**Status**: Draft
**Created**: 2026-02-11
**Objective**: Deploy the Todo Chatbot application on a local Kubernetes cluster using Minikube, with AI-assisted containerization via Docker AI (Gordon), Helm charts for packaging, and intelligent Kubernetes operations via kubectl-ai and kagent.

---

## 1. Overview

This phase transforms the existing Todo Chatbot application (from Phase III) into a containerized, Kubernetes-native application running on a local Minikube cluster. The deployment leverages AI-assisted DevOps tools to simplify containerization, deployment, and cluster management, making Kubernetes accessible through natural language commands.

### 1.1 Business Value

- **Developer Onboarding**: New developers can deploy the complete application locally in under 5 minutes
- **Production Parity**: Local environment mirrors production Kubernetes architecture
- **AI-Assisted Operations**: Reduces Kubernetes learning curve through natural language interfaces
- **Configuration Management**: Helm charts enable consistent deployments across environments
- **Cloud Migration Ready**: Architecture supports seamless migration to cloud Kubernetes services

### 1.2 Key Capabilities

1. **AI-Assisted Containerization**: Use Docker AI (Gordon) to generate optimized Dockerfiles with natural language
2. **Natural Language Kubernetes**: Deploy and manage resources using kubectl-ai conversational commands
3. **Intelligent Troubleshooting**: Diagnose cluster issues with kagent analysis
4. **One-Command Setup**: Complete local environment setup with a single script execution
5. **Helm-Based Packaging**: Reusable, configurable deployment charts for all services

---

## 2. User Scenarios & Testing

### Scenario 1: AI-Assisted Containerization with Gordon

**Given** a developer wants to containerize the Todo Chatbot frontend and backend
**When** they use Docker AI (Gordon) with natural language commands
**Then** Gordon generates optimized Dockerfiles, builds images, and suggests improvements

**Example Commands**:
```bash
docker ai "create optimized multi-stage Dockerfile for Next.js frontend with production build"
docker ai "generate Dockerfile for FastAPI backend with Python 3.11 and minimal image size"
docker ai "analyze security vulnerabilities in my Docker images"
```

**Acceptance Criteria**:
- Gordon generates valid, working Dockerfiles for both services
- Generated images are under 500MB each
- Multi-stage builds are used for optimization
- Security best practices are applied (non-root user, minimal base images)
- Fallback to manual Dockerfile creation works if Gordon is unavailable

---

### Scenario 2: Kubernetes Deployment via Natural Language

**Given** Minikube is running and Docker images are built
**When** they use kubectl-ai with conversational commands
**Then** kubectl-ai generates Kubernetes manifests and applies them successfully

**Example Commands**:
```bash
kubectl-ai "deploy todo frontend with 2 replicas and load balancer service"
kubectl-ai "create deployment for backend with environment variables from configmap"
kubectl-ai "expose frontend service on port 3000 with NodePort"
kubectl-ai "scale backend deployment to 3 replicas"
```

**Acceptance Criteria**:
- kubectl-ai generates valid Kubernetes YAML manifests
- Deployments, services, and configmaps are created correctly
- Resources are properly labeled and annotated
- Commands provide clear feedback on success/failure
- Manual kubectl commands work as fallback

---

### Scenario 3: Intelligent Cluster Analysis

**Given** the application is running on Minikube
**When** pods fail or performance degrades
**Then** kagent analyzes the issue and suggests actionable fixes

**Example Commands**:
```bash
kagent "why are the backend pods in CrashLoopBackOff?"
kagent "analyze resource usage and suggest optimizations"
kagent "check for security issues in my cluster"
kagent "why can't the frontend connect to the backend?"
```

**Acceptance Criteria**:
- kagent identifies root causes of pod failures
- Provides specific, actionable remediation steps
- Analyzes resource constraints and suggests adjustments
- Detects common misconfigurations (DNS, networking, permissions)
- Reports are clear and understandable for developers

---

### Scenario 4: Helm Chart Management

**Given** the application needs configuration management
**When** they create Helm charts for frontend and backend
**Then** values.yaml allows easy customization of replicas, resources, and environment variables

**Example Usage**:
```bash
# Install with default values
helm install todo-frontend ./helm/frontend

# Install with custom values for staging
helm install todo-frontend ./helm/frontend -f values-staging.yaml

# Upgrade with new configuration
helm upgrade todo-frontend ./helm/frontend --set replicaCount=3

# Deploy backend with custom database connection
helm install todo-backend ./helm/backend \
  --set env.DATABASE_URL=postgresql://user:pass@db:5432/todos
```

**Acceptance Criteria**:
- Helm charts template all Kubernetes resources (Deployment, Service, ConfigMap, Ingress)
- values.yaml provides sensible defaults for local development
- Separate values files support dev/staging/production configurations
- Charts are reusable and follow Helm best practices
- Documentation explains all configurable values

---

### Scenario 5: Complete Local Development Environment

**Given** a new developer joins the team
**When** they run the setup script
**Then** Minikube starts, images build, Helm charts deploy, and app is accessible locally within 5 minutes

**Example Workflow**:
```bash
# Clone repository
git clone <repo-url>
cd todo-app

# Run one-command setup
./scripts/k8s-local-setup.sh

# Access application
open http://todo.local
```

**Acceptance Criteria**:
- Single script handles complete setup (Minikube start, image build, Helm install)
- Script checks prerequisites (Docker, Minikube, Helm, kubectl)
- Progress indicators show current step
- Application is accessible at http://todo.local after completion
- Setup completes in under 5 minutes on standard hardware
- Clear error messages if prerequisites are missing

---

## 3. Edge Cases

### E1: Docker AI (Gordon) Unavailable

**Case**: Gordon not available in user's Docker Desktop tier or region

**Behavior**:
- Detect Gordon availability before attempting AI commands
- Fallback to standard Docker CLI commands generated by Claude Code
- Provide pre-written Dockerfiles as templates

**Implementation**:
- Check `docker ai --version` or equivalent to detect availability
- Maintain both AI-assisted and manual Docker operation paths in documentation
- Include optimized Dockerfiles in repository as fallback

---

### E2: Minikube Resource Constraints

**Case**: Local machine has limited RAM (< 8GB) or CPU (< 4 cores)

**Behavior**:
- kagent analyzes available resources and suggests optimized allocation
- Provide minimal resource configuration in Helm values
- Warn user if resources are insufficient

**Implementation**:
- Setup script checks system resources before starting Minikube
- Helm values include `resources.requests` and `resources.limits` for all containers
- Minimal configuration uses: Frontend (256Mi RAM, 0.25 CPU), Backend (512Mi RAM, 0.5 CPU)
- Documentation includes resource requirements and optimization tips

---

### E3: Port Conflicts

**Case**: Default ports (3000, 8000, 8080) already in use on host machine

**Behavior**:
- Detect port conflicts before deployment
- Suggest alternative port mappings
- Use NodePort services with dynamic port selection

**Implementation**:
- Setup script checks if ports are in use: `lsof -i :3000 -i :8000 -i :8080`
- NodePort services allow Kubernetes to assign available ports (30000-32767 range)
- Ingress controller handles routing to avoid host port conflicts
- Configuration allows custom port mapping via Helm values

---

### E4: Image Pull Failures

**Case**: Kubernetes cannot pull Docker images from local registry

**Behavior**:
- Configure `imagePullPolicy: Never` for local images
- Use Minikube's Docker daemon for building images
- Provide clear error messages and remediation steps

**Implementation**:
- Setup script configures shell to use Minikube's Docker daemon: `eval $(minikube docker-env)`
- Build images directly in Minikube's Docker environment
- Helm charts set `imagePullPolicy: Never` for local development
- Documentation explains image availability in Minikube context

---

### E5: Pod Startup Failures

**Case**: Pods fail to start due to missing dependencies or misconfiguration

**Behavior**:
- Init containers check dependencies before main container starts
- Proper health checks configured (liveness, readiness, startup probes)
- Clear logs indicate failure reasons

**Implementation**:
- Backend init container verifies database connectivity
- Frontend init container checks backend availability
- Startup probes allow sufficient time for application initialization
- Liveness probes detect and restart unhealthy containers
- Readiness probes prevent traffic to non-ready pods
- Logs are structured and include troubleshooting hints

---

## 4. Functional Requirements

### FR-001: AI-Assisted Docker Operations with Gordon

**Priority**: High

**Description**: Support natural language Docker commands via Docker AI (Gordon) for containerization tasks.

**Requirements**:
- MUST support natural language commands for: build, optimize, debug, tag operations
- MUST generate multi-stage Dockerfiles for production optimization
- MUST suggest security improvements (vulnerability scanning, base image recommendations)
- MUST suggest performance improvements (layer caching, build optimization)
- MUST provide fallback to standard Docker CLI when Gordon is unavailable
- MUST document both AI-assisted and manual workflows

**Acceptance Criteria**:
- Developer can generate Dockerfiles using natural language
- Generated Dockerfiles follow best practices (multi-stage, minimal layers, security)
- Images build successfully and are under 500MB each
- Fallback documentation enables manual Dockerfile creation
- Security scan results are actionable

---

### FR-002: Multi-Service Containerization

**Priority**: High

**Description**: Containerize both frontend (Next.js) and backend (FastAPI) services with optimized Docker images.

**Requirements**:
- MUST containerize frontend (Next.js) and backend (FastAPI) services
- MUST use multi-stage builds for optimization
- MUST result in images under 500MB each
- MUST support both development and production builds
- MUST include health check endpoints in containers
- MUST run containers as non-root users for security

**Acceptance Criteria**:
- Frontend Dockerfile produces working Next.js container
- Backend Dockerfile produces working FastAPI container
- Production images are optimized (< 500MB each)
- Development images support hot-reload
- Health check endpoints respond correctly
- Containers run with non-root user (UID > 1000)

---

### FR-003: Local Kubernetes with Minikube

**Priority**: High

**Description**: Use Minikube for local Kubernetes cluster with necessary addons and configuration.

**Requirements**:
- MUST use Minikube for local Kubernetes cluster
- MUST enable ingress addon for local domain access (todo.local)
- MUST enable metrics-server addon for resource monitoring
- MUST configure adequate resources (CPU: 2, Memory: 4GB minimum)
- MUST support multiple Kubernetes versions for testing
- MUST persist data across Minikube restarts

**Acceptance Criteria**:
- Minikube starts successfully with required addons
- Ingress controller routes traffic to services
- Metrics-server provides resource usage data
- Cluster has sufficient resources for all pods
- Application data persists across Minikube restarts
- Setup script automates Minikube configuration

---

### FR-004: AI-Assisted Kubernetes with kubectl-ai

**Priority**: Medium

**Description**: Support natural language kubectl operations for Kubernetes resource management.

**Requirements**:
- MUST support natural language kubectl operations
- MUST handle: deploy, scale, expose, debug commands
- MUST generate valid Kubernetes manifests (YAML)
- MUST show status and feedback after operations
- MUST provide fallback to standard kubectl commands
- MUST validate generated manifests before applying

**Acceptance Criteria**:
- Developer can deploy resources using natural language
- Generated YAML manifests are valid and follow best practices
- Commands provide clear success/failure feedback
- Fallback kubectl commands are documented
- Validation catches common errors before applying

---

### FR-005: Intelligent Cluster Analysis with kagent

**Priority**: Medium

**Description**: Analyze cluster health and provide intelligent troubleshooting with kagent.

**Requirements**:
- MUST analyze cluster health and provide reports
- MUST diagnose pod failures and suggest fixes
- MUST optimize resource allocation recommendations
- MUST check for security issues (RBAC, network policies, secrets)
- MUST provide actionable remediation steps
- MUST support both automated and on-demand analysis

**Acceptance Criteria**:
- kagent identifies root causes of common failures
- Recommendations are specific and actionable
- Security analysis covers RBAC, secrets, and network policies
- Resource optimization suggestions are practical
- Reports are clear and understandable

---

### FR-006: Helm Chart Packaging

**Priority**: High

**Description**: Create reusable Helm charts for each service with templated resources and configurable values.

**Requirements**:
- MUST create reusable Helm charts for each service (frontend, backend)
- MUST template all Kubernetes resources (Deployment, Service, ConfigMap, Ingress)
- MUST support values.yaml for configuration
- MUST support multiple environments via values files (dev, staging, production)
- MUST follow Helm best practices (Chart.yaml, templates/, values.yaml structure)
- MUST include documentation for all configurable values

**Acceptance Criteria**:
- Helm charts install successfully with default values
- All Kubernetes resources are templated
- values.yaml provides sensible defaults
- Environment-specific values files work correctly
- Charts pass `helm lint` validation
- README documents all configurable values

---

### FR-007: Service Discovery and Communication

**Priority**: High

**Description**: Enable frontend to reach backend via Kubernetes DNS with proper health checks and startup ordering.

**Requirements**:
- Frontend MUST reach backend via Kubernetes DNS names (service discovery)
- MUST implement health checks (liveness and readiness probes)
- MUST handle service startup order correctly (backend before frontend)
- MUST configure proper service types (ClusterIP for internal, NodePort/LoadBalancer for external)
- MUST support environment-based configuration (ConfigMaps, Secrets)
- MUST implement proper error handling for service unavailability

**Acceptance Criteria**:
- Frontend successfully communicates with backend using service DNS
- Health checks accurately reflect service health
- Services start in correct order (dependencies first)
- ConfigMaps and Secrets are properly mounted
- Error messages are clear when services are unavailable
- Network policies allow required traffic

---

### FR-008: One-Command Local Development

**Priority**: High

**Description**: Provide single script for complete local development environment setup.

**Requirements**:
- MUST provide single script for complete setup (< 5 minutes)
- MUST check prerequisites (Docker, Minikube, Helm, kubectl)
- MUST support hot-reload for development
- MUST provide easy log access via kubectl or kagent
- MUST handle cleanup and teardown
- MUST support incremental updates (rebuild single service)

**Acceptance Criteria**:
- Setup script completes in under 5 minutes
- Prerequisites are checked and reported clearly
- Hot-reload works for code changes
- Logs are easily accessible and readable
- Cleanup script removes all resources
- Incremental updates work without full rebuild

---

## 5. Success Criteria

### SC-001: One-Command Deployment (Weight: 25%)

**Criteria**:
- Complete local deployment achievable with single script execution
- Time from zero to running application is under 5 minutes
- Application is accessible at http://todo.local
- All services are healthy and communicating

**Measurement**:
- Time script execution from start to "Application ready" message
- Verify all pods are in Running state
- Verify application responds at http://todo.local
- Verify frontend can create/read/update/delete tasks via backend

---

### SC-002: AI Tool Integration (Weight: 25%)

**Criteria**:
- Greater than 90% of operations achievable via AI tools without manual kubectl/helm
- Gordon successfully containerizes applications
- kubectl-ai successfully deploys and manages Kubernetes resources
- kagent successfully analyzes cluster health

**Measurement**:
- Count operations performed via AI tools vs manual commands
- Verify Gordon generates working Dockerfiles
- Verify kubectl-ai generates valid manifests
- Verify kagent provides actionable insights
- Document fallback scenarios when AI tools unavailable

---

### SC-003: Helm Chart Completeness (Weight: 20%)

**Criteria**:
- Frontend and backend deployable via Helm install
- All Kubernetes resources templated and configurable
- Zero manual kubectl apply commands required
- Charts pass validation and linting

**Measurement**:
- Verify `helm install` deploys all resources
- Verify all resources are templated (no hardcoded values)
- Verify `helm lint` passes with no errors
- Verify environment-specific values files work
- Count manual kubectl commands required (should be 0)

---

### SC-004: Service Communication (Weight: 15%)

**Criteria**:
- Frontend successfully communicates with backend within cluster
- All health checks passing
- Application fully functional at local domain

**Measurement**:
- Verify frontend can reach backend via service DNS
- Verify all liveness probes return success
- Verify all readiness probes return success
- Verify end-to-end task operations (create, read, update, delete)
- Verify no network errors in logs

---

### SC-005: Documentation Quality (Weight: 15%)

**Criteria**:
- README includes step-by-step AI-assisted setup guide
- Common operations documented with example AI commands
- New developer can deploy without assistance

**Measurement**:
- New developer completes setup following README only
- All AI tool commands are documented with examples
- Troubleshooting section covers common issues
- Architecture diagram shows component relationships
- Prerequisites and system requirements are clear

---

## 6. Out of Scope

The following items are explicitly excluded from this phase:

- **Production Cloud Deployment**: AWS EKS, GCP GKE, Azure AKS deployment
- **CI/CD Pipeline Automation**: GitHub Actions, GitLab CI, Jenkins pipelines
- **Advanced Monitoring**: Prometheus/Grafana setup beyond basic metrics-server
- **Certificate Management**: Let's Encrypt, cert-manager (use self-signed for local)
- **Multi-Region Deployment**: Geographic distribution, multi-cluster management
- **Advanced Security Policies**: OPA (Open Policy Agent), Kyverno policy enforcement
- **Service Mesh**: Istio, Linkerd, Consul Connect
- **GitOps**: ArgoCD, Flux CD continuous deployment
- **Database Migration**: Kubernetes-based database deployment (use existing Neon)
- **Load Testing**: Performance testing, stress testing tools
- **Backup and Disaster Recovery**: Velero, backup strategies

---

## 7. Technology Stack

### Core Technologies

- **Docker Desktop 4.53+**: Container runtime with Docker AI (Gordon) support
- **Minikube**: Local Kubernetes cluster (latest stable version)
- **kubectl**: Kubernetes CLI (version matching Minikube)
- **Helm 3.x**: Kubernetes package manager (3.10+)

### AI-Assisted Tools

- **Docker AI (Gordon)**: Natural language Docker operations
- **kubectl-ai**: Natural language Kubernetes operations
- **kagent**: Intelligent cluster analysis and troubleshooting

### Application Stack (from Phase III)

- **Frontend**: Next.js 16+ (App Router, JavaScript)
- **Backend**: FastAPI (Python 3.11+)
- **Database**: Neon Serverless PostgreSQL (external, not in cluster)
- **Authentication**: Better Auth

### Kubernetes Resources

- **Deployments**: Application workload management
- **Services**: Service discovery and load balancing
- **ConfigMaps**: Configuration management
- **Secrets**: Sensitive data management
- **Ingress**: External access routing
- **PersistentVolumes**: Data persistence (if needed)

---

## 8. Constraints

### Technical Constraints

- MUST use AI tools (Gordon, kubectl-ai, kagent) where available
- MUST work completely offline after initial setup
- MUST NOT require cloud services for basic functionality
- MUST support easy migration to cloud Kubernetes later
- MUST use Minikube (not Kind, k3s, or other local Kubernetes)
- MUST use Helm 3.x (not Helm 2.x)

### Resource Constraints

- Minimum system requirements: 8GB RAM, 4 CPU cores
- Recommended system requirements: 16GB RAM, 8 CPU cores
- Disk space: 20GB free for images and cluster data

### Time Constraints

- Setup must complete in under 5 minutes
- Image builds must complete in under 3 minutes
- Helm deployments must complete in under 2 minutes

### Compatibility Constraints

- Must work on Linux, macOS, and Windows (WSL2)
- Must support Kubernetes versions 1.28+
- Must support Docker Desktop 4.53+ or Docker Engine 24+

---

## 9. Assumptions

1. **Docker Desktop**: Users have Docker Desktop installed with sufficient resources allocated
2. **AI Tool Availability**: Docker AI (Gordon) may not be available to all users; fallback paths are required
3. **kubectl-ai and kagent**: These tools may be experimental or require separate installation
4. **Network Access**: Initial setup requires internet for downloading images and tools
5. **Existing Application**: Phase III Todo Chatbot application is complete and functional
6. **Database**: Neon PostgreSQL remains external (not deployed in Kubernetes cluster)
7. **Local Domain**: Users can modify /etc/hosts or use Minikube tunnel for todo.local access
8. **Development Focus**: This phase prioritizes local development experience over production readiness

---

## 10. Dependencies

### External Dependencies

- Docker Desktop 4.53+ or Docker Engine 24+
- Minikube (latest stable)
- kubectl (matching Minikube Kubernetes version)
- Helm 3.10+
- Git (for repository management)

### Optional Dependencies

- Docker AI (Gordon) - for AI-assisted containerization
- kubectl-ai - for natural language Kubernetes operations
- kagent - for intelligent cluster analysis

### Internal Dependencies

- Phase III Todo Chatbot application (frontend and backend)
- Neon PostgreSQL database (from Phase II/III)
- Better Auth configuration (from Phase II/III)

---

## 11. Risks and Mitigations

### Risk 1: AI Tool Unavailability

**Risk**: Docker AI (Gordon), kubectl-ai, or kagent may not be available or may not work as expected

**Impact**: High - Core feature of AI-assisted DevOps

**Mitigation**:
- Provide comprehensive fallback documentation for manual operations
- Include pre-written Dockerfiles and Kubernetes manifests
- Document standard kubectl and helm commands for all operations
- Test all workflows with and without AI tools

---

### Risk 2: Resource Constraints

**Risk**: User's machine may not have sufficient resources for Minikube

**Impact**: Medium - Application may not run or may be slow

**Mitigation**:
- Check system resources before starting setup
- Provide minimal resource configuration for constrained environments
- Document resource requirements clearly
- Suggest cloud-based alternatives for severely constrained systems

---

### Risk 3: Networking Issues

**Risk**: Port conflicts, DNS resolution, or ingress configuration may fail

**Impact**: Medium - Application may not be accessible

**Mitigation**:
- Check for port conflicts before deployment
- Provide multiple access methods (NodePort, port-forward, ingress)
- Document /etc/hosts configuration for todo.local
- Include troubleshooting guide for common networking issues

---

### Risk 4: Image Build Failures

**Risk**: Docker builds may fail due to network issues, missing dependencies, or configuration errors

**Impact**: High - Cannot deploy application

**Mitigation**:
- Use Minikube's Docker daemon to avoid image pull issues
- Cache dependencies in Docker layers
- Provide pre-built images as fallback
- Include detailed error messages and troubleshooting steps

---

### Risk 5: Kubernetes Version Compatibility

**Risk**: Kubernetes API changes may break manifests or Helm charts

**Impact**: Medium - Deployment may fail on different Kubernetes versions

**Mitigation**:
- Test with multiple Kubernetes versions (1.28, 1.29, 1.30)
- Use stable Kubernetes APIs (apps/v1, v1, networking.k8s.io/v1)
- Document supported Kubernetes versions
- Use Helm chart API version v2 for compatibility

---

## 12. Future Enhancements

Items for consideration in future phases:

1. **Cloud Deployment**: Extend Helm charts for AWS EKS, GCP GKE, Azure AKS
2. **CI/CD Integration**: GitHub Actions workflows for automated testing and deployment
3. **Monitoring Stack**: Prometheus, Grafana, and alerting
4. **Service Mesh**: Istio or Linkerd for advanced traffic management
5. **GitOps**: ArgoCD for declarative continuous deployment
6. **Multi-Environment**: Separate clusters for dev, staging, production
7. **Database in Kubernetes**: StatefulSet for PostgreSQL (optional alternative to Neon)
8. **Autoscaling**: Horizontal Pod Autoscaler (HPA) based on metrics
9. **Security Hardening**: Network policies, Pod Security Standards, RBAC refinement
10. **Backup and Recovery**: Velero for cluster backup and disaster recovery

---

## 13. Glossary

- **Minikube**: Local Kubernetes cluster for development and testing
- **Helm**: Package manager for Kubernetes (like npm for Node.js)
- **kubectl**: Command-line tool for interacting with Kubernetes
- **Docker AI (Gordon)**: AI assistant for Docker operations (part of Docker Desktop)
- **kubectl-ai**: AI-powered kubectl wrapper for natural language commands
- **kagent**: AI agent for Kubernetes cluster analysis and troubleshooting
- **Ingress**: Kubernetes resource for routing external HTTP(S) traffic to services
- **ConfigMap**: Kubernetes resource for storing configuration data
- **Secret**: Kubernetes resource for storing sensitive data
- **Deployment**: Kubernetes resource for managing application replicas
- **Service**: Kubernetes resource for exposing applications (service discovery)
- **Pod**: Smallest deployable unit in Kubernetes (one or more containers)
- **NodePort**: Service type that exposes application on a static port on each node
- **ClusterIP**: Service type for internal cluster communication only
- **Liveness Probe**: Health check to determine if container should be restarted
- **Readiness Probe**: Health check to determine if container can receive traffic
- **Startup Probe**: Health check for slow-starting containers

---

**End of Specification**
