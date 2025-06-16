.PHONY: help local cloud dev stop clean logs

# Default target
help:
	@echo "Docker Quiz Game - Deployment Commands"
	@echo "======================================"
	@echo "make local    - Start with local MongoDB container"
	@echo "make cloud    - Start with cloud MongoDB (no container)"
	@echo "make dev      - Start development environment"
	@echo "make stop     - Stop all services"
	@echo "make clean    - Stop and remove all containers/volumes"
	@echo "make logs     - View application logs"
	@echo "make status   - Show service status"

# Start with local MongoDB container
local:
	@echo "🚀 Starting with Local MongoDB..."
	@cp .env.local .env
	@docker-compose --profile local up --build -d
	@echo "✅ Services started with local MongoDB"
	@echo "🌐 Access: http://localhost:3000"

# Start with cloud MongoDB
cloud:
	@echo "☁️ Starting with Cloud MongoDB..."
	@cp .env.cloud .env
	@docker-compose --profile cloud up --build -d
	@echo "✅ Services started with cloud MongoDB"
	@echo "🌐 Access: http://localhost:3000"

# Start development environment
dev:
	@echo "🔧 Starting Development Environment..."
	@cp .env.dev .env
	@docker-compose --profile local-dev up --build -d
	@echo "✅ Development environment started"
	@echo "🌐 Access: http://localhost:3000"

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	@docker-compose down
	@echo "✅ All services stopped"

# Clean up everything
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f
	@echo "✅ Cleanup completed"

# View logs
logs:
	@docker-compose logs -f

# Show service status
status:
	@docker-compose ps
	@echo ""
	@docker-compose top
