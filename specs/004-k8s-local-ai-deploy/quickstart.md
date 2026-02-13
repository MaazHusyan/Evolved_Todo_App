# Quick Start Guide: Phase IV - Local Kubernetes Deployment

**Feature**: Local Kubernetes Deployment with AI-Assisted DevOps
**Target Audience**: Developers setting up local environment
**Time to Complete**: < 5 minutes

---

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Docker
docker --version
# Expected: Docker version 29.2.0 or higher

# Check Docker AI (Gordon)
docker ai --help
# Expected: Usage information displayed

# Check system resources
free -h  # Should show at least 8GB RAM
nproc    # Should show at least 4 CPU cores
df -h    # Should show at least 20GB free disk space
```

**If missing tools**, install them:

```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installations
minikube version
kubectl version --client
helm version
```

---

## One-Command Setup

Once prerequisites are installed, run:

```bash
# From project root
./scripts/k8s-local-setup.sh
```

This script will:
1. ✅ Check prerequisites
2. ✅ Start Minikube with required addons
3. ✅ Configure Docker environment
4. ✅ Build frontend and backend images
5. ✅ Install Helm charts
6. ✅ Wait for pods to be ready
7. ✅ Display access URLs

**Expected Output**:
```
✓ Prerequisites check passed
✓ Minikube started successfully
✓ Docker environment configured
✓ Building frontend image... Done (2m 15s)
✓ Building backend image... Done (1m 45s)
✓ Installing frontend Helm chart... Done
✓ Installing backend Helm chart... Done
✓ Waiting for pods to be ready... Done

🎉 Todo Chatbot is ready!

Access the application:
  - Frontend: http://todo.local
  - Frontend (NodePort): http://192.168.49.2:30000
  - Minikube Dashboard: minikube dashboard

Useful commands:
  - View pods: kubectl get pods
  - View logs: kubectl logs -f deployment/todo-frontend
  - Restart: kubectl rollout restart deployment/todo-frontend
```

---

## Manual Setup (Step-by-Step)

If you prefer manual setup or the script fails:

### Step 1: Start Minikube

```bash
# Start Minikube with adequate resources
minikube start --cpus=2 --memory=4096 --driver=docker

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify Minikube is running
minikube status
```

### Step 2: Configure Docker Environment

```bash
# Point Docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)

# Verify configuration
docker ps  # Should show Minikube containers
```

### Step 3: Build Docker Images

**Using Docker AI (Gordon)**:
```bash
# Navigate to frontend
cd frontend

# Ask Gordon to build optimized image
docker ai "build an optimized production image for Next.js app"

# Or use standard command
docker build -t todo-frontend:latest .

# Navigate to backend
cd ../backend

# Ask Gordon to build optimized image
docker ai "build an optimized production image for FastAPI app"

# Or use standard command
docker build -t todo-backend:latest .

# Verify images
docker images | grep todo
```

### Step 4: Create Kubernetes Secret

```bash
# Create secret for database connection
kubectl create secret generic backend-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@neon-host.neon.tech/db?sslmode=require"

# Verify secret
kubectl get secret backend-secrets
```

### Step 5: Install Helm Charts

```bash
# Install backend first (frontend depends on it)
helm install todo-backend ./helm/backend \
  --set image.tag=latest

# Install frontend
helm install todo-frontend ./helm/frontend \
  --set image.tag=latest

# Verify installations
helm list
```

### Step 6: Wait for Pods

```bash
# Watch pod status
kubectl get pods -w

# Wait for all pods to be Running
# Expected: 2 frontend pods, 2 backend pods

# Check pod details if issues
kubectl describe pod <pod-name>
```

### Step 7: Configure Local Domain

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts

# Verify
ping todo.local
```

### Step 8: Access Application

```bash
# Open in browser
xdg-open http://todo.local

# Or use NodePort
xdg-open http://$(minikube ip):30000
```

---

## Testing Scenarios

### Scenario 1: Verify Frontend Accessibility

**Test**: Frontend loads and displays UI

```bash
# Check frontend pods
kubectl get pods -l app=todo-frontend

# Check frontend service
kubectl get svc todo-frontend-service

# Test frontend endpoint
curl http://$(minikube ip):30000

# Expected: HTML response with Next.js app
```

**Success Criteria**:
- ✅ Frontend pods are Running
- ✅ Service has endpoints
- ✅ HTTP 200 response
- ✅ UI loads in browser

---

### Scenario 2: Verify Backend Connectivity

**Test**: Backend is accessible from frontend

```bash
# Check backend pods
kubectl get pods -l app=todo-backend

# Check backend service
kubectl get svc todo-backend-service

# Test backend health endpoint
kubectl exec -it deployment/todo-frontend -- curl http://todo-backend-service:8000/health

# Expected: {"status": "healthy"}
```

**Success Criteria**:
- ✅ Backend pods are Running
- ✅ Service has endpoints
- ✅ Health check returns 200
- ✅ Frontend can reach backend

---

### Scenario 3: Verify Database Connection

**Test**: Backend connects to Neon PostgreSQL

```bash
# Check backend readiness
kubectl exec -it deployment/todo-backend -- curl http://localhost:8000/ready

# Expected: {"status": "ready"}

# Check backend logs for database connection
kubectl logs deployment/todo-backend | grep -i database

# Expected: No connection errors
```

**Success Criteria**:
- ✅ Readiness probe returns 200
- ✅ No database connection errors in logs
- ✅ Backend can query database

---

### Scenario 4: End-to-End Task Operations

**Test**: Complete CRUD operations work

```bash
# 1. Create a task
curl -X POST http://$(minikube ip):30000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "priority": "high"}'

# 2. List tasks
curl http://$(minikube ip):30000/api/tasks

# 3. Update task
curl -X PUT http://$(minikube ip):30000/api/tasks/<task-id> \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 4. Delete task
curl -X DELETE http://$(minikube ip):30000/api/tasks/<task-id>
```

**Success Criteria**:
- ✅ Task created successfully
- ✅ Task appears in list
- ✅ Task updated successfully
- ✅ Task deleted successfully

---

### Scenario 5: Health Checks and Probes

**Test**: Kubernetes health checks work correctly

```bash
# Check liveness probes
kubectl get pods -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}'

# Expected: All "True"

# Simulate pod failure (kill process)
kubectl exec -it deployment/todo-backend -- pkill -9 uvicorn

# Watch pod restart
kubectl get pods -w

# Expected: Pod restarts automatically
```

**Success Criteria**:
- ✅ All pods report Ready
- ✅ Liveness probes passing
- ✅ Readiness probes passing
- ✅ Failed pods restart automatically

---

### Scenario 6: Resource Monitoring

**Test**: Resource usage is within limits

```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods

# Expected: Usage within configured limits
# Frontend: < 512Mi RAM, < 0.5 CPU
# Backend: < 1Gi RAM, < 1.0 CPU
```

**Success Criteria**:
- ✅ No pods evicted due to OOM
- ✅ CPU usage reasonable
- ✅ Memory usage within limits

---

### Scenario 7: Scaling Operations

**Test**: Horizontal scaling works

**Using kubectl-ai** (if available):
```bash
kubectl-ai "scale the backend to 3 replicas"
```

**Using standard kubectl**:
```bash
# Scale backend to 3 replicas
kubectl scale deployment todo-backend --replicas=3

# Verify scaling
kubectl get pods -l app=todo-backend

# Expected: 3 backend pods Running

# Scale back to 2
kubectl scale deployment todo-backend --replicas=2
```

**Success Criteria**:
- ✅ New pods created successfully
- ✅ All pods reach Running state
- ✅ Service load balances across pods

---

### Scenario 8: Configuration Updates

**Test**: ConfigMap and Secret updates work

```bash
# Update frontend ConfigMap
kubectl edit configmap frontend-config

# Change API_URL value, save and exit

# Restart frontend pods to pick up changes
kubectl rollout restart deployment todo-frontend

# Verify new configuration
kubectl exec -it deployment/todo-frontend -- env | grep API_URL
```

**Success Criteria**:
- ✅ ConfigMap updated successfully
- ✅ Pods restarted with new config
- ✅ Application uses new configuration

---

### Scenario 9: Helm Upgrades

**Test**: Helm chart upgrades work

```bash
# Update Helm values
helm upgrade todo-frontend ./helm/frontend \
  --set replicaCount=3 \
  --set resources.limits.memory=1Gi

# Check rollout status
kubectl rollout status deployment/todo-frontend

# Verify changes
kubectl get deployment todo-frontend -o yaml | grep -A 5 resources
```

**Success Criteria**:
- ✅ Helm upgrade successful
- ✅ Deployment updated
- ✅ New configuration applied

---

### Scenario 10: Rollback

**Test**: Rollback to previous version works

```bash
# View revision history
helm history todo-frontend

# Rollback to previous revision
helm rollback todo-frontend

# Verify rollback
kubectl get pods -l app=todo-frontend
```

**Success Criteria**:
- ✅ Rollback successful
- ✅ Pods running previous version
- ✅ Application functional

---

## AI-Assisted Operations

### Using Docker AI (Gordon)

```bash
# Generate Dockerfile
docker ai "create optimized multi-stage Dockerfile for Next.js 16 frontend"

# Optimize existing Dockerfile
docker ai "optimize this Dockerfile for production and security"

# Analyze image
docker ai "analyze security vulnerabilities in todo-frontend:latest"

# Troubleshoot build issues
docker ai "why is my Docker build failing with error X?"
```

### Using kubectl-ai (Optional)

```bash
# Deploy resources
kubectl-ai "deploy the todo frontend with 2 replicas and a load balancer"

# Scale resources
kubectl-ai "scale the backend to handle more load"

# Debug issues
kubectl-ai "check why the pods are failing"

# Update resources
kubectl-ai "update the frontend deployment to use 1GB memory limit"
```

### Using kagent (Optional)

```bash
# Analyze cluster health
kagent "analyze the cluster health and identify issues"

# Optimize resources
kagent "optimize resource allocation for better performance"

# Troubleshoot
kagent "why are the backend pods in CrashLoopBackOff?"

# Security analysis
kagent "check for security issues in my cluster"
```

---

## Common Commands

### Viewing Resources

```bash
# All resources
kubectl get all

# Pods with details
kubectl get pods -o wide

# Services
kubectl get svc

# Ingress
kubectl get ingress

# ConfigMaps and Secrets
kubectl get configmap,secret
```

### Viewing Logs

```bash
# Frontend logs
kubectl logs -f deployment/todo-frontend

# Backend logs
kubectl logs -f deployment/todo-backend

# Previous container logs (after crash)
kubectl logs deployment/todo-backend --previous

# Logs from specific pod
kubectl logs <pod-name>
```

### Debugging

```bash
# Describe pod (shows events)
kubectl describe pod <pod-name>

# Execute command in pod
kubectl exec -it <pod-name> -- /bin/sh

# Port forward to local machine
kubectl port-forward deployment/todo-backend 8000:8000

# View resource usage
kubectl top pods
kubectl top nodes
```

### Helm Operations

```bash
# List releases
helm list

# Get values
helm get values todo-frontend

# Upgrade release
helm upgrade todo-frontend ./helm/frontend

# Rollback release
helm rollback todo-frontend

# Uninstall release
helm uninstall todo-frontend
```

---

## Cleanup

### Temporary Cleanup (Keep Minikube)

```bash
# Uninstall Helm releases
helm uninstall todo-frontend
helm uninstall todo-backend

# Delete secrets
kubectl delete secret backend-secrets

# Verify cleanup
kubectl get all
```

### Complete Cleanup (Remove Everything)

```bash
# Run cleanup script
./scripts/k8s-teardown.sh

# Or manually:
helm uninstall todo-frontend todo-backend
kubectl delete secret backend-secrets
minikube stop
minikube delete

# Remove /etc/hosts entry
sudo sed -i '/todo.local/d' /etc/hosts
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods

# Describe pod for events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Common issues:
# - ImagePullBackOff: Image not found (rebuild in Minikube context)
# - CrashLoopBackOff: Application error (check logs)
# - Pending: Insufficient resources (check kubectl top nodes)
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints

# Test internal connectivity
kubectl exec -it deployment/todo-frontend -- curl http://todo-backend-service:8000/health

# Check ingress
kubectl get ingress
kubectl describe ingress todo-ingress

# Verify /etc/hosts
cat /etc/hosts | grep todo.local
```

### Database Connection Failures

```bash
# Check secret
kubectl get secret backend-secrets -o yaml

# Verify DATABASE_URL format
kubectl exec -it deployment/todo-backend -- env | grep DATABASE_URL

# Test connection from pod
kubectl exec -it deployment/todo-backend -- python -c "import asyncpg; print('Testing connection...')"

# Check backend logs
kubectl logs deployment/todo-backend | grep -i database
```

---

## Performance Benchmarks

**Expected Performance** (on recommended hardware):

| Metric | Target | Measurement |
|--------|--------|-------------|
| Setup Time | < 5 minutes | Time from script start to "ready" |
| Image Build (Frontend) | < 3 minutes | Docker build time |
| Image Build (Backend) | < 2 minutes | Docker build time |
| Pod Startup | < 30 seconds | Time to Running state |
| Health Check Response | < 100ms | /health endpoint latency |
| Readiness Check Response | < 500ms | /ready endpoint latency |
| Frontend Load Time | < 2 seconds | Time to interactive |
| API Response Time (p95) | < 500ms | Task CRUD operations |

---

## Next Steps

After successful setup:

1. ✅ Verify all testing scenarios pass
2. ✅ Explore AI-assisted operations (Gordon, kubectl-ai, kagent)
3. ✅ Experiment with scaling and updates
4. ✅ Review Helm charts and customize values
5. ✅ Read troubleshooting guide for common issues
6. ✅ Contribute improvements to documentation

---

**Quick Start Status**: Ready for Use
**Last Updated**: 2026-02-12
