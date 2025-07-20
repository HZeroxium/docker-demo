# Stop Local Development - Docker Quiz Game (Windows)

param(
  [switch]$RemoveVolumes,
  [switch]$RemoveImages
)

# Colors
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Red = "`e[31m"
$Reset = "`e[0m"

# Configuration
$ProjectName = "docker-quiz"

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

function Write-Warning {
  param($Message)
  Write-Host "${Red}⚠️  $Message${Reset}"
}

# Navigate to project root
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Header "Stopping Docker Quiz Game"

# Stop and remove containers
Write-Info "Stopping all services..."
docker-compose --profile local down
docker-compose --profile local-dev down 2>$null

if ($LASTEXITCODE -eq 0) {
  Write-Success "All containers stopped and removed"
}
else {
  Write-Info "No containers were running"
}

# Remove volumes if requested
if ($RemoveVolumes) {
  Write-Info "Removing persistent volumes..."
  
  $Volumes = @(
    "docker-quiz-mongodb-data",
    "docker-quiz-redis-data"
  )
  
  foreach ($Volume in $Volumes) {
    $VolumeExists = docker volume ls -q -f "name=$Volume"
    if ($VolumeExists) {
      docker volume rm $Volume 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Success "Removed volume: $Volume"
      }
      else {
        Write-Warning "Could not remove volume: $Volume (may be in use)"
      }
    }
  }
}

# Remove images if requested
if ($RemoveImages) {
  Write-Info "Removing project images..."
  
  $Images = @(
    "docker-minigames-backend",
    "docker-minigames-frontend"
  )
  
  foreach ($Image in $Images) {
    $ImageExists = docker images -q $Image
    if ($ImageExists) {
      docker rmi $Image 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Success "Removed image: $Image"
      }
      else {
        Write-Warning "Could not remove image: $Image"
      }
    }
  }
}

# Clean up dangling resources
Write-Info "Cleaning up unused resources..."
$PrunedContainers = docker container prune -f 2>$null
$PrunedNetworks = docker network prune -f 2>$null

Write-Success "Local development environment stopped"

if ($RemoveVolumes -or $RemoveImages) {
  Write-Host ""
  Write-Host "${Yellow}🧹 Cleanup completed${Reset}"
  if ($RemoveVolumes) {
    Write-Host "• Database data removed"
  }
  if ($RemoveImages) {
    Write-Host "• Docker images removed"
  }
}

Write-Host ""
Write-Host "${Yellow}📋 Options for next start:${Reset}"
Write-Host "Normal start: .\scripts\start-local.ps1"
Write-Host "Development mode: .\scripts\start-local.ps1 -Dev"
Write-Host "Skip rebuild: .\scripts\start-local.ps1 -NoBuild"