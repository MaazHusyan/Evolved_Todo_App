#!/bin/bash
# Cleanup Kubernetes resources

set -e

echo "Cleaning up Evolve Todo Kubernetes resources..."

# Ask for confirmation
read -p "This will delete all Evolve Todo resources. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Delete Helm releases
echo ""
echo "==> Checking for Helm releases..."
RELEASES=$(helm list -A -o json | jq -r '.[] | select(.name | contains("evolve-todo")) | "\(.name) \(.namespace)"')
if [[ -n "$RELEASES" ]]; then
    while IFS= read -r line; do
        RELEASE=$(echo "$line" | awk '{print $1}')
        NAMESPACE=$(echo "$line" | awk '{print $2}')
        echo "Deleting Helm release: $RELEASE in namespace $NAMESPACE"
        helm uninstall "$RELEASE" -n "$NAMESPACE"
    done <<< "$RELEASES"
else
    echo "No Helm releases found"
fi

# Delete Kustomize resources
echo ""
echo "==> Deleting Kustomize resources..."
for env in dev prod; do
    if kubectl get namespace "evolve-todo-$env" &> /dev/null; then
        echo "Deleting namespace: evolve-todo-$env"
        kubectl delete namespace "evolve-todo-$env" --timeout=60s
    fi
done

# Delete base namespace
if kubectl get namespace "evolve-todo" &> /dev/null; then
    echo "Deleting namespace: evolve-todo"
    kubectl delete namespace "evolve-todo" --timeout=60s
fi

echo ""
echo "✓ Cleanup complete!"
