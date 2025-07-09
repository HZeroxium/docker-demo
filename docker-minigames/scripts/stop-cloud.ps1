param(
  [Parameter(Mandatory = $false)]
  [string]$ComposeFile = "docker-compose.deploy.yml",

  [Parameter(Mandatory = $false)]
  [string]$Profile = "cloud"
)

# Configuration
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info($message) {
  Write-Host "🔵 $message" -ForegroundColor Blue
}

function Write-Success($message) {
  Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Error($message) {
  Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Warning($message) {
  Write-Host "⚠️ $message" -ForegroundColor Yellow
}

Write-Info "🛑 Docker Quiz Game - Stop Deployment"
Write-Info "=================================="

# Check if compose file exists
if (-not (Test-Path $ComposeFile)) {
  Write-Error "$ComposeFile not found!"
  Write-Info "Please ensure you have the deployment compose file in the current directory."
  exit 1
}

# Check if Docker is running
try {
  docker version | Out-Null
  Write-Success "Docker is running"
}
catch {
  Write-Error "Docker is not running or not installed"
  exit 1
}

# Check if Docker Compose is available
try {
  docker-compose --version | Out-Null
  Write-Success "Docker Compose is available"
}
catch {
  Write-Error "Docker Compose is not installed"
  exit 1
}

# Display current running containers
Write-Info "📋 Current running containers:"
try {
  docker-compose -f $ComposeFile --profile $Profile ps
}
catch {
  Write-Warning "No containers found or compose file issue"
}

# Stop and remove containers
Write-Info "🛑 Stopping application containers..."
try {
  docker-compose -f $ComposeFile --profile $Profile down
  Write-Success "Application stopped successfully"
}
catch {
  Write-Error "Failed to stop application: $_"
  exit 1
}

# Optional cleanup (commented out by default)
# Write-Info "🧹 Cleaning up unused images..."
# docker image prune -f

# Write-Info "🧹 Cleaning up unused volumes..."
# docker volume prune -f

Write-Success "🎉 Stop deployment completed successfully!"
Write-Host ""
Write-Info "💡 To redeploy: .\scripts\deploy-cloud.ps1"
Write-Info "💡 To view all containers: docker ps -a"
Write-Info "💡 To remove everything: docker-compose -f $ComposeFile --profile $Profile down --volumes --rmi all"
