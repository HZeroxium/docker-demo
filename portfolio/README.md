## 🐳 Docker Commands

### Build và Scan Image
\`\`\`bash
# Build image với multistage
npm run docker:build

# Hoặc manual
docker build -t portfolio:latest .
trivy image portfolio:latest
\`\`\`

### Chạy Containers
\`\`\`bash

# Production
npm run docker:prod

# Manual start
npm run docker:start
\`\`\`

### Debug Containers
\`\`\`bash
# Xem logs
npm run docker:logs
docker logs portfolio_app
docker logs portfolio_postgres

# Debug info
npm run docker:debug

# Inspect container
docker inspect portfolio_app
docker ps -a

# Execute commands
docker exec -it portfolio_app /bin/sh
docker exec -it portfolio_postgres psql -U portfolio_user -d portfolio
\`\`\`

### Data Management
\`\`\`bash
# Stop containers (giữ data)
npm run docker:stop

# Export data
./scripts/docker-commands.sh export

# Clean up (xóa data)
npm run docker:clean
\`\`\`

### Volume Management
\`\`\`bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect postgres_data

# Backup volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
\`\`\`

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

### Container Health
\`\`\`bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
\`\`\`

## 🛠 Troubleshooting

### Common Issues
\`\`\`bash
# Port already in use
sudo lsof -i :3000
sudo lsof -i :5432

# Container won't start
docker logs portfolio_app
docker inspect portfolio_app

# Database connection issues
docker exec -it portfolio_postgres psql -U portfolio_user -d portfolio
\`\`\`

### Performance Monitoring
\`\`\`bash
# Container stats
docker stats

# System usage
docker system df
docker system prune
