# Docker Scripts for Portfolio App

This directory contains Docker scripts for demonstrating containerization and deployment of the NextJS portfolio application.

## Scripts Overview

### 🐳 Docker Commands Demo

- **`docker-commands.sh`** - Interactive demo of 10 most common Docker commands

### 🏠 Local Development (Linux/Mac)

- **`start-local.sh`** - Build image locally and run container
- **`stop-local.sh`** - Stop local development container

### 🏠 Local Development (Windows)

- **`start-local.ps1`** - Build image locally and run container (PowerShell)
- **`stop-local.ps1`** - Stop local development container (PowerShell)

### ☁️ Cloud Deployment (Linux/Mac)

- **`start-cloud.sh`** - Pull image from Docker Hub and run
- **`stop-cloud.sh`** - Stop cloud deployment container

### ☁️ Cloud Deployment (Windows)

- **`start-cloud.ps1`** - Pull image from Docker Hub and run (PowerShell)
- **`stop-cloud.ps1`** - Stop cloud deployment container (PowerShell)

## Usage Examples

### Linux/Mac

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Demo Docker commands
./scripts/docker-commands.sh

# Start local development (builds & runs)
./scripts/start-local.sh

# Stop local development
./scripts/stop-local.sh

# Start cloud deployment (pulls from Docker Hub)
./scripts/start-cloud.sh

# Stop cloud deployment
./scripts/stop-cloud.sh
```

### Windows (PowerShell)

```powershell
# Demo Docker commands (run in Git Bash or WSL)
bash scripts/docker-commands.sh

# Start local development (builds & runs)
.\scripts\start-local.ps1

# Stop local development
.\scripts\stop-local.ps1

# Start cloud deployment (pulls from Docker Hub)
.\scripts\start-cloud.ps1

# Stop cloud deployment
.\scripts\stop-cloud.ps1
```

## Key Features

### Local Development

- ✅ Builds Docker image from source
- ✅ Runs container with health checks
- ✅ Optional push to Docker Hub
- ✅ Automatic cleanup of existing containers

### Cloud Deployment

- ✅ Pulls latest image from Docker Hub (`hzeroxium/portfolio-app`)
- ✅ Runs container with production settings
- ✅ Health check verification
- ✅ Clean shutdown support

### Docker Commands Demo

- ✅ Interactive menu system
- ✅ 10 most common Docker commands
- ✅ Educational examples with portfolio app
- ✅ Colored output for better UX

## Prerequisites

- Docker Desktop installed and running
- For cloud deployment: Image pushed to Docker Hub
- For Windows: PowerShell 5.1+ or PowerShell Core

## Application Access

Once started, the application will be available at:

- **URL**: <http://localhost:3000>
- **Health Check**: <http://localhost:3000/api/health>

## Troubleshooting

### Common Issues

1. **Port 3000 in use**: Scripts automatically stop existing containers
2. **Docker not running**: Start Docker Desktop first
3. **Image not found**: For cloud deployment, ensure image exists on Docker Hub

### Debug Commands

```bash
# Check container logs
docker logs portfolio_local    # or portfolio_cloud

# Check container status
docker ps -a

# Check images
docker images
```

## Docker Hub Configuration

Default Docker Hub user: `hzeroxium`
Image name: `portfolio-app`
Full image path: `hzeroxium/portfolio-app:latest`

To use your own Docker Hub account, edit the scripts and change the `DOCKER_HUB_USER` variable.
