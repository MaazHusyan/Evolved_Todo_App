#!/bin/bash
# View logs from application pods

set -e

# Default values
NAMESPACE="${1:-evolve-todo}"
COMPONENT="${2:-backend}"
FOLLOW="${3:-false}"

if [[ "$COMPONENT" != "backend" && "$COMPONENT" != "frontend" ]]; then
    echo "Usage: $0 [namespace] [backend|frontend] [follow]"
    echo "  namespace - Kubernetes namespace (default: evolve-todo)"
    echo "  component - Application component (default: backend)"
    echo "  follow    - Follow logs (true/false, default: false)"
    exit 1
fi

echo "Fetching logs for $COMPONENT in namespace $NAMESPACE..."

# Get pod name
POD=$(kubectl get pods -n "$NAMESPACE" -l "app.kubernetes.io/component=$COMPONENT" -o jsonpath='{.items[0].metadata.name}')

if [[ -z "$POD" ]]; then
    echo "Error: No $COMPONENT pod found in namespace $NAMESPACE"
    exit 1
fi

echo "Pod: $POD"
echo ""

# Show logs
if [[ "$FOLLOW" == "true" ]]; then
    kubectl logs -n "$NAMESPACE" "$POD" -f
else
    kubectl logs -n "$NAMESPACE" "$POD" --tail=100
fi
