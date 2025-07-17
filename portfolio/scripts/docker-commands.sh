#!/bin/bash

# Docker Commands Reference Guide
# Top 20 Most Common Docker Commands - Information Display Only

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===============================================${NC}"
}

print_command() {
    echo -e "${GREEN}Command: ${CYAN}$1${NC}"
}

print_description() {
    echo -e "${YELLOW}Description: ${NC}$1"
}

print_flags() {
    echo -e "${PURPLE}Common Flags:${NC}"
    echo -e "$1"
}

print_examples() {
    echo -e "${CYAN}Examples:${NC}"
    echo -e "$1"
}

print_separator() {
    echo -e "${BLUE}-----------------------------------------------${NC}"
}

# 1. docker build
show_build() {
    print_header "1. Docker Build"
    print_command "docker build [OPTIONS] PATH | URL | -"
    print_description "Build an image from a Dockerfile"
    print_flags "  -t, --tag      Name and optionally a tag (name:tag)
  -f, --file     Name of the Dockerfile (default: PATH/Dockerfile)
  --no-cache     Do not use cache when building the image
  --pull         Always attempt to pull a newer version of the image
  --build-arg    Set build-time variables
  --target       Set the target build stage to build
  --platform     Set platform if server is multi-platform capable"
    print_examples "  docker build -t myapp:latest .
  docker build -t myapp:v1.0 -f Dockerfile.prod .
  docker build --no-cache -t myapp .
  docker build --build-arg NODE_ENV=production -t myapp ."
    print_separator
}

# 2. docker run
show_run() {
    print_header "2. Docker Run"
    print_command "docker run [OPTIONS] IMAGE [COMMAND] [ARG...]"
    print_description "Run a command in a new container"
    print_flags "  -d, --detach     Run container in background and print container ID
  -p, --publish    Publish a container's port(s) to the host
  -e, --env        Set environment variables
  -v, --volume     Bind mount a volume
  --name           Assign a name to the container
  -it              Interactive mode with TTY
  --rm             Automatically remove the container when it exits
  --restart        Restart policy (no, on-failure, always, unless-stopped)
  --network        Connect to a network
  --user           Username or UID"
    print_examples "  docker run -d -p 3000:3000 --name myapp portfolio-app
  docker run -it --rm ubuntu:latest /bin/bash
  docker run -e NODE_ENV=production -v /host:/container myapp
  docker run --restart unless-stopped -d nginx"
    print_separator
}

# 3. docker ps
show_ps() {
    print_header "3. Docker PS"
    print_command "docker ps [OPTIONS]"
    print_description "List containers"
    print_flags "  -a, --all        Show all containers (default shows just running)
  -q, --quiet      Only display container IDs
  -f, --filter     Filter output based on conditions
  --format         Pretty-print containers using a Go template
  -l, --latest     Show the latest created container
  -n, --last       Show n last created containers
  -s, --size       Display total file sizes"
    print_examples "  docker ps
  docker ps -a
  docker ps -q
  docker ps --filter 'status=running'
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
    print_separator
}

# 4. docker images
show_images() {
    print_header "4. Docker Images"
    print_command "docker images [OPTIONS] [REPOSITORY[:TAG]]"
    print_description "List images"
    print_flags "  -a, --all        Show all images (default hides intermediate images)
  -q, --quiet      Only show image IDs
  -f, --filter     Filter output based on conditions
  --format         Pretty-print images using a Go template
  --no-trunc       Don't truncate output
  --digests        Show digests"
    print_examples "  docker images
  docker images -a
  docker images -q
  docker images --filter 'dangling=true'
  docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'"
    print_separator
}

# 5. docker stop
show_stop() {
    print_header "5. Docker Stop"
    print_command "docker stop [OPTIONS] CONTAINER [CONTAINER...]"
    print_description "Stop one or more running containers"
    print_flags "  -t, --time       Seconds to wait for stop before killing (default 10)"
    print_examples "  docker stop myapp
  docker stop container1 container2
  docker stop -t 30 myapp
  docker stop \$(docker ps -q)"
    print_separator
}

# 6. docker rm
show_rm() {
    print_header "6. Docker Remove Container"
    print_command "docker rm [OPTIONS] CONTAINER [CONTAINER...]"
    print_description "Remove one or more containers"
    print_flags "  -f, --force      Force the removal of a running container
  -v, --volumes    Remove associated volumes
  -l, --link       Remove the specified link"
    print_examples "  docker rm myapp
  docker rm -f myapp
  docker rm -v myapp
  docker rm \$(docker ps -aq)"
    print_separator
}

# 7. docker rmi
show_rmi() {
    print_header "7. Docker Remove Image"
    print_command "docker rmi [OPTIONS] IMAGE [IMAGE...]"
    print_description "Remove one or more images"
    print_flags "  -f, --force      Force removal of the image
  --no-prune       Do not delete untagged parents"
    print_examples "  docker rmi myapp:latest
  docker rmi -f myapp:latest
  docker rmi \$(docker images -q)
  docker rmi \$(docker images -f 'dangling=true' -q)"
    print_separator
}

# 8. docker logs
show_logs() {
    print_header "8. Docker Logs"
    print_command "docker logs [OPTIONS] CONTAINER"
    print_description "Fetch the logs of a container"
    print_flags "  -f, --follow     Follow log output
  -t, --timestamps Show timestamps
  --tail           Number of lines to show from the end of the logs
  --since          Show logs since timestamp
  --until          Show logs before a timestamp"
    print_examples "  docker logs myapp
  docker logs -f myapp
  docker logs --tail 50 myapp
  docker logs --since 2023-01-01T00:00:00 myapp"
    print_separator
}

# 9. docker exec
show_exec() {
    print_header "9. Docker Exec"
    print_command "docker exec [OPTIONS] CONTAINER COMMAND [ARG...]"
    print_description "Run a command in a running container"
    print_flags "  -i, --interactive Keep STDIN open even if not attached
  -t, --tty        Allocate a pseudo-TTY
  -d, --detach     Run command in background
  -e, --env        Set environment variables
  -w, --workdir    Working directory inside the container
  -u, --user       Username or UID"
    print_examples "  docker exec -it myapp /bin/bash
  docker exec -it myapp /bin/sh
  docker exec myapp ls -la
  docker exec -e NODE_ENV=production myapp npm start"
    print_separator
}

# 10. docker pull
show_pull() {
    print_header "10. Docker Pull"
    print_command "docker pull [OPTIONS] NAME[:TAG|@DIGEST]"
    print_description "Pull an image or a repository from a registry"
    print_flags "  -a, --all-tags   Download all tagged images in the repository
  --platform       Set platform if server is multi-platform capable
  -q, --quiet      Suppress verbose output"
    print_examples "  docker pull ubuntu:latest
  docker pull nginx:alpine
  docker pull -a ubuntu
  docker pull --platform linux/amd64 ubuntu:latest"
    print_separator
}

# 11. docker push
show_push() {
    print_header "11. Docker Push"
    print_command "docker push [OPTIONS] NAME[:TAG]"
    print_description "Push an image or a repository to a registry"
    print_flags "  -a, --all-tags   Push all tagged images in the repository
  --disable-content-trust Skip image signing (default true)
  -q, --quiet      Suppress verbose output"
    print_examples "  docker push myusername/myapp:latest
  docker push myusername/myapp:v1.0
  docker push -a myusername/myapp"
    print_separator
}

# 12. docker tag
show_tag() {
    print_header "12. Docker Tag"
    print_command "docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]"
    print_description "Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE"
    print_flags "  No specific flags - uses image names and tags"
    print_examples "  docker tag myapp:latest myusername/myapp:latest
  docker tag myapp:latest myapp:v1.0
  docker tag ubuntu:latest myregistry.com/ubuntu:latest"
    print_separator
}

# 13. docker inspect
show_inspect() {
    print_header "13. Docker Inspect"
    print_command "docker inspect [OPTIONS] NAME|ID [NAME|ID...]"
    print_description "Return low-level information on Docker objects"
    print_flags "  -f, --format     Format the output using a Go template
  -s, --size       Display total file sizes if the type is container
  --type           Return JSON for specified type"
    print_examples "  docker inspect myapp
  docker inspect -f '{{.State.Status}}' myapp
  docker inspect --format='{{.NetworkSettings.IPAddress}}' myapp"
    print_separator
}

# 14. docker compose
show_compose() {
    print_header "14. Docker Compose"
    print_command "docker compose [OPTIONS] COMMAND"
    print_description "Define and run multi-container Docker applications"
    print_flags "  up               Create and start containers
  down             Stop and remove containers
  build            Build or rebuild services
  logs             View output from containers
  ps               List containers
  exec             Execute a command in a running container
  restart          Restart services
  stop             Stop services
  start            Start services"
    print_examples "  docker compose up -d
  docker compose down
  docker compose build
  docker compose logs -f
  docker compose exec web bash"
    print_separator
}

# 15. docker network
show_network() {
    print_header "15. Docker Network"
    print_command "docker network COMMAND"
    print_description "Manage networks"
    print_flags "  create           Create a network
  ls               List networks
  rm               Remove one or more networks
  inspect          Display detailed information on one or more networks
  connect          Connect a container to a network
  disconnect       Disconnect a container from a network
  prune            Remove all unused networks"
    print_examples "  docker network create mynetwork
  docker network ls
  docker network inspect bridge
  docker network connect mynetwork mycontainer"
    print_separator
}

# 16. docker volume
show_volume() {
    print_header "16. Docker Volume"
    print_command "docker volume COMMAND"
    print_description "Manage volumes"
    print_flags "  create           Create a volume
  ls               List volumes
  rm               Remove one or more volumes
  inspect          Display detailed information on one or more volumes
  prune            Remove all unused local volumes"
    print_examples "  docker volume create myvolume
  docker volume ls
  docker volume inspect myvolume
  docker volume prune"
    print_separator
}

# 17. docker system
show_system() {
    print_header "17. Docker System"
    print_command "docker system COMMAND"
    print_description "Manage Docker"
    print_flags "  df               Show docker disk usage
  info             Display system-wide information
  prune            Remove unused data
  events           Get real time events from the server"
    print_examples "  docker system df
  docker system info
  docker system prune -a
  docker system events"
    print_separator
}

# 18. docker stats
show_stats() {
    print_header "18. Docker Stats"
    print_command "docker stats [OPTIONS] [CONTAINER...]"
    print_description "Display a live stream of container(s) resource usage statistics"
    print_flags "  -a, --all        Show all containers (default shows just running)
  --no-stream      Disable streaming stats and only pull the first result
  --no-trunc       Do not truncate output
  --format         Pretty-print stats using a Go template"
    print_examples "  docker stats
  docker stats myapp
  docker stats --no-stream
  docker stats --format 'table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}'"
    print_separator
}

# 19. docker cp
show_cp() {
    print_header "19. Docker Copy"
    print_command "docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-"
    print_description "Copy files/folders between a container and the local filesystem"
    print_flags "  -a, --archive    Archive mode (copy all uid/gid information)
  -L, --follow-link Always follow symbol link in SRC_PATH"
    print_examples "  docker cp myapp:/app/config.json ./config.json
  docker cp ./data.txt myapp:/tmp/data.txt
  docker cp myapp:/app/logs ./logs"
    print_separator
}

# 20. docker commit
show_commit() {
    print_header "20. Docker Commit"
    print_command "docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]"
    print_description "Create a new image from a container's changes"
    print_flags "  -a, --author     Author (e.g., 'John Hannibal Smith <hannibal@a-team.com>')
  -c, --change     Apply Dockerfile instruction to the created image
  -m, --message    Commit message
  -p, --pause      Pause container during commit (default true)"
    print_examples "  docker commit myapp myapp:v2
  docker commit -m 'Added config file' myapp myapp:configured
  docker commit -a 'John Doe' myapp myapp:latest"
    print_separator
}

# Main Menu
main_menu() {
    while true; do
        echo ""
        print_header "Docker Commands Reference Guide"
        echo -e "${CYAN}Select a command to view its information:${NC}"
        echo ""
        echo "1. docker build       - Build images from Dockerfile"
        echo "2. docker run         - Run containers"
        echo "3. docker ps          - List containers"
        echo "4. docker images      - List images"
        echo "5. docker stop        - Stop containers"
        echo "6. docker rm          - Remove containers"
        echo "7. docker rmi         - Remove images"
        echo "8. docker logs        - View container logs"
        echo "9. docker exec        - Execute commands in containers"
        echo "10. docker pull       - Pull images from registry"
        echo "11. docker push       - Push images to registry"
        echo "12. docker tag        - Tag images"
        echo "13. docker inspect    - Inspect Docker objects"
        echo "14. docker compose    - Multi-container applications"
        echo "15. docker network    - Manage networks"
        echo "16. docker volume     - Manage volumes"
        echo "17. docker system     - System management"
        echo "18. docker stats      - Container resource usage"
        echo "19. docker cp         - Copy files between container and host"
        echo "20. docker commit     - Create image from container"
        echo "21. Exit"
        echo ""
        
        read -p "Choose an option (1-21): " choice
        
        case $choice in
            1) show_build ;;
            2) show_run ;;
            3) show_ps ;;
            4) show_images ;;
            5) show_stop ;;
            6) show_rm ;;
            7) show_rmi ;;
            8) show_logs ;;
            9) show_exec ;;
            10) show_pull ;;
            11) show_push ;;
            12) show_tag ;;
            13) show_inspect ;;
            14) show_compose ;;
            15) show_network ;;
            16) show_volume ;;
            17) show_system ;;
            18) show_stats ;;
            19) show_cp ;;
            20) show_commit ;;
            21) 
                echo -e "${GREEN}Thank you for using Docker Commands Reference Guide!${NC}"
                exit 0
                ;;
            *) 
                echo -e "${RED}Invalid choice. Please select a number between 1-21.${NC}"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main menu
main_menu
