#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏥 Docker Quiz Game Health Check${NC}"
echo "========================================"

# Check Docker daemon
echo -e "\n${BLUE}🐳 Docker Daemon${NC}"
if docker info >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Docker daemon is running${NC}"
else
  echo -e "${RED}❌ Docker daemon is not running${NC}"
  exit 1
fi

# Check Docker Compose
echo -e "\n${BLUE}🐙 Docker Compose Services${NC}"
if docker-compose ps -q 2>/dev/null | grep -q .; then
  docker-compose ps
  echo -e "${GREEN}✅ Services are running${NC}"
else
  echo -e "${RED}❌ No services are running${NC}"
  exit 1
fi

# Check service health endpoints
echo -e "\n${BLUE}🌐 Service Health Endpoints${NC}"

# Frontend health check
echo -n "Frontend (http://localhost:3000/health): "
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")
if [ "$frontend_status" = "200" ]; then
  echo -e "${GREEN}✅ Healthy (HTTP $frontend_status)${NC}"
else
  echo -e "${RED}❌ Unhealthy (HTTP $frontend_status)${NC}"
fi

# Backend health check
echo -n "Backend (http://localhost:8000/health): "
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
if [ "$backend_status" = "200" ]; then
  echo -e "${GREEN}✅ Healthy (HTTP $backend_status)${NC}"
else
  echo -e "${RED}❌ Unhealthy (HTTP $backend_status)${NC}"
fi

# Check system resources
echo -e "\n${BLUE}💻 System Resources${NC}"
echo -n "Disk Usage: "
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
  echo -e "${GREEN}✅ $disk_usage% used${NC}"
elif [ "$disk_usage" -lt 90 ]; then
  echo -e "${YELLOW}⚠️ $disk_usage% used${NC}"
else
  echo -e "${RED}❌ $disk_usage% used (Critical)${NC}"
fi

echo -n "Memory Usage: "
memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$memory_usage" -lt 80 ]; then
  echo -e "${GREEN}✅ $memory_usage% used${NC}"
elif [ "$memory_usage" -lt 90 ]; then
  echo -e "${YELLOW}⚠️ $memory_usage% used${NC}"
else
  echo -e "${RED}❌ $memory_usage% used (Critical)${NC}"
fi

# Check Docker stats
echo -e "\n${BLUE}🐳 Container Resource Usage${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Overall status
echo -e "\n${BLUE}📊 Overall Status${NC}"
if [ "$frontend_status" = "200" ] && [ "$backend_status" = "200" ] && [ "$disk_usage" -lt 90 ] && [ "$memory_usage" -lt 90 ]; then
  echo -e "${GREEN}🎉 All systems are healthy!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️ Some issues detected. Please review the checks above.${NC}"
  exit 1
fi
