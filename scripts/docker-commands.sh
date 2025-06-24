#!/bin/bash

# Docker Portfolio Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build and scan image
build_and_scan() {
    print_status "🏗️  Building Docker image..."
    docker build -t portfolio:latest .
    
    print_status "🔍 Scanning image with Trivy..."
    if command -v trivy &> /dev/null; then
        trivy image portfolio:latest
    else
        print_warning "Trivy not installed. Installing..."
        # Install trivy (Ubuntu/Debian)
        sudo apt-get update
        sudo apt-get install wget apt-transport-https gnupg lsb-release
        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
        sudo apt-get update
        sudo apt-get install trivy
        trivy image portfolio:latest
    fi
}

# Run containers with proper setup
run_containers() {
    print_status "🚀 Starting containers..."
    
    # Create network if not exists
    docker network create portfolio_network 2>/dev/null || true
    
    # Start PostgreSQL with volume
    print_status "📊 Starting PostgreSQL..."
    docker run -d \
        --name portfolio_postgres \
        --network portfolio_network \
        -e POSTGRES_DB=portfolio \
        -e POSTGRES_USER=portfolio_user \
        -e POSTGRES_PASSWORD=portfolio_password \
        -v postgres_data:/var/lib/postgresql/data \
        -v $(pwd)/scripts:/docker-entrypoint-initdb.d:ro \
        -p 5432:5432 \
        postgres:15-alpine
    
    # Wait for database
    print_status "⏳ Waiting for database..."
    sleep 10
    
    # Start application
    print_status "🌐 Starting application..."
    docker run -d \
        --name portfolio_app \
        --network portfolio_network \
        -e DATABASE_URL=postgresql://portfolio_user:portfolio_password@portfolio_postgres:5432/portfolio \
        -e NODE_ENV=production \
        -v app_logs:/app/logs \
        -p 3000:3000 \
        portfolio:latest
    
    print_status "✅ Containers started successfully!"
    print_status "🌐 Application: http://localhost:3000"
    print_status "📊 Database: localhost:5432"
}

# Stop containers and preserve data
stop_containers() {
    print_status "🛑 Stopping containers..."
    docker stop portfolio_app portfolio_postgres 2>/dev/null || true
    docker rm portfolio_app portfolio_postgres 2>/dev/null || true
    print_status "✅ Containers stopped"
}

# Debug commands
debug_containers() {
    print_status "🔍 Container debugging information:"
    
    echo -e "\n${BLUE}=== Docker PS ===${NC}"
    docker ps -a
    
    echo -e "\n${BLUE}=== App Container Logs ===${NC}"
    docker logs portfolio_app --tail 50 2>/dev/null || print_warning "App container not running"
    
    echo -e "\n${BLUE}=== Database Container Logs ===${NC}"
    docker logs portfolio_postgres --tail 20 2>/dev/null || print_warning "Database container not running"
    
    echo -e "\n${BLUE}=== Container Inspect (App) ===${NC}"
    docker inspect portfolio_app 2>/dev/null || print_warning "App container not found"
    
    echo -e "\n${BLUE}=== Network Information ===${NC}"
    docker network ls
    docker network inspect portfolio_network 2>/dev/null || print_warning "Network not found"
    
    echo -e "\n${BLUE}=== Volume Information ===${NC}"
    docker volume ls
    
    echo -e "\n${BLUE}=== System Information ===${NC}"
    docker system df
}

# Execute commands in containers
exec_container() {
    local container=$1
    local command=${2:-"/bin/sh"}
    
    print_status "🔧 Executing command in $container..."
    docker exec -it $container $command
}

# Export/Import data
export_data() {
    print_status "📤 Exporting database data..."
    docker exec portfolio_postgres pg_dump -U portfolio_user portfolio > backup_$(date +%Y%m%d_%H%M%S).sql
    print_status "✅ Data exported successfully"
}

# Main menu
case "$1" in
    "build")
        build_and_scan
        ;;
    "start")
        run_containers
        ;;
    "stop")
        stop_containers
        ;;
    "debug")
        debug_containers
        ;;
    "exec")
        exec_container $2 $3
        ;;
    "export")
        export_data
        ;;
    "logs")
        docker logs -f ${2:-portfolio_app}
        ;;
    *)
        echo "Usage: $0 {build|start|stop|debug|exec|export|logs}"
        echo ""
        echo "Commands:"
        echo "  build   - Build and scan Docker image"
        echo "  start   - Start all containers"
        echo "  stop    - Stop all containers"
        echo "  debug   - Show debugging information"
        echo "  exec    - Execute command in container"
        echo "  export  - Export database data"
        echo "  logs    - Show container logs"
        exit 1
        ;;
esac
