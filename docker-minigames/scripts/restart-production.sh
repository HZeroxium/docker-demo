#!/bin/bash

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}🔄 Restarting Docker Quiz Game (Production)${NC}"

# Stop services
echo -e "${BLUE}🛑 Stopping services...${NC}"
./scripts/stop-production.sh

# Wait a moment
sleep 5

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
./scripts/start-production.sh

echo -e "${GREEN}🎉 Application restarted successfully!${NC}"
