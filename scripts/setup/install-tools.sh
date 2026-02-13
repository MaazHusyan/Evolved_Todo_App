#!/bin/bash
# Install required tools for local Kubernetes development

set -e

echo "Installing Kubernetes development tools..."

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "This script is designed for Linux. For other OS, please install manually:"
    echo "  - kubectl: https://kubernetes.io/docs/tasks/tools/"
    echo "  - minikube: https://minikube.sigs.k8s.io/docs/start/"
    echo "  - helm: https://helm.sh/docs/intro/install/"
    exit 1
fi

# Install kubectl
echo ""
echo "==> Installing kubectl..."
if command -v kubectl &> /dev/null; then
    echo "kubectl is already installed: $(kubectl version --client --short 2>/dev/null || kubectl version --client)"
else
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
    echo "✓ kubectl installed successfully"
fi

# Install minikube
echo ""
echo "==> Installing minikube..."
if command -v minikube &> /dev/null; then
    echo "minikube is already installed: $(minikube version --short)"
else
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    chmod +x minikube-linux-amd64
    sudo mv minikube-linux-amd64 /usr/local/bin/minikube
    echo "✓ minikube installed successfully"
fi

# Install helm
echo ""
echo "==> Installing helm..."
if command -v helm &> /dev/null; then
    echo "helm is already installed: $(helm version --short)"
else
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    echo "✓ helm installed successfully"
fi

echo ""
echo "==> Verifying installations..."
echo "kubectl: $(kubectl version --client --short 2>/dev/null || kubectl version --client)"
echo "minikube: $(minikube version --short)"
echo "helm: $(helm version --short)"

echo ""
echo "✓ All tools installed successfully!"
