#!/bin/bash

# Stop Local Development

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
CONTAINER_NAME="portfolio_local"

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_info "Stopping local development environment..."

# Stop and remove container
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
    print_success "Container stopped and removed"
else
    print_info "Container not running"
fi

print_success "Local development environment stopped"
