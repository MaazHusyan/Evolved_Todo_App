#!/bin/bash
# Build all Docker images for the Evolve Todo application

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Building Docker images for Evolve Todo..."
echo "Project root: $PROJECT_ROOT"

# Build backend image
echo ""
echo "==> Building backend image..."
cd "$PROJECT_ROOT/backend"
docker build -t evolve-todo-backend:latest .
echo "✓ Backend image built successfully"

# Build frontend image
echo ""
echo "==> Building frontend image..."
cd "$PROJECT_ROOT/frontend"
docker build -t evolve-todo-frontend:latest .
echo "✓ Frontend image built successfully"

# Display image sizes
echo ""
echo "==> Docker images:"
docker images | grep evolve-todo

echo ""
echo "✓ All images built successfully!"
