#!/bin/bash

# Docker Quiz Game - Stop Deployment Script
# This script stops the running application containers

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${BLUE}🔵 $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

# Configuration
COMPOSE_FILE="docker-compose.deploy.yml"
PROJECT_NAME="docker-quiz-game"

log_info "🛑 Docker Quiz Game - Stop Deployment"
log_info "=================================="

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  log_error "docker-compose.deploy.yml not found!"
  log_info "Please ensure you have the deployment compose file in the current directory."
  exit 1
fi

# Check if Docker is running
if ! docker version >/dev/null 2>&1; then
  log_error "Docker is not running or not installed"
  exit 1
fi

log_success "Docker is running"

# Check if Docker Compose is available
if ! docker-compose --version >/dev/null 2>&1; then
  log_error "Docker Compose is not installed"
  exit 1
fi

log_success "Docker Compose is available"

# Display current running containers
log_info "📋 Current running containers:"
docker-compose -f "$COMPOSE_FILE" --profile cloud ps || true

# Stop and remove containers
log_info "🛑 Stopping application containers..."
if docker-compose -f "$COMPOSE_FILE" --profile cloud down; then
  log_success "Application stopped successfully"
else
  log_error "Failed to stop application"
  exit 1
fi

# Optional: Remove unused images (uncomment if needed)
# log_info "🧹 Cleaning up unused images..."
# docker image prune -f

# Optional: Remove unused volumes (uncomment if needed)
# log_info "🧹 Cleaning up unused volumes..."
# docker volume prune -f

log_success "🎉 Stop deployment completed successfully!"
echo
log_info "💡 To redeploy: ./deploy-cloud.sh"
log_info "💡 To view all containers: docker ps -a"
log_info "💡 To remove everything: docker-compose -f $COMPOSE_FILE --profile cloud down --volumes --rmi all"
