# Start Cloud Deployment - Pull and Run from Docker Hub (Windows)

# Colors
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# Configuration
$ImageName = "portfolio-app"
$ContainerName = "portfolio_cloud"
$Tag = "latest"
$DockerHubUser = "hzeroxium"

function Write-Success {
  param($Message)
  Write-Host "${Green}✅ $Message${Reset}"
}

function Write-Info {
  param($Message)
  Write-Host "${Yellow}ℹ️  $Message${Reset}"
}

function Write-Header {
  param($Message)
  Write-Host "${Blue}===== $Message =====${Reset}"
}

# Stop existing container if running
$ExistingContainer = docker ps -q -f "name=$ContainerName"
if ($ExistingContainer) {
  Write-Info "Stopping existing container..."
  docker stop $ContainerName
  docker rm $ContainerName
}

# Pull latest image from Docker Hub
Write-Header "Pulling Latest Image from Docker Hub"
docker pull "${DockerHubUser}/${ImageName}:${Tag}"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to pull image"
  exit 1
}
Write-Success "Image pulled successfully"

# Run container
Write-Header "Starting Cloud Container"
docker run -d `
  --name $ContainerName `
  -p 3000:3000 `
  -e NODE_ENV=production `
  --restart unless-stopped `
  "${DockerHubUser}/${ImageName}:${Tag}"

if ($LASTEXITCODE -ne 0) {
  Write-Error "Container failed to start"
  exit 1
}
Write-Success "Container started successfully"

# Wait for health check
Write-Info "Waiting for application to start..."
Start-Sleep -Seconds 5

# Check if application is running
try {
  Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10 | Out-Null
  Write-Success "Application is running at http://localhost:3000"
}
catch {
  Write-Info "Application may still be starting. Check logs: docker logs $ContainerName"
}

Write-Success "Cloud deployment ready!"
Write-Host "Access: http://localhost:3000"
Write-Host "Stop: .\scripts\stop-cloud.ps1"
