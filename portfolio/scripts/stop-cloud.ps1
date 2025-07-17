# Stop Cloud Deployment (Windows)

# Colors
$Green = "`e[32m"
$Yellow = "`e[33m"
$Reset = "`e[0m"

# Configuration
$ContainerName = "portfolio_cloud"

function Write-Success {
  param($Message)
  Write-Host "${Green}✅ $Message${Reset}"
}

function Write-Info {
  param($Message)
  Write-Host "${Yellow}ℹ️  $Message${Reset}"
}

Write-Info "Stopping cloud deployment..."

# Stop and remove container
$ExistingContainer = docker ps -q -f "name=$ContainerName"
if ($ExistingContainer) {
  docker stop $ContainerName
  docker rm $ContainerName
  Write-Success "Container stopped and removed"
}
else {
  Write-Info "Container not running"
}

Write-Success "Cloud deployment stopped"
