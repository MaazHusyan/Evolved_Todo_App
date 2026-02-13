#!/bin/bash
# Comprehensive validation script for Kubernetes deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=========================================="
echo "Evolve Todo - Deployment Validation"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation results
PASSED=0
FAILED=0
WARNINGS=0

# Function to print status
print_status() {
    local status=$1
    local message=$2

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $message"
        ((PASSED++))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗${NC} $message"
        ((FAILED++))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
        ((WARNINGS++))
    else
        echo "  $message"
    fi
}

# Section header
section() {
    echo ""
    echo "==> $1"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Validation Steps

section "1. Prerequisites Check"

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    print_status "PASS" "Docker installed: $DOCKER_VERSION"

    # Check if Docker is running
    if docker ps &> /dev/null; then
        print_status "PASS" "Docker daemon is running"
    else
        print_status "FAIL" "Docker daemon is not running"
    fi
else
    print_status "FAIL" "Docker is not installed"
fi

# Check kubectl
if command_exists kubectl; then
    KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null || kubectl version --client 2>&1 | head -1)
    print_status "PASS" "kubectl installed: $KUBECTL_VERSION"
else
    print_status "FAIL" "kubectl is not installed"
fi

# Check minikube
if command_exists minikube; then
    MINIKUBE_VERSION=$(minikube version --short 2>/dev/null || minikube version | head -1)
    print_status "PASS" "minikube installed: $MINIKUBE_VERSION"
else
    print_status "FAIL" "minikube is not installed"
fi

# Check helm
if command_exists helm; then
    HELM_VERSION=$(helm version --short 2>/dev/null || helm version | head -1)
    print_status "PASS" "helm installed: $HELM_VERSION"
else
    print_status "FAIL" "helm is not installed"
fi

section "2. Docker Images Check"

# Check if backend image exists
if docker images | grep -q "evolve-todo-backend"; then
    BACKEND_SIZE=$(docker images evolve-todo-backend:latest --format "{{.Size}}")
    print_status "PASS" "Backend image exists: $BACKEND_SIZE"

    # Check size (should be < 300MB)
    SIZE_MB=$(docker images evolve-todo-backend:latest --format "{{.Size}}" | sed 's/MB//' | awk '{print int($1)}')
    if [ "$SIZE_MB" -lt 300 ]; then
        print_status "PASS" "Backend image size is optimal (< 300MB)"
    else
        print_status "WARN" "Backend image size is larger than target (300MB)"
    fi
else
    print_status "FAIL" "Backend image not found"
fi

# Check if frontend image exists
if docker images | grep -q "evolve-todo-frontend"; then
    FRONTEND_SIZE=$(docker images evolve-todo-frontend:latest --format "{{.Size}}")
    print_status "PASS" "Frontend image exists: $FRONTEND_SIZE"

    # Check size (should be < 250MB)
    SIZE_MB=$(docker images evolve-todo-frontend:latest --format "{{.Size}}" | sed 's/MB//' | awk '{print int($1)}')
    if [ "$SIZE_MB" -lt 250 ]; then
        print_status "PASS" "Frontend image size is optimal (< 250MB)"
    else
        print_status "WARN" "Frontend image size is larger than target (250MB)"
    fi
else
    print_status "FAIL" "Frontend image not found"
fi

section "3. Kubernetes Manifests Validation"

# Check if kubectl is available for validation
if command_exists kubectl; then
    # Validate base manifests
    if kubectl apply --dry-run=client -k "$PROJECT_ROOT/k8s/base" &> /dev/null; then
        print_status "PASS" "Base Kustomize manifests are valid"
    else
        print_status "FAIL" "Base Kustomize manifests have errors"
    fi

    # Validate dev overlay
    if kubectl apply --dry-run=client -k "$PROJECT_ROOT/k8s/overlays/dev" &> /dev/null; then
        print_status "PASS" "Dev overlay manifests are valid"
    else
        print_status "FAIL" "Dev overlay manifests have errors"
    fi

    # Validate prod overlay
    if kubectl apply --dry-run=client -k "$PROJECT_ROOT/k8s/overlays/prod" &> /dev/null; then
        print_status "FAIL" "Prod overlay manifests have errors"
    fi
else
    print_status "WARN" "kubectl not available - skipping manifest validation"
fi

section "4. Helm Chart Validation"

# Check if helm is available for validation
if command_exists helm; then
    # Lint Helm chart
    if helm lint "$PROJECT_ROOT/helm/evolve-todo" &> /dev/null; then
        print_status "PASS" "Helm chart passes linting"
    else
        print_status "FAIL" "Helm chart has linting errors"
        helm lint "$PROJECT_ROOT/helm/evolve-todo"
    fi

    # Template Helm chart
    if helm template evolve-todo "$PROJECT_ROOT/helm/evolve-todo" &> /dev/null; then
        print_status "PASS" "Helm chart templates successfully"
    else
        print_status "FAIL" "Helm chart has template errors"
    fi
else
    print_status "WARN" "helm not available - skipping chart validation"
fi

section "5. Scripts Check"

# Check if scripts exist and are executable
SCRIPTS=(
    "scripts/setup/install-tools.sh"
    "scripts/setup/setup-minikube.sh"
    "scripts/docker/build-all.sh"
    "scripts/k8s/deploy-helm.sh"
    "scripts/k8s/deploy-kustomize.sh"
    "scripts/k8s/logs.sh"
    "scripts/k8s/cleanup.sh"
    "scripts/dev/quick-start.sh"
)

for script in "${SCRIPTS[@]}"; do
    FULL_PATH="$PROJECT_ROOT/$script"
    if [ -f "$FULL_PATH" ]; then
        if [ -x "$FULL_PATH" ]; then
            print_status "PASS" "$script is executable"
        else
            print_status "WARN" "$script exists but is not executable"
        fi
    else
        print_status "FAIL" "$script not found"
    fi
done

section "6. Documentation Check"

# Check if documentation exists
DOCS=(
    "docs/deployment-guide.md"
    "docs/troubleshooting.md"
    "docs/kubernetes-overview.md"
    "docs/ai-tools/architecture.md"
    "docs/ai-tools/usage-guide.md"
    "docs/ai-tools/mcp-integration.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$PROJECT_ROOT/$doc" ]; then
        print_status "PASS" "$doc exists"
    else
        print_status "FAIL" "$doc not found"
    fi
done

section "7. Minikube Cluster Check"

if command_exists minikube; then
    # Check if minikube is running
    if minikube status &> /dev/null; then
        print_status "PASS" "Minikube cluster is running"

        # Check cluster info
        MINIKUBE_STATUS=$(minikube status --format='{{.Host}}')
        print_status "INFO" "Cluster status: $MINIKUBE_STATUS"

        # Check addons
        if minikube addons list | grep -q "ingress.*enabled"; then
            print_status "PASS" "Ingress addon is enabled"
        else
            print_status "WARN" "Ingress addon is not enabled"
        fi

        if minikube addons list | grep -q "metrics-server.*enabled"; then
            print_status "PASS" "Metrics-server addon is enabled"
        else
            print_status "WARN" "Metrics-server addon is not enabled"
        fi
    else
        print_status "WARN" "Minikube cluster is not running"
    fi
else
    print_status "WARN" "Minikube not installed - skipping cluster check"
fi

section "8. Deployment Check"

if command_exists kubectl; then
    # Check if kubectl can connect to cluster
    if kubectl cluster-info &> /dev/null; then
        print_status "PASS" "kubectl can connect to cluster"

        # Check for evolve-todo namespace
        if kubectl get namespace evolve-todo &> /dev/null; then
            print_status "PASS" "evolve-todo namespace exists"

            # Check deployments
            BACKEND_PODS=$(kubectl get pods -n evolve-todo -l app.kubernetes.io/component=backend --no-headers 2>/dev/null | wc -l)
            FRONTEND_PODS=$(kubectl get pods -n evolve-todo -l app.kubernetes.io/component=frontend --no-headers 2>/dev/null | wc -l)

            if [ "$BACKEND_PODS" -gt 0 ]; then
                print_status "PASS" "Backend pods are deployed ($BACKEND_PODS pods)"

                # Check if pods are running
                RUNNING_BACKEND=$(kubectl get pods -n evolve-todo -l app.kubernetes.io/component=backend --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
                if [ "$RUNNING_BACKEND" -eq "$BACKEND_PODS" ]; then
                    print_status "PASS" "All backend pods are running"
                else
                    print_status "WARN" "Some backend pods are not running ($RUNNING_BACKEND/$BACKEND_PODS)"
                fi
            else
                print_status "WARN" "No backend pods found"
            fi

            if [ "$FRONTEND_PODS" -gt 0 ]; then
                print_status "PASS" "Frontend pods are deployed ($FRONTEND_PODS pods)"

                # Check if pods are running
                RUNNING_FRONTEND=$(kubectl get pods -n evolve-todo -l app.kubernetes.io/component=frontend --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
                if [ "$RUNNING_FRONTEND" -eq "$FRONTEND_PODS" ]; then
                    print_status "PASS" "All frontend pods are running"
                else
                    print_status "WARN" "Some frontend pods are not running ($RUNNING_FRONTEND/$FRONTEND_PODS)"
                fi
            else
                print_status "WARN" "No frontend pods found"
            fi

            # Check services
            if kubectl get service -n evolve-todo evolve-todo-backend &> /dev/null; then
                print_status "PASS" "Backend service exists"
            else
                print_status "WARN" "Backend service not found"
            fi

            if kubectl get service -n evolve-todo evolve-todo-frontend &> /dev/null; then
                print_status "PASS" "Frontend service exists"
            else
                print_status "WARN" "Frontend service not found"
            fi

            # Check ingress
            if kubectl get ingress -n evolve-todo &> /dev/null; then
                print_status "PASS" "Ingress exists"
            else
                print_status "WARN" "Ingress not found"
            fi
        else
            print_status "WARN" "evolve-todo namespace not found - application not deployed"
        fi
    else
        print_status "WARN" "kubectl cannot connect to cluster"
    fi
else
    print_status "WARN" "kubectl not available - skipping deployment check"
fi

section "9. Health Check"

if command_exists kubectl && kubectl cluster-info &> /dev/null; then
    if kubectl get namespace evolve-todo &> /dev/null; then
        # Try to access backend health endpoint
        BACKEND_POD=$(kubectl get pods -n evolve-todo -l app.kubernetes.io/component=backend --field-selector=status.phase=Running -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

        if [ -n "$BACKEND_POD" ]; then
            if kubectl exec -n evolve-todo "$BACKEND_POD" -- curl -s http://localhost:8000/health/live &> /dev/null; then
                print_status "PASS" "Backend health check endpoint is responding"
            else
                print_status "WARN" "Backend health check endpoint is not responding"
            fi
        fi
    fi
fi

# Summary
section "Validation Summary"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo "Total checks: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the output above.${NC}"
    exit 1
fi
