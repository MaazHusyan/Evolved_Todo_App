#!/bin/bash
# Quick start script for local development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=========================================="
echo "Evolve Todo - Quick Start"
echo "=========================================="

# Check if tools are installed
echo ""
echo "==> Checking prerequisites..."
MISSING_TOOLS=()

if ! command -v docker &> /dev/null; then
    MISSING_TOOLS+=("docker")
fi

if ! command -v kubectl &> /dev/null; then
    MISSING_TOOLS+=("kubectl")
fi

if ! command -v minikube &> /dev/null; then
    MISSING_TOOLS+=("minikube")
fi

if ! command -v helm &> /dev/null; then
    MISSING_TOOLS+=("helm")
fi

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    echo "Missing tools: ${MISSING_TOOLS[*]}"
    echo ""
    read -p "Install missing tools? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash "$PROJECT_ROOT/scripts/setup/install-tools.sh"
    else
        echo "Please install the missing tools and try again"
        exit 1
    fi
fi

echo "✓ All prerequisites met"

# Setup Minikube
echo ""
echo "==> Setting up Minikube cluster..."
bash "$PROJECT_ROOT/scripts/setup/setup-minikube.sh"

# Build Docker images
echo ""
echo "==> Building Docker images..."
bash "$PROJECT_ROOT/scripts/docker/build-all.sh"

# Deploy with Helm
echo ""
echo "==> Deploying application with Helm..."
bash "$PROJECT_ROOT/scripts/k8s/deploy-helm.sh"

echo ""
echo "=========================================="
echo "✓ Quick start complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Add to /etc/hosts: 127.0.0.1 evolve-todo.local"
echo "  2. Run: minikube tunnel (in a separate terminal)"
echo "  3. Visit: http://evolve-todo.local"
echo ""
echo "Or use port-forwarding:"
echo "  kubectl port-forward -n evolve-todo svc/evolve-todo-frontend 3000:3000"
echo "  kubectl port-forward -n evolve-todo svc/evolve-todo-backend 8000:8000"
echo ""
echo "Useful commands:"
echo "  View logs: bash scripts/k8s/logs.sh evolve-todo backend"
echo "  Cleanup: bash scripts/k8s/cleanup.sh"
echo "  Stop cluster: minikube stop"
