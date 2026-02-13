#!/bin/bash
# Setup Minikube cluster for local development

set -e

echo "Setting up Minikube cluster..."

# Check if minikube is installed
if ! command -v minikube &> /dev/null; then
    echo "Error: minikube is not installed. Run scripts/setup/install-tools.sh first."
    exit 1
fi

# Check if cluster is already running
if minikube status &> /dev/null; then
    echo "Minikube cluster is already running"
    minikube status
else
    echo "Starting Minikube cluster..."
    minikube start --driver=docker --cpus=4 --memory=4096
    echo "✓ Minikube cluster started"
fi

# Enable required addons
echo ""
echo "==> Enabling Minikube addons..."
minikube addons enable ingress
minikube addons enable metrics-server
echo "✓ Addons enabled"

# Configure kubectl context
echo ""
echo "==> Configuring kubectl context..."
kubectl config use-context minikube
echo "✓ kubectl context set to minikube"

# Display cluster info
echo ""
echo "==> Cluster information:"
kubectl cluster-info
kubectl get nodes

echo ""
echo "✓ Minikube setup complete!"
echo ""
echo "To access the cluster:"
echo "  kubectl get pods -A"
echo ""
echo "To stop the cluster:"
echo "  minikube stop"
echo ""
echo "To delete the cluster:"
echo "  minikube delete"
