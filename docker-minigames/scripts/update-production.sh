#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKUP_DIR="/home/quizapp/backups/update-$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}🔄 Updating Docker Quiz Game (Production)${NC}"

# Create backup
echo -e "${BLUE}💾 Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp .env "$BACKUP_DIR/.env.backup" 2>/dev/null || true
docker-compose config >"$BACKUP_DIR/docker-compose.backup.yml"

# Pull latest code (if using git)
if [ -d ".git" ]; then
  echo -e "${BLUE}📥 Pulling latest code...${NC}"
  git stash
  git pull origin main || git pull origin master
  git stash pop || true
fi

# Update Docker images
echo -e "${BLUE}📥 Pulling latest base images...${NC}"
docker-compose pull

# Rebuild and restart with zero downtime
echo -e "${BLUE}🏗️ Rebuilding services...${NC}"
docker-compose --profile cloud up -d --build --force-recreate

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health check
if curl -f http://localhost:3000/health >/dev/null 2>&1 && curl -f http://localhost:8000/health >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Update completed successfully!${NC}"

  # Clean up old images
  echo -e "${BLUE}🧹 Cleaning up old images...${NC}"
  docker image prune -f

  echo -e "${GREEN}🎉 Application updated and running!${NC}"
  echo -e "${GREEN}💾 Backup saved to: $BACKUP_DIR${NC}"
else
  echo -e "${RED}❌ Update failed! Rolling back...${NC}"
  docker-compose down
  echo -e "${YELLOW}Manual intervention required${NC}"
  exit 1
fi
