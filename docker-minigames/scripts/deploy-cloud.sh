#!/bin/bash

# Docker Quiz Game - Cloud Deployment Script
# This script deploys the application on cloud servers

set -e

# Configuration
COMPOSE_FILE="docker-compose.deploy.yml"
ENV_FILE=".env"
PROFILE="cloud"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info() {
  echo -e "${BLUE}🔵 $1${NC}"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
}

warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

info "🚀 Docker Quiz Game - Cloud Deployment"
info "======================================"

# Check if required files exist
if [ ! -f "$COMPOSE_FILE" ]; then
  error "docker-compose.deploy.yml not found!"
  error "Please copy docker-compose.deploy.yml to this directory"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  error ".env file not found!"
  error "Please copy .env file to this directory"
  exit 1
fi

# Check if Docker is installed and running
if ! command -v docker &>/dev/null; then
  error "Docker is not installed!"
  exit 1
fi

if ! docker info &>/dev/null; then
  error "Docker is not running!"
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &>/dev/null; then
  error "Docker Compose is not installed!"
  exit 1
fi

success "Docker and Docker Compose are ready"

# Pull latest images
info "📥 Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" --profile "$PROFILE" pull

# Start services
info "🚀 Starting services..."
docker-compose -f "$COMPOSE_FILE" --profile "$PROFILE" up -d

# Wait for services to be healthy
info "🔍 Waiting for services to be healthy..."
sleep 10

# Check service status
info "📊 Service Status:"
docker-compose -f "$COMPOSE_FILE" --profile "$PROFILE" ps

# Test backend health
info "🔍 Testing backend health..."
BACKEND_PORT=$(grep "BACKEND_PORT" .env | cut -d'=' -f2 | head -n1)
BACKEND_PORT=${BACKEND_PORT:-8000}

if curl -f "http://localhost:$BACKEND_PORT/health" &>/dev/null; then
  success "Backend is healthy ✅"
else
  warning "Backend health check failed. It might still be starting..."
fi

# Test frontend health
info "🔍 Testing frontend health..."
FRONTEND_PORT=$(grep "FRONTEND_PORT" .env | cut -d'=' -f2 | head -n1)
FRONTEND_PORT=${FRONTEND_PORT:-3000}

if curl -f "http://localhost:$FRONTEND_PORT/health" &>/dev/null; then
  success "Frontend is healthy ✅"
else
  warning "Frontend health check failed. It might still be starting..."
fi

success "🎉 Deployment completed!"
info ""
info "📋 Access your application:"
info "  Frontend: http://localhost:$FRONTEND_PORT"
info "  Backend API: http://localhost:$BACKEND_PORT/docs"
info "  Backend Health: http://localhost:$BACKEND_PORT/health"
info ""
info "📊 Useful commands:"
info "  View logs: docker-compose -f $COMPOSE_FILE --profile $PROFILE logs -f"
info "  Stop services: docker-compose -f $COMPOSE_FILE --profile $PROFILE down"
info "  Restart services: docker-compose -f $COMPOSE_FILE --profile $PROFILE restart"
