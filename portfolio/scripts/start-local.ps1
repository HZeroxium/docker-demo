# Start Local Development - Build and Run Portfolio App (Windows)

param(
  [switch]$NoPush
)

# Colors
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# Configuration
$ImageName = "portfolio-app"
$ContainerName = "portfolio_local"
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

# Navigate to project root
Set-Location (Split-Path $PSScriptRoot -Parent)

# Stop existing container if running
$ExistingContainer = docker ps -q -f "name=$ContainerName"
if ($ExistingContainer) {
  Write-Info "Stopping existing container..."
  docker stop $ContainerName
  docker rm $ContainerName
}

# Build image
Write-Header "Building Docker Image"
docker build -t "${ImageName}:${Tag}" .
if ($LASTEXITCODE -ne 0) {
  Write-Error "Build failed"
  exit 1
}
Write-Success "Image built successfully"

# Run container
Write-Header "Starting Container"
docker run -d `
  --name $ContainerName `
  -p 3000:3000 `
  -e NODE_ENV=production `
  --restart unless-stopped `
  "${ImageName}:${Tag}"

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

# Ask to push to Docker Hub
if (-not $NoPush) {
  Write-Host ""
  $PushChoice = Read-Host "Push image to Docker Hub? (y/N)"
  if ($PushChoice -match "^[Yy]$") {
    Write-Header "Pushing to Docker Hub"
    docker tag "${ImageName}:${Tag}" "${DockerHubUser}/${ImageName}:${Tag}"
    docker push "${DockerHubUser}/${ImageName}:${Tag}"
    if ($LASTEXITCODE -eq 0) {
      Write-Success "Image pushed to Docker Hub"
    }
    else {
      Write-Warning "Failed to push image. Make sure you're logged in: docker login"
    }
  }
}

Write-Success "Local development environment ready!"
Write-Host "Access: http://localhost:3000"
Write-Host "Stop: .\scripts\stop-local.ps1"
