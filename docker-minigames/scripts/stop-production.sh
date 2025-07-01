#!/bin/bash

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping Docker Quiz Game (Production)${NC}"

# Check if services are running
if ! docker-compose ps -q 2>/dev/null | grep -q .; then
  echo -e "${YELLOW}⚠️ No services are currently running${NC}"
  exit 0
fi

# Display current status
echo -e "${BLUE}📊 Current service status:${NC}"
docker-compose ps

# Graceful shutdown
echo -e "${BLUE}🔄 Performing graceful shutdown...${NC}"
docker-compose down --timeout 30

# Verify shutdown
if docker-compose ps -q 2>/dev/null | grep -q .; then
  echo -e "${RED}⚠️ Some services are still running. Forcing shutdown...${NC}"
  docker-compose down --timeout 10 -v
else
  echo -e "${GREEN}✅ All services stopped successfully${NC}"
fi

# Display final status
echo -e "${BLUE}📊 Final status:${NC}"
docker-compose ps

echo -e "${GREEN}🎉 Application stopped successfully!${NC}"
