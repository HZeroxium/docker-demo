#!/bin/bash

set -e

# Configuration
LOG_FILE="/var/log/docker-quiz-deploy.log"
BACKUP_DIR="/home/quizapp/backups/$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
  exit 1
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Create log directory
sudo mkdir -p "$(dirname "$LOG_FILE")"
sudo chown quizapp:quizapp "$(dirname "$LOG_FILE")"

log "🚀 Starting Docker Quiz Game Production Deployment"
log "📍 Environment: Cloud Production"
log "📊 Profile: cloud"

# Pre-deployment checks
log "🔍 Running pre-deployment checks..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  error "Docker is not running. Please start Docker service."
fi

# Check if Docker Compose is available
if ! command -v docker-compose &>/dev/null; then
  error "Docker Compose is not installed."
fi

# Check if environment file exists
if [ ! -f ".env.cloud" ]; then
  error "Environment file .env.cloud not found."
fi

# Check if required ports are available
for port in 3000 8000; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    warning "Port $port is already in use. Existing services will be stopped."
  fi
done

success "Pre-deployment checks completed"

# Create backup directory
log "📦 Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup current environment file if exists
if [ -f ".env" ]; then
  log "💾 Backing up current environment file"
  cp .env "$BACKUP_DIR/.env.backup"
fi

# Stop existing services
if docker-compose ps -q 2>/dev/null | grep -q .; then
  log "🛑 Stopping existing services..."
  docker-compose down || warning "Failed to stop some services"
fi

# Copy production environment
log "⚙️ Setting up production environment"
cp .env.cloud .env
success "Environment configuration updated"

# Clean up old containers and images
log "🧹 Cleaning up old resources..."
docker system prune -f --volumes || warning "Failed to clean some resources"

# Pull latest images (if using external images)
log "📥 Pulling latest base images..."
docker-compose pull --quiet || warning "Failed to pull some images"

# Build and start services
log "🏗️ Building and starting services with cloud profile..."
if docker-compose --profile cloud up -d --build; then
  success "Services started successfully"
else
  error "Failed to start services"
fi

# Wait for services to be healthy
log "⏳ Waiting for services to be healthy..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  log "Health check attempt $attempt/$max_attempts"

  # Check if all services are running
  if docker-compose ps | grep -q "Up"; then
    # Check health endpoints
    frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
    backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "000")

    if [ "$frontend_health" = "200" ] && [ "$backend_health" = "200" ]; then
      success "All services are healthy"
      break
    fi
  fi

  if [ $attempt -eq $max_attempts ]; then
    warning "Services may not be fully healthy. Please check logs."
    break
  fi

  sleep 10
  ((attempt++))
done

# Display service status
log "📊 Current service status:"
docker-compose ps

# Display access information
log "🌐 Application Access Information:"
log "   Frontend: http://$(curl -s ifconfig.me):3000"
log "   Backend:  http://$(curl -s ifconfig.me):8000"
log "   Health Check: curl http://localhost:3000/health"

# Display resource usage
log "💻 Resource Usage:"
docker stats --no-stream

# Save deployment information
cat >"$BACKUP_DIR/deployment-info.txt" <<EOF
Deployment Date: $(date)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Not available")
Docker Version: $(docker --version)
Docker Compose Version: $(docker-compose --version)
Services: $(docker-compose ps --services | tr '\n' ' ')
EOF

success "🎉 Deployment completed successfully!"
success "📝 Logs saved to: $LOG_FILE"
success "💾 Backup created at: $BACKUP_DIR"

log "📋 Quick commands:"
log "   View logs: docker-compose logs -f"
log "   Stop services: ./scripts/stop-production.sh"
log "   Restart services: ./scripts/restart-production.sh"
log "   Check status: docker-compose ps"
