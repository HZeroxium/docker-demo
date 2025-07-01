#!/bin/bash
# Start with Cloud MongoDB using pre-built images

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}☁️ Starting Docker Quiz Game with Cloud MongoDB (Pre-built Images)${NC}"
echo -e "${BLUE}📍 Environment: Cloud Production${NC}"

# Check if deployment compose file exists
if [ ! -f "docker-compose.deploy.yml" ]; then
  echo -e "${RED}❌ docker-compose.deploy.yml not found${NC}"
  echo -e "${YELLOW}Please ensure you have the deployment compose file${NC}"
  exit 1
fi

# Copy cloud environment file
echo -e "${BLUE}⚙️ Setting up environment...${NC}"
cp .env.cloud .env

# Check if images are available
echo -e "${BLUE}🔍 Checking for required Docker images...${NC}"

# You can uncomment these lines if you want to pull images first
# docker-compose -f docker-compose.deploy.yml pull

# Start services using deployment configuration
echo -e "${BLUE}🚀 Starting services with pre-built images...${NC}"
docker-compose -f docker-compose.deploy.yml --profile cloud up -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 30

# Health check
echo -e "${BLUE}🏥 Performing health checks...${NC}"
if curl -f http://localhost:3000/health >/dev/null 2>&1 && curl -f http://localhost:8000/health >/dev/null 2>&1; then
  echo -e "${GREEN}✅ All services are healthy${NC}"
else
  echo -e "${YELLOW}⚠️ Some services may not be ready yet${NC}"
  echo -e "${BLUE}Check logs with: docker-compose -f docker-compose.deploy.yml logs${NC}"
fi

# Display status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f docker-compose.deploy.yml ps

echo -e "${GREEN}✅ Application started with cloud MongoDB${NC}"
echo -e "${GREEN}🌐 Frontend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):3000${NC}"
echo -e "${GREEN}🔧 Backend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):8000${NC}"
echo -e "${GREEN}☁️ MongoDB: Cloud hosted${NC}"
echo -e "${GREEN}☁️ Redis: Cloud hosted${NC}"

echo -e "${BLUE}📋 Management Commands:${NC}"
echo -e "  View logs: docker-compose -f docker-compose.deploy.yml logs -f"
echo -e "  Stop services: docker-compose -f docker-compose.deploy.yml down"
echo -e "  Restart: docker-compose -f docker-compose.deploy.yml restart"
