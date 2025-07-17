#!/bin/bash

# Docker Commands Demo Script
# 10 Most Common Docker Commands for Portfolio App

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
IMAGE_NAME="portfolio-app"
CONTAINER_NAME="portfolio_container"
TAG="latest"
DOCKER_HUB_USER="hzeroxium"

print_header() {
    echo -e "${BLUE}===== $1 =====${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Build Docker Image
build_image() {
    print_header "1. Building Docker Image"
    cd "$(dirname "$0")/.."
    docker build -t "$IMAGE_NAME:$TAG" .
    print_success "Image built: $IMAGE_NAME:$TAG"
}

# 2. List Docker Images
list_images() {
    print_header "2. Listing Docker Images"
    docker images
}

# 3. Run Container
run_container() {
    print_header "3. Running Container"
    docker run -d --name "$CONTAINER_NAME" -p 3000:3000 "$IMAGE_NAME:$TAG"
    print_success "Container started: $CONTAINER_NAME"
}

# 4. List Running Containers
list_containers() {
    print_header "4. Listing Running Containers"
    docker ps
}

# 5. Stop Container
stop_container() {
    print_header "5. Stopping Container"
    docker stop "$CONTAINER_NAME" || true
    print_success "Container stopped: $CONTAINER_NAME"
}

# 6. Remove Container
remove_container() {
    print_header "6. Removing Container"
    docker rm "$CONTAINER_NAME" || true
    print_success "Container removed: $CONTAINER_NAME"
}

# 7. View Container Logs
view_logs() {
    print_header "7. Viewing Container Logs"
    docker logs "$CONTAINER_NAME" || print_info "Container not found"
}

# 8. Execute Command in Container
exec_container() {
    print_header "8. Executing Command in Container"
    docker exec -it "$CONTAINER_NAME" /bin/sh || print_info "Container not running"
}

# 9. Tag and Push Image
push_image() {
    print_header "9. Tagging and Pushing Image"
    docker tag "$IMAGE_NAME:$TAG" "$DOCKER_HUB_USER/$IMAGE_NAME:$TAG"
    docker push "$DOCKER_HUB_USER/$IMAGE_NAME:$TAG"
    print_success "Image pushed to Docker Hub"
}

# 10. Clean Up System
cleanup_system() {
    print_header "10. Cleaning Up Docker System"
    docker system prune -f
    print_success "System cleaned up"
}

# Main Menu
main_menu() {
    while true; do
        echo ""
        print_header "Docker Commands Demo - Portfolio App"
        echo "1. Build Docker Image"
        echo "2. List Docker Images"
        echo "3. Run Container"
        echo "4. List Running Containers"
        echo "5. Stop Container"
        echo "6. Remove Container"
        echo "7. View Container Logs"
        echo "8. Execute Command in Container"
        echo "9. Tag and Push Image"
        echo "10. Clean Up System"
        echo "11. Exit"
        echo ""
        
        read -p "Choose an option (1-11): " choice
        
        case $choice in
            1) build_image ;;
            2) list_images ;;
            3) run_container ;;
            4) list_containers ;;
            5) stop_container ;;
            6) remove_container ;;
            7) view_logs ;;
            8) exec_container ;;
            9) push_image ;;
            10) cleanup_system ;;
            11) exit 0 ;;
            *) print_info "Invalid choice. Please try again." ;;
        esac
    done
}

# Run main menu
main_menu
