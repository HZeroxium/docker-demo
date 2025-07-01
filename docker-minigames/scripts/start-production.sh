#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Docker Quiz Game (Production)${NC}"
echo -e "${BLUE}📍 Environment: Cloud Production${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
  echo -e "${BLUE}⚙️ Setting up production environment...${NC}"
  cp .env.cloud .env
fi

# Pre-start checks
echo -e "${BLUE}🔍 Running pre-start checks...${NC}"

# Check Docker
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running${NC}"
  exit 1
fi

# Start services
echo -e "${BLUE}🏗️ Starting services with cloud profile...${NC}"
docker-compose --profile cloud up -d

# Wait for services
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health check
echo -e "${BLUE}🏥 Performing health checks...${NC}"
if curl -f http://localhost:3000/health >/dev/null 2>&1 && curl -f http://localhost:8000/health >/dev/null 2>&1; then
  echo -e "${GREEN}✅ All services are healthy${NC}"
else
  echo -e "${RED}⚠️ Some services may not be ready yet${NC}"
fi

# Display status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose ps

echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo -e "${GREEN}🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):3000${NC}"
echo -e "${GREEN}🔧 Backend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):8000${NC}"
