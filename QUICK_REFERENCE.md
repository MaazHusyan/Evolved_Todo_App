# Kubernetes Deployment - Quick Reference

## 🚀 Quick Start (When Network Improves)

```bash
# One command to set up everything
cd /home/maaz/Desktop/Evolve_Todo_App
bash scripts/dev/quick-start.sh
```

## 📋 What's Complete (95%)

✅ **All Infrastructure Code**
- 16 Kubernetes manifests (base + overlays)
- 13 Helm chart files
- 9 automation scripts
- 8 documentation files
- 2 Docker images built and optimized

✅ **Docker Images**
- Backend: 84.2MB ✓
- Frontend: 228MB ✓

✅ **Kubernetes Manifests**
- Deployments, Services, ConfigMaps, Secrets
- Ingress configuration
- Kustomize overlays (dev/prod)

✅ **Helm Charts**
- Complete chart with templates
- Environment-specific values
- Helper templates

✅ **Automation Scripts**
- Installation scripts
- Deployment scripts
- Management scripts
- Validation script

✅ **Documentation**
- Deployment guide
- Troubleshooting guide
- AI tools documentation
- Project overview

## ⏳ What Remains (5%)

⏳ **Tool Installation** (blocked by network)
- kubectl
- minikube
- helm

⏳ **Cluster Setup**
- Start Minikube
- Enable addons
- Load images

⏳ **Deployment Testing**
- Deploy application
- Verify pods running
- Test health checks
- Access via ingress

## 🔧 Manual Steps (If Quick Start Fails)

### 1. Install Tools

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube-linux-amd64
sudo mv minikube-linux-amd64 /usr/local/bin/minikube

# Install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 2. Setup Cluster

```bash
# Start Minikube
minikube start --driver=docker --cpus=4 --memory=4096

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify
kubectl cluster-info
```

### 3. Deploy Application

```bash
# Load images
minikube image load evolve-todo-backend:latest
minikube image load evolve-todo-frontend:latest

# Deploy with Helm
helm install evolve-todo ./helm/evolve-todo \
  --namespace evolve-todo \
  --create-namespace \
  --wait

# Or deploy with Kustomize
kubectl apply -k k8s/overlays/dev
```

### 4. Access Application

```bash
# Option 1: Ingress (recommended)
echo "127.0.0.1 evolve-todo.local" | sudo tee -a /etc/hosts
minikube tunnel  # Run in separate terminal
# Visit: http://evolve-todo.local

# Option 2: Port forwarding
kubectl port-forward -n evolve-todo svc/evolve-todo-frontend 3000:3000
kubectl port-forward -n evolve-todo svc/evolve-todo-backend 8000:8000
# Visit: http://localhost:3000
```

## 🔍 Validation

```bash
# Run validation script
bash scripts/setup/validate-deployment.sh

# Check deployment status
kubectl get all -n evolve-todo

# Check pod logs
bash scripts/k8s/logs.sh evolve-todo backend
bash scripts/k8s/logs.sh evolve-todo frontend

# Test health endpoints
kubectl port-forward -n evolve-todo svc/evolve-todo-backend 8000:8000
curl http://localhost:8000/health/live
curl http://localhost:8000/health/ready
```

## 🧹 Cleanup

```bash
# Remove everything
bash scripts/k8s/cleanup.sh

# Or manually
helm uninstall evolve-todo -n evolve-todo
kubectl delete namespace evolve-todo
minikube stop
minikube delete
```

## 📚 Documentation

- **Deployment Guide**: `docs/deployment-guide.md`
- **Troubleshooting**: `docs/troubleshooting.md`
- **Project Overview**: `docs/kubernetes-overview.md`
- **Status Report**: `DEPLOYMENT_STATUS.md`

## 🎯 Success Criteria

When deployment is complete, you should see:

```bash
$ kubectl get pods -n evolve-todo
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxx                 1/1     Running   0          2m
backend-yyy                 1/1     Running   0          2m
frontend-xxx                1/1     Running   0          2m
frontend-yyy                1/1     Running   0          2m
```

## 🐛 Common Issues

**Issue**: Pods stuck in ImagePullBackOff
**Solution**: Load images into Minikube
```bash
minikube image load evolve-todo-backend:latest
minikube image load evolve-todo-frontend:latest
```

**Issue**: Ingress not accessible
**Solution**: Ensure minikube tunnel is running
```bash
minikube tunnel
```

**Issue**: Pods CrashLoopBackOff
**Solution**: Check logs and secrets
```bash
kubectl logs -n evolve-todo <pod-name>
kubectl get secrets -n evolve-todo
```

## 📞 Support

- Check `docs/troubleshooting.md` for detailed solutions
- Review logs: `bash scripts/k8s/logs.sh evolve-todo backend`
- Validate setup: `bash scripts/setup/validate-deployment.sh`

---

**Last Updated**: 2026-02-12
**Status**: Infrastructure Complete (95%) - Awaiting Tool Installation
