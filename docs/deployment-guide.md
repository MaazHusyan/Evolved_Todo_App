# Kubernetes Deployment Guide

## Overview

This guide covers deploying the Evolve Todo application to a Kubernetes cluster using either Kustomize or Helm.

## Prerequisites

- Docker installed and running
- kubectl installed and configured
- Minikube (for local development) or access to a Kubernetes cluster
- Helm 3.x (if using Helm deployment)

## Quick Start

For the fastest setup, use the quick-start script:

```bash
bash scripts/dev/quick-start.sh
```

This script will:
1. Check and install required tools
2. Setup Minikube cluster
3. Build Docker images
4. Deploy the application with Helm

## Manual Deployment

### Step 1: Install Required Tools

```bash
bash scripts/setup/install-tools.sh
```

This installs:
- kubectl
- minikube
- helm

### Step 2: Setup Minikube Cluster

```bash
bash scripts/setup/setup-minikube.sh
```

This will:
- Start Minikube with 4 CPUs and 4GB RAM
- Enable ingress and metrics-server addons
- Configure kubectl context

### Step 3: Build Docker Images

```bash
bash scripts/docker/build-all.sh
```

This builds:
- Backend image: `evolve-todo-backend:latest`
- Frontend image: `evolve-todo-frontend:latest`

### Step 4: Deploy Application

Choose one of the following deployment methods:

#### Option A: Deploy with Helm (Recommended)

```bash
bash scripts/k8s/deploy-helm.sh
```

Or manually:

```bash
# Load images into Minikube
minikube image load evolve-todo-backend:latest
minikube image load evolve-todo-frontend:latest

# Install with Helm
helm install evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo \
  --create-namespace \
  --wait
```

#### Option B: Deploy with Kustomize

```bash
# For development environment
bash scripts/k8s/deploy-kustomize.sh dev

# For production environment
bash scripts/k8s/deploy-kustomize.sh prod
```

Or manually:

```bash
# Load images into Minikube
minikube image load evolve-todo-backend:latest
minikube image load evolve-todo-frontend:latest

# Apply Kustomize configuration
kubectl apply -k k8s/overlays/dev
```

## Accessing the Application

### Method 1: Using Ingress (Recommended)

1. Add to `/etc/hosts`:
   ```bash
   echo "127.0.0.1 evolve-todo.local" | sudo tee -a /etc/hosts
   ```

2. Start Minikube tunnel (in a separate terminal):
   ```bash
   minikube tunnel
   ```

3. Access the application:
   - Frontend: http://evolve-todo.local
   - Backend API: http://evolve-todo.local/api

### Method 2: Using Port Forwarding

```bash
# Forward frontend
kubectl port-forward -n evolve-todo svc/evolve-todo-frontend 3000:3000

# Forward backend (in another terminal)
kubectl port-forward -n evolve-todo svc/evolve-todo-backend 8000:8000
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Configuration

### Environment-Specific Deployments

#### Development Environment

```bash
# Using Helm
helm install evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo-dev \
  --set backend.replicaCount=1 \
  --set frontend.replicaCount=1 \
  --set backend.env.environment=development \
  --set backend.env.logLevel=debug

# Using Kustomize
kubectl apply -k k8s/overlays/dev
```

#### Production Environment

```bash
# Using Helm
helm install evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo-prod \
  --set backend.replicaCount=3 \
  --set frontend.replicaCount=3 \
  --set backend.env.environment=production \
  --set backend.env.logLevel=info

# Using Kustomize
kubectl apply -k k8s/overlays/prod
```

### Secrets Configuration

**IMPORTANT**: Update secrets before deploying to production!

#### Using Helm

Create a `values-prod.yaml` file:

```yaml
backend:
  secrets:
    databaseUrl: "postgresql://user:password@postgres:5432/evolve_todo"
    jwtSecret: "your-secure-random-secret-key"
    openaiApiKey: "sk-..."
    groqApiKey: "gsk_..."
```

Deploy with custom values:

```bash
helm install evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo \
  --values values-prod.yaml
```

#### Using Kustomize

Edit `k8s/base/backend-secret.yaml` and update the secret values:

```yaml
stringData:
  database-url: "postgresql://user:password@postgres:5432/evolve_todo"
  jwt-secret: "your-secure-random-secret-key"
  openai-api-key: "sk-..."
  groq-api-key: "gsk_..."
```

## Monitoring and Management

### View Application Status

```bash
# Get all resources
kubectl get all -n evolve-todo

# Get pod status
kubectl get pods -n evolve-todo

# Get service endpoints
kubectl get svc -n evolve-todo

# Get ingress status
kubectl get ingress -n evolve-todo
```

### View Logs

```bash
# Using the logs script
bash scripts/k8s/logs.sh evolve-todo backend

# Or manually
kubectl logs -n evolve-todo -l app.kubernetes.io/component=backend --tail=100

# Follow logs
kubectl logs -n evolve-todo -l app.kubernetes.io/component=backend -f
```

### Execute Commands in Pods

```bash
# Get a shell in backend pod
kubectl exec -it -n evolve-todo deployment/evolve-todo-backend -- /bin/bash

# Run a command
kubectl exec -n evolve-todo deployment/evolve-todo-backend -- python -c "print('Hello')"
```

### Scale Deployments

```bash
# Scale backend
kubectl scale deployment evolve-todo-backend -n evolve-todo --replicas=5

# Scale frontend
kubectl scale deployment evolve-todo-frontend -n evolve-todo --replicas=3
```

## Updating the Application

### Update Docker Images

```bash
# Rebuild images
bash scripts/docker/build-all.sh

# Load into Minikube
minikube image load evolve-todo-backend:latest
minikube image load evolve-todo-frontend:latest

# Restart deployments
kubectl rollout restart deployment -n evolve-todo
```

### Update Configuration

#### Using Helm

```bash
# Update values
helm upgrade evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo \
  --set backend.replicaCount=3
```

#### Using Kustomize

```bash
# Edit configuration files
# Then reapply
kubectl apply -k k8s/overlays/dev
```

## Rollback

### Helm Rollback

```bash
# View release history
helm history evolve-todo -n evolve-todo

# Rollback to previous version
helm rollback evolve-todo -n evolve-todo

# Rollback to specific revision
helm rollback evolve-todo 2 -n evolve-todo
```

### Kubernetes Rollback

```bash
# View rollout history
kubectl rollout history deployment/evolve-todo-backend -n evolve-todo

# Rollback to previous version
kubectl rollout undo deployment/evolve-todo-backend -n evolve-todo

# Rollback to specific revision
kubectl rollout undo deployment/evolve-todo-backend -n evolve-todo --to-revision=2
```

## Cleanup

### Remove Application

```bash
# Using the cleanup script
bash scripts/k8s/cleanup.sh

# Or manually with Helm
helm uninstall evolve-todo -n evolve-todo
kubectl delete namespace evolve-todo

# Or manually with Kustomize
kubectl delete -k k8s/overlays/dev
```

### Stop Minikube

```bash
# Stop cluster
minikube stop

# Delete cluster
minikube delete
```

## Production Deployment

### Cloud Providers

#### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster --name evolve-todo --region us-west-2

# Configure kubectl
aws eks update-kubeconfig --name evolve-todo --region us-west-2

# Deploy application
helm install evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo \
  --create-namespace \
  --values values-prod.yaml
```

#### Google GKE

```bash
# Create GKE cluster
gcloud container clusters create evolve-todo \
  --zone us-central1-a \
  --num-nodes 3

# Get credentials
gcloud container clusters get-credentials evolve-todo --zone us-central1-a

# Deploy application
helm install evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo \
  --create-namespace \
  --values values-prod.yaml
```

#### Azure AKS

```bash
# Create AKS cluster
az aks create \
  --resource-group evolve-todo-rg \
  --name evolve-todo \
  --node-count 3

# Get credentials
az aks get-credentials --resource-group evolve-todo-rg --name evolve-todo

# Deploy application
helm install evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo \
  --create-namespace \
  --values values-prod.yaml
```

### Production Checklist

- [ ] Update all secrets with secure values
- [ ] Configure proper database (not SQLite)
- [ ] Setup SSL/TLS certificates
- [ ] Configure ingress with proper domain
- [ ] Enable monitoring and logging
- [ ] Setup backup and disaster recovery
- [ ] Configure autoscaling
- [ ] Implement network policies
- [ ] Setup CI/CD pipeline
- [ ] Configure resource limits and requests
- [ ] Enable pod security policies
- [ ] Setup external secrets management (Vault, AWS Secrets Manager, etc.)

## Troubleshooting

See [Troubleshooting Guide](./troubleshooting.md) for common issues and solutions.

## Additional Resources

- [Architecture Documentation](../ai-tools/architecture.md)
- [AI Chatbot Usage Guide](../ai-tools/usage-guide.md)
- [MCP Integration Guide](../ai-tools/mcp-integration.md)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
