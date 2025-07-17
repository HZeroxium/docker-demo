#!/bin/bash

# Start Cloud Deployment - Pull and Run from Docker Hub

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
IMAGE_NAME="portfolio-app"
CONTAINER_NAME="portfolio_cloud"
TAG="latest"
DOCKER_HUB_USER="hzeroxium"

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${BLUE}===== $1 =====${NC}"
}

# Stop existing container if running
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    print_info "Stopping existing container..."
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
fi

# Pull latest image from Docker Hub
print_header "Pulling Latest Image from Docker Hub"
docker pull "$DOCKER_HUB_USER/$IMAGE_NAME:$TAG"
print_success "Image pulled successfully"

# Run container
print_header "Starting Cloud Container"
docker run -d \
    --name "$CONTAINER_NAME" \
    -p 3000:3000 \
    -e NODE_ENV=production \
    --restart unless-stopped \
    "$DOCKER_HUB_USER/$IMAGE_NAME:$TAG"

print_success "Container started successfully"

# Wait for health check
print_info "Waiting for application to start..."
sleep 5

# Check if application is running
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Application is running at http://localhost:3000"
else
    print_info "Application may still be starting. Check logs: docker logs $CONTAINER_NAME"
fi

print_success "Cloud deployment ready!"
echo "Access: http://localhost:3000"
echo "Stop: ./scripts/stop-cloud.sh"
