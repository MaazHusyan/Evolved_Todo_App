# Troubleshooting Guide

## Common Issues and Solutions

### Docker Build Issues

#### Issue: Backend Docker build fails with "pip install" error

**Symptoms:**
```
ERROR: Could not find a version that satisfies the requirement...
```

**Solution:**
1. Check your internet connection
2. Clear Docker build cache:
   ```bash
   docker builder prune -a
   ```
3. Rebuild with no cache:
   ```bash
   docker build --no-cache -t evolve-todo-backend:latest backend/
   ```

#### Issue: Frontend Docker build fails with "npm install" error

**Symptoms:**
```
npm ERR! network request failed
```

**Solution:**
1. Check your internet connection
2. Clear npm cache:
   ```bash
   docker run --rm -v $(pwd)/frontend:/app node:20-alpine sh -c "cd /app && npm cache clean --force"
   ```
3. Rebuild the image

#### Issue: Docker image size too large

**Symptoms:**
- Backend image > 300MB
- Frontend image > 250MB

**Solution:**
1. Verify multi-stage build is working correctly
2. Check that build artifacts aren't being copied to final stage
3. Review Dockerfile for unnecessary dependencies

### Kubernetes Deployment Issues

#### Issue: Pods stuck in "ImagePullBackOff" state

**Symptoms:**
```bash
kubectl get pods -n evolve-todo
NAME                        READY   STATUS             RESTARTS   AGE
backend-xxx                 0/1     ImagePullBackOff   0          2m
```

**Solution:**
1. For Minikube, ensure images are loaded:
   ```bash
   minikube image load evolve-todo-backend:latest
   minikube image load evolve-todo-frontend:latest
   ```
2. Verify image exists:
   ```bash
   docker images | grep evolve-todo
   ```
3. Check imagePullPolicy is set to `IfNotPresent` for local images

#### Issue: Pods stuck in "CrashLoopBackOff" state

**Symptoms:**
```bash
kubectl get pods -n evolve-todo
NAME                        READY   STATUS              RESTARTS   AGE
backend-xxx                 0/1     CrashLoopBackOff    5          5m
```

**Solution:**
1. Check pod logs:
   ```bash
   kubectl logs -n evolve-todo backend-xxx
   ```
2. Common causes:
   - Missing environment variables
   - Database connection failure
   - Invalid configuration
   - Application startup error

3. Verify secrets are created:
   ```bash
   kubectl get secrets -n evolve-todo
   ```

4. Check configmaps:
   ```bash
   kubectl get configmaps -n evolve-todo
   ```

#### Issue: Pods stuck in "Pending" state

**Symptoms:**
```bash
kubectl get pods -n evolve-todo
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxx                 0/1     Pending   0          5m
```

**Solution:**
1. Check pod events:
   ```bash
   kubectl describe pod -n evolve-todo backend-xxx
   ```
2. Common causes:
   - Insufficient cluster resources
   - Node selector mismatch
   - PersistentVolume not available

3. Check cluster resources:
   ```bash
   kubectl top nodes
   kubectl describe nodes
   ```

### Minikube Issues

#### Issue: Minikube won't start

**Symptoms:**
```
Exiting due to PROVIDER_DOCKER_NOT_RUNNING
```

**Solution:**
1. Ensure Docker is running:
   ```bash
   sudo systemctl start docker
   ```
2. Check Docker permissions:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```
3. Delete and recreate cluster:
   ```bash
   minikube delete
   minikube start --driver=docker
   ```

#### Issue: Minikube tunnel not working

**Symptoms:**
- Cannot access application via ingress
- Connection refused errors

**Solution:**
1. Ensure tunnel is running:
   ```bash
   minikube tunnel
   ```
2. Check if ingress addon is enabled:
   ```bash
   minikube addons list | grep ingress
   minikube addons enable ingress
   ```
3. Verify ingress controller is running:
   ```bash
   kubectl get pods -n ingress-nginx
   ```

#### Issue: Minikube out of resources

**Symptoms:**
```
Insufficient memory/cpu
```

**Solution:**
1. Stop Minikube:
   ```bash
   minikube stop
   ```
2. Delete and recreate with more resources:
   ```bash
   minikube delete
   minikube start --cpus=4 --memory=8192
   ```

### Helm Issues

#### Issue: Helm install fails with "release already exists"

**Symptoms:**
```
Error: cannot re-use a name that is still in use
```

**Solution:**
1. Check existing releases:
   ```bash
   helm list -A
   ```
2. Uninstall existing release:
   ```bash
   helm uninstall evolve-todo -n evolve-todo
   ```
3. Or use upgrade instead:
   ```bash
   helm upgrade --install evolve-todo ./helm/evolve-todo
   ```

#### Issue: Helm template rendering errors

**Symptoms:**
```
Error: template: evolve-todo/templates/deployment.yaml:10:14: executing...
```

**Solution:**
1. Validate template syntax:
   ```bash
   helm template evolve-todo ./helm/evolve-todo --debug
   ```
2. Check values file syntax:
   ```bash
   helm lint ./helm/evolve-todo
   ```

### Application Issues

#### Issue: Backend health check failing

**Symptoms:**
- Pods not becoming ready
- Health check endpoints returning errors

**Solution:**
1. Check health endpoint directly:
   ```bash
   kubectl port-forward -n evolve-todo svc/evolve-todo-backend 8000:8000
   curl http://localhost:8000/health/live
   ```
2. Check backend logs:
   ```bash
   kubectl logs -n evolve-todo -l app.kubernetes.io/component=backend
   ```
3. Verify database connection
4. Check environment variables

#### Issue: Frontend cannot connect to backend

**Symptoms:**
- API calls failing
- CORS errors in browser console

**Solution:**
1. Verify backend service is running:
   ```bash
   kubectl get svc -n evolve-todo
   ```
2. Check frontend environment variables:
   ```bash
   kubectl get configmap -n evolve-todo frontend-config -o yaml
   ```
3. Verify API URL is correct:
   - Should be `http://backend:8000` for internal communication
   - Or `http://evolve-todo.local/api` for external access

4. Check CORS configuration in backend

#### Issue: AI chatbot not responding

**Symptoms:**
- Chat messages not getting responses
- 500 errors on chat endpoint

**Solution:**
1. Check backend logs for AI errors:
   ```bash
   kubectl logs -n evolve-todo -l app.kubernetes.io/component=backend | grep -i "ai\|mcp"
   ```
2. Verify API keys are set:
   ```bash
   kubectl get secret -n evolve-todo backend-secrets -o yaml
   ```
3. Check AI provider configuration
4. Verify MCP tools are registered correctly

### Network Issues

#### Issue: Cannot access application via ingress

**Symptoms:**
- Connection refused
- 404 errors

**Solution:**
1. Check ingress status:
   ```bash
   kubectl get ingress -n evolve-todo
   ```
2. Verify ingress controller is running:
   ```bash
   kubectl get pods -n ingress-nginx
   ```
3. Check ingress rules:
   ```bash
   kubectl describe ingress -n evolve-todo
   ```
4. Ensure `/etc/hosts` is configured:
   ```bash
   cat /etc/hosts | grep evolve-todo
   ```
5. Verify minikube tunnel is running

#### Issue: Service not accessible

**Symptoms:**
- Connection timeout
- Service unreachable

**Solution:**
1. Check service endpoints:
   ```bash
   kubectl get endpoints -n evolve-todo
   ```
2. Verify pods are running and ready:
   ```bash
   kubectl get pods -n evolve-todo
   ```
3. Check service selector matches pod labels:
   ```bash
   kubectl describe service -n evolve-todo backend
   ```

### Database Issues

#### Issue: Database connection failed

**Symptoms:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution:**
1. Verify database URL in secrets:
   ```bash
   kubectl get secret -n evolve-todo backend-secrets -o jsonpath='{.data.database-url}' | base64 -d
   ```
2. Check if database pod/service is running (if using in-cluster database)
3. Verify network connectivity to database
4. Check database credentials

#### Issue: Database migrations not applied

**Symptoms:**
- Table doesn't exist errors
- Schema mismatch errors

**Solution:**
1. Run migrations manually:
   ```bash
   kubectl exec -it -n evolve-todo deployment/evolve-todo-backend -- alembic upgrade head
   ```
2. Check migration status:
   ```bash
   kubectl exec -it -n evolve-todo deployment/evolve-todo-backend -- alembic current
   ```

### Performance Issues

#### Issue: Slow response times

**Symptoms:**
- High latency
- Timeouts

**Solution:**
1. Check resource usage:
   ```bash
   kubectl top pods -n evolve-todo
   kubectl top nodes
   ```
2. Increase resource limits:
   ```yaml
   resources:
     limits:
       cpu: 1000m
       memory: 1Gi
   ```
3. Scale up replicas:
   ```bash
   kubectl scale deployment backend -n evolve-todo --replicas=3
   ```
4. Check for bottlenecks in logs

#### Issue: High memory usage

**Symptoms:**
- OOMKilled pods
- Memory limit exceeded

**Solution:**
1. Check memory usage:
   ```bash
   kubectl top pods -n evolve-todo
   ```
2. Increase memory limits:
   ```yaml
   resources:
     limits:
       memory: 1Gi
   ```
3. Check for memory leaks in application logs
4. Review application code for optimization opportunities

## Debugging Commands

### Get detailed pod information
```bash
kubectl describe pod -n evolve-todo <pod-name>
```

### View pod logs
```bash
# Current logs
kubectl logs -n evolve-todo <pod-name>

# Previous container logs (after crash)
kubectl logs -n evolve-todo <pod-name> --previous

# Follow logs
kubectl logs -n evolve-todo <pod-name> -f

# Logs from all pods with label
kubectl logs -n evolve-todo -l app.kubernetes.io/component=backend --tail=100
```

### Execute commands in pod
```bash
kubectl exec -it -n evolve-todo <pod-name> -- /bin/bash
```

### Port forward for debugging
```bash
kubectl port-forward -n evolve-todo <pod-name> 8000:8000
```

### Check events
```bash
kubectl get events -n evolve-todo --sort-by='.lastTimestamp'
```

### View resource usage
```bash
kubectl top pods -n evolve-todo
kubectl top nodes
```

## Getting Help

If you're still experiencing issues:

1. Check the logs for error messages
2. Search GitHub issues: [github.com/yourusername/evolve-todo-app/issues](https://github.com/yourusername/evolve-todo-app/issues)
3. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Relevant logs and error messages
   - Environment details (OS, Kubernetes version, etc.)

## Additional Resources

- [Kubernetes Troubleshooting](https://kubernetes.io/docs/tasks/debug/)
- [Helm Troubleshooting](https://helm.sh/docs/faq/troubleshooting/)
- [Docker Troubleshooting](https://docs.docker.com/config/daemon/troubleshoot/)
- [Minikube Troubleshooting](https://minikube.sigs.k8s.io/docs/handbook/troubleshooting/)
