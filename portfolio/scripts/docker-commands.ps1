#!/usr/bin/env pwsh

# Docker Commands Reference Guide
# Top 20 Most Common Docker Commands - Information Display Only
# PowerShell Version

# Colors for output
$RED = "`e[31m"
$GREEN = "`e[32m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$PURPLE = "`e[35m"
$CYAN = "`e[36m"
$NC = "`e[0m" # No Color

# Helper functions
function Print-Header {
  param([string]$Message)
  Write-Host "${BLUE}===============================================${NC}"
  Write-Host "${BLUE}$Message${NC}"
  Write-Host "${BLUE}===============================================${NC}"
}

function Print-Command {
  param([string]$Command)
  Write-Host "${GREEN}Command: ${CYAN}$Command${NC}"
}

function Print-Description {
  param([string]$Description)
  Write-Host "${YELLOW}Description: ${NC}$Description"
}

function Print-Flags {
  param([string]$Flags)
  Write-Host "${PURPLE}Common Flags:${NC}"
  Write-Host $Flags
}

function Print-Examples {
  param([string]$Examples)
  Write-Host "${CYAN}Examples:${NC}"
  Write-Host $Examples
}

function Print-Separator {
  Write-Host "${BLUE}-----------------------------------------------${NC}"
}

# 1. docker build
function Show-Build {
  Print-Header "1. Docker Build"
  Print-Command "docker build [OPTIONS] PATH | URL | -"
  Print-Description "Build an image from a Dockerfile"
  Print-Flags "  -t, --tag      Name and optionally a tag (name:tag)
  -f, --file     Name of the Dockerfile (default: PATH/Dockerfile)
  --no-cache     Do not use cache when building the image
  --pull         Always attempt to pull a newer version of the image
  --build-arg    Set build-time variables
  --target       Set the target build stage to build
  --platform     Set platform if server is multi-platform capable"
  Print-Examples "  docker build -t myapp:latest .
  docker build -t myapp:v1.0 -f Dockerfile.prod .
  docker build --no-cache -t myapp .
  docker build --build-arg NODE_ENV=production -t myapp ."
  Print-Separator
}

# 2. docker run
function Show-Run {
  Print-Header "2. Docker Run"
  Print-Command "docker run [OPTIONS] IMAGE [COMMAND] [ARG...]"
  Print-Description "Run a command in a new container"
  Print-Flags "  -d, --detach     Run container in background and print container ID
  -p, --publish    Publish a container's port(s) to the host
  -e, --env        Set environment variables
  -v, --volume     Bind mount a volume
  --name           Assign a name to the container
  -it              Interactive mode with TTY
  --rm             Automatically remove the container when it exits
  --restart        Restart policy (no, on-failure, always, unless-stopped)
  --network        Connect to a network
  --user           Username or UID"
  Print-Examples "  docker run -d -p 3000:3000 --name myapp portfolio-app
  docker run -it --rm ubuntu:latest /bin/bash
  docker run -e NODE_ENV=production -v /host:/container myapp
  docker run --restart unless-stopped -d nginx"
  Print-Separator
}

# 3. docker ps
function Show-Ps {
  Print-Header "3. Docker PS"
  Print-Command "docker ps [OPTIONS]"
  Print-Description "List containers"
  Print-Flags "  -a, --all        Show all containers (default shows just running)
  -q, --quiet      Only display container IDs
  -f, --filter     Filter output based on conditions
  --format         Pretty-print containers using a Go template
  -l, --latest     Show the latest created container
  -n, --last       Show n last created containers
  -s, --size       Display total file sizes"
  Print-Examples "  docker ps
  docker ps -a
  docker ps -q
  docker ps --filter 'status=running'
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
  Print-Separator
}

# 4. docker images
function Show-Images {
  Print-Header "4. Docker Images"
  Print-Command "docker images [OPTIONS] [REPOSITORY[:TAG]]"
  Print-Description "List images"
  Print-Flags "  -a, --all        Show all images (default hides intermediate images)
  -q, --quiet      Only show image IDs
  -f, --filter     Filter output based on conditions
  --format         Pretty-print images using a Go template
  --no-trunc       Don't truncate output
  --digests        Show digests"
  Print-Examples "  docker images
  docker images -a
  docker images -q
  docker images --filter 'dangling=true'
  docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'"
  Print-Separator
}

# 5. docker stop
function Show-Stop {
  Print-Header "5. Docker Stop"
  Print-Command "docker stop [OPTIONS] CONTAINER [CONTAINER...]"
  Print-Description "Stop one or more running containers"
  Print-Flags "  -t, --time       Seconds to wait for stop before killing (default 10)"
  Print-Examples "  docker stop myapp
  docker stop container1 container2
  docker stop -t 30 myapp
  docker stop `$(docker ps -q)"
  Print-Separator
}

# 6. docker rm
function Show-Rm {
  Print-Header "6. Docker Remove Container"
  Print-Command "docker rm [OPTIONS] CONTAINER [CONTAINER...]"
  Print-Description "Remove one or more containers"
  Print-Flags "  -f, --force      Force the removal of a running container
  -v, --volumes    Remove associated volumes
  -l, --link       Remove the specified link"
  Print-Examples "  docker rm myapp
  docker rm -f myapp
  docker rm -v myapp
  docker rm `$(docker ps -aq)"
  Print-Separator
}

# 7. docker rmi
function Show-Rmi {
  Print-Header "7. Docker Remove Image"
  Print-Command "docker rmi [OPTIONS] IMAGE [IMAGE...]"
  Print-Description "Remove one or more images"
  Print-Flags "  -f, --force      Force removal of the image
  --no-prune       Do not delete untagged parents"
  Print-Examples "  docker rmi myapp:latest
  docker rmi -f myapp:latest
  docker rmi `$(docker images -q)
  docker rmi `$(docker images -f 'dangling=true' -q)"
  Print-Separator
}

# 8. docker logs
function Show-Logs {
  Print-Header "8. Docker Logs"
  Print-Command "docker logs [OPTIONS] CONTAINER"
  Print-Description "Fetch the logs of a container"
  Print-Flags "  -f, --follow     Follow log output
  -t, --timestamps Show timestamps
  --tail           Number of lines to show from the end of the logs
  --since          Show logs since timestamp
  --until          Show logs before a timestamp"
  Print-Examples "  docker logs myapp
  docker logs -f myapp
  docker logs --tail 50 myapp
  docker logs --since 2023-01-01T00:00:00 myapp"
  Print-Separator
}

# 9. docker exec
function Show-Exec {
  Print-Header "9. Docker Exec"
  Print-Command "docker exec [OPTIONS] CONTAINER COMMAND [ARG...]"
  Print-Description "Run a command in a running container"
  Print-Flags "  -i, --interactive Keep STDIN open even if not attached
  -t, --tty        Allocate a pseudo-TTY
  -d, --detach     Run command in background
  -e, --env        Set environment variables
  -w, --workdir    Working directory inside the container
  -u, --user       Username or UID"
  Print-Examples "  docker exec -it myapp /bin/bash
  docker exec -it myapp /bin/sh
  docker exec myapp ls -la
  docker exec -e NODE_ENV=production myapp npm start"
  Print-Separator
}

# 10. docker pull
function Show-Pull {
  Print-Header "10. Docker Pull"
  Print-Command "docker pull [OPTIONS] NAME[:TAG|@DIGEST]"
  Print-Description "Pull an image or a repository from a registry"
  Print-Flags "  -a, --all-tags   Download all tagged images in the repository
  --platform       Set platform if server is multi-platform capable
  -q, --quiet      Suppress verbose output"
  Print-Examples "  docker pull ubuntu:latest
  docker pull nginx:alpine
  docker pull -a ubuntu
  docker pull --platform linux/amd64 ubuntu:latest"
  Print-Separator
}

# 11. docker push
function Show-Push {
  Print-Header "11. Docker Push"
  Print-Command "docker push [OPTIONS] NAME[:TAG]"
  Print-Description "Push an image or a repository to a registry"
  Print-Flags "  -a, --all-tags   Push all tagged images in the repository
  --disable-content-trust Skip image signing (default true)
  -q, --quiet      Suppress verbose output"
  Print-Examples "  docker push myusername/myapp:latest
  docker push myusername/myapp:v1.0
  docker push -a myusername/myapp"
  Print-Separator
}

# 12. docker tag
function Show-Tag {
  Print-Header "12. Docker Tag"
  Print-Command "docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]"
  Print-Description "Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE"
  Print-Flags "  No specific flags - uses image names and tags"
  Print-Examples "  docker tag myapp:latest myusername/myapp:latest
  docker tag myapp:latest myapp:v1.0
  docker tag ubuntu:latest myregistry.com/ubuntu:latest"
  Print-Separator
}

# 13. docker inspect
function Show-Inspect {
  Print-Header "13. Docker Inspect"
  Print-Command "docker inspect [OPTIONS] NAME|ID [NAME|ID...]"
  Print-Description "Return low-level information on Docker objects"
  Print-Flags "  -f, --format     Format the output using a Go template
  -s, --size       Display total file sizes if the type is container
  --type           Return JSON for specified type"
  Print-Examples "  docker inspect myapp
  docker inspect -f '{{.State.Status}}' myapp
  docker inspect --format='{{.NetworkSettings.IPAddress}}' myapp"
  Print-Separator
}

# 14. docker compose
function Show-Compose {
  Print-Header "14. Docker Compose"
  Print-Command "docker compose [OPTIONS] COMMAND"
  Print-Description "Define and run multi-container Docker applications"
  Print-Flags "  up               Create and start containers
  down             Stop and remove containers
  build            Build or rebuild services
  logs             View output from containers
  ps               List containers
  exec             Execute a command in a running container
  restart          Restart services
  stop             Stop services
  start            Start services"
  Print-Examples "  docker compose up -d
  docker compose down
  docker compose build
  docker compose logs -f
  docker compose exec web bash"
  Print-Separator
}

# 15. docker network
function Show-Network {
  Print-Header "15. Docker Network"
  Print-Command "docker network COMMAND"
  Print-Description "Manage networks"
  Print-Flags "  create           Create a network
  ls               List networks
  rm               Remove one or more networks
  inspect          Display detailed information on one or more networks
  connect          Connect a container to a network
  disconnect       Disconnect a container from a network
  prune            Remove all unused networks"
  Print-Examples "  docker network create mynetwork
  docker network ls
  docker network inspect bridge
  docker network connect mynetwork mycontainer"
  Print-Separator
}

# 16. docker volume
function Show-Volume {
  Print-Header "16. Docker Volume"
  Print-Command "docker volume COMMAND"
  Print-Description "Manage volumes"
  Print-Flags "  create           Create a volume
  ls               List volumes
  rm               Remove one or more volumes
  inspect          Display detailed information on one or more volumes
  prune            Remove all unused local volumes"
  Print-Examples "  docker volume create myvolume
  docker volume ls
  docker volume inspect myvolume
  docker volume prune"
  Print-Separator
}

# 17. docker system
function Show-System {
  Print-Header "17. Docker System"
  Print-Command "docker system COMMAND"
  Print-Description "Manage Docker"
  Print-Flags "  df               Show docker disk usage
  info             Display system-wide information
  prune            Remove unused data
  events           Get real time events from the server"
  Print-Examples "  docker system df
  docker system info
  docker system prune -a
  docker system events"
  Print-Separator
}

# 18. docker stats
function Show-Stats {
  Print-Header "18. Docker Stats"
  Print-Command "docker stats [OPTIONS] [CONTAINER...]"
  Print-Description "Display a live stream of container(s) resource usage statistics"
  Print-Flags "  -a, --all        Show all containers (default shows just running)
  --no-stream      Disable streaming stats and only pull the first result
  --no-trunc       Do not truncate output
  --format         Pretty-print stats using a Go template"
  Print-Examples "  docker stats
  docker stats myapp
  docker stats --no-stream
  docker stats --format 'table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}'"
  Print-Separator
}

# 19. docker cp
function Show-Cp {
  Print-Header "19. Docker Copy"
  Print-Command "docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-"
  Print-Description "Copy files/folders between a container and the local filesystem"
  Print-Flags "  -a, --archive    Archive mode (copy all uid/gid information)
  -L, --follow-link Always follow symbol link in SRC_PATH"
  Print-Examples "  docker cp myapp:/app/config.json ./config.json
  docker cp ./data.txt myapp:/tmp/data.txt
  docker cp myapp:/app/logs ./logs"
  Print-Separator
}

# 20. docker commit
function Show-Commit {
  Print-Header "20. Docker Commit"
  Print-Command "docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]"
  Print-Description "Create a new image from a container's changes"
  Print-Flags "  -a, --author     Author (e.g., 'John Hannibal Smith <hannibal@a-team.com>')
  -c, --change     Apply Dockerfile instruction to the created image
  -m, --message    Commit message
  -p, --pause      Pause container during commit (default true)"
  Print-Examples "  docker commit myapp myapp:v2
  docker commit -m 'Added config file' myapp myapp:configured
  docker commit -a 'John Doe' myapp myapp:latest"
  Print-Separator
}

# Main Menu
function Show-MainMenu {
  while ($true) {
    Write-Host ""
    Print-Header "Docker Commands Reference Guide"
    Write-Host "${CYAN}Select a command to view its information:${NC}"
    Write-Host ""
    Write-Host "1. docker build       - Build images from Dockerfile"
    Write-Host "2. docker run         - Run containers"
    Write-Host "3. docker ps          - List containers"
    Write-Host "4. docker images      - List images"
    Write-Host "5. docker stop        - Stop containers"
    Write-Host "6. docker rm          - Remove containers"
    Write-Host "7. docker rmi         - Remove images"
    Write-Host "8. docker logs        - View container logs"
    Write-Host "9. docker exec        - Execute commands in containers"
    Write-Host "10. docker pull       - Pull images from registry"
    Write-Host "11. docker push       - Push images to registry"
    Write-Host "12. docker tag        - Tag images"
    Write-Host "13. docker inspect    - Inspect Docker objects"
    Write-Host "14. docker compose    - Multi-container applications"
    Write-Host "15. docker network    - Manage networks"
    Write-Host "16. docker volume     - Manage volumes"
    Write-Host "17. docker system     - System management"
    Write-Host "18. docker stats      - Container resource usage"
    Write-Host "19. docker cp         - Copy files between container and host"
    Write-Host "20. docker commit     - Create image from container"
    Write-Host "21. Exit"
    Write-Host ""
        
    $choice = Read-Host "Choose an option (1-21)"
        
    switch ($choice) {
      1 { Show-Build }
      2 { Show-Run }
      3 { Show-Ps }
      4 { Show-Images }
      5 { Show-Stop }
      6 { Show-Rm }
      7 { Show-Rmi }
      8 { Show-Logs }
      9 { Show-Exec }
      10 { Show-Pull }
      11 { Show-Push }
      12 { Show-Tag }
      13 { Show-Inspect }
      14 { Show-Compose }
      15 { Show-Network }
      16 { Show-Volume }
      17 { Show-System }
      18 { Show-Stats }
      19 { Show-Cp }
      20 { Show-Commit }
      21 { 
        Write-Host "${GREEN}Thank you for using Docker Commands Reference Guide!${NC}"
        exit 0
      }
      default { 
        Write-Host "${RED}Invalid choice. Please select a number between 1-21.${NC}"
      }
    }

    Write-Host ""
    Read-Host "Press Enter to continue"
  }
}

# Run main menu
Show-MainMenu
