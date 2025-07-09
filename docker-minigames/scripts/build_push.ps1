param(
  [Parameter(Mandatory = $false)]
  [string]$Registry = "hzeroxium",

  [Parameter(Mandatory = $false)]
  [string]$Tag = "latest",

  [Parameter(Mandatory = $false)]
  [string]$ProjectName = "docker-quiz-game",

  [Parameter(Mandatory = $false)]
  [string]$BackendUrl = $null
)

# Configuration
$ErrorActionPreference = "Stop"
$BackendImage = "$Registry/$ProjectName-backend:$Tag"
$FrontendImage = "$Registry/$ProjectName-frontend:$Tag"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
  $fc = $host.UI.RawUI.ForegroundColor
  $host.UI.RawUI.ForegroundColor = $ForegroundColor
  if ($args) {
    Write-Output $args
  }
  $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($message) {
  Write-ColorOutput Blue "🔵 $message"
}

function Write-Success($message) {
  Write-ColorOutput Green "✅ $message"
}

function Write-Error($message) {
  Write-ColorOutput Red "❌ $message"
}

function Write-Warning($message) {
  Write-ColorOutput Yellow "⚠️ $message"
}

Write-Info "🚀 Docker Quiz Game - Build and Push Images"
Write-Info "=============================================="
Write-Info "Registry: $Registry"
Write-Info "Tag: $Tag"
Write-Info "Backend Image: $BackendImage"
Write-Info "Frontend Image: $FrontendImage"

# Get backend URL from environment or parameter
if ($BackendUrl) {
  $BuildBackendUrl = $BackendUrl
  Write-Info "Backend URL (from parameter): $BuildBackendUrl"
}
elseif ($env:VITE_BACKEND_URL) {
  $BuildBackendUrl = $env:VITE_BACKEND_URL
  Write-Info "Backend URL (from environment): $BuildBackendUrl"
}
else {
  Write-Warning "No backend URL specified. Frontend will use localhost:8000"
  $BuildBackendUrl = "http://localhost:8000"
}

Write-Info ""

# Check if Docker is running
try {
  docker version | Out-Null
  Write-Success "Docker is running"
}
catch {
  Write-Error "Docker is not running or not installed"
  exit 1
}

# Check if logged into registry
Write-Info "🔐 Checking registry authentication..."
try {
  docker info | Select-String "Registry" | Out-Null
  Write-Success "Docker registry access verified"
}
catch {
  Write-Warning "Make sure you're logged into your Docker registry"
  Write-Info "Run: docker login $Registry"
}

# Build Backend Image
Write-Info "🏗️ Building Backend Image..."
try {
  Push-Location backend

  docker build `
    --tag $BackendImage `
    --platform linux/amd64 `
    --build-arg BUILDKIT_INLINE_CACHE=1 `
    --progress=plain `
    .

  Write-Success "Backend image built successfully"
  Pop-Location
}
catch {
  Write-Error "Failed to build backend image: $_"
  Pop-Location
  exit 1
}

# Build Frontend Image using existing Dockerfile
Write-Info "🏗️ Building Frontend Image with backend URL: $BuildBackendUrl"
try {
  Push-Location frontend

  # Always pass backend URL as build argument
  docker build `
    --tag $FrontendImage `
    --platform linux/amd64 `
    --build-arg VITE_BACKEND_URL=$BuildBackendUrl `
    --build-arg VITE_ENVIRONMENT=production `
    --build-arg BUILDKIT_INLINE_CACHE=1 `
    --memory=1g `
    --memory-swap=2g `
    --progress=plain `
    .

  Write-Success "Frontend image built successfully with backend URL: $BuildBackendUrl"
  Pop-Location
}
catch {
  Write-Error "Failed to build frontend image: $_"
  Pop-Location
  exit 1
}

# Push Backend Image
Write-Info "📤 Pushing Backend Image..."
try {
  docker push $BackendImage
  Write-Success "Backend image pushed successfully"
}
catch {
  Write-Error "Failed to push backend image: $_"
  exit 1
}

# Push Frontend Image
Write-Info "📤 Pushing Frontend Image..."
try {
  docker push $FrontendImage
  Write-Success "Frontend image pushed successfully"
}
catch {
  Write-Error "Failed to push frontend image: $_"
  exit 1
}

# Display image information
Write-Info "📊 Image Information:"
docker images | Select-String "$ProjectName"

# Create deployment info file
$DeploymentInfo = @"
# Docker Quiz Game - Deployment Images

## Built on: $(Get-Date)
## Backend URL: $BuildBackendUrl
## Images:
- Backend: $BackendImage
- Frontend: $FrontendImage (configured for $BuildBackendUrl)

## Usage:
1. Copy docker-compose.deploy.yml and .env to your cloud server
2. Update .env file with your cloud database credentials
3. Deploy using: docker-compose -f docker-compose.deploy.yml --profile cloud up -d

## Environment Variables Required:
- VITE_BACKEND_URL=$BuildBackendUrl
- MONGODB_URL=your_mongodb_connection_string
- REDIS_HOST=your_redis_host
- REDIS_PASSWORD=your_redis_password

## Verification:
docker pull $BackendImage
docker pull $FrontendImage
"@

$DeploymentInfo | Out-File -FilePath "deployment-images.md" -Encoding UTF8

Write-Success "🎉 Build and Push completed successfully!"
Write-Success "📝 Deployment info saved to: deployment-images.md"
Write-Info ""
Write-Info "📋 Next Steps:"
Write-Info "1. Copy docker-compose.deploy.yml and .env to your cloud server"
Write-Info "2. Update environment variables in .env file for your cloud setup"
Write-Info "3. Run deployment script on cloud server"
Write-Info ""
Write-Info "💡 Usage Example:"
Write-Info "  Local build: .\scripts\build_push.ps1 -BackendUrl 'http://YOUR_SERVER_IP:8000'"
Write-Info "  Cloud deploy: docker-compose -f docker-compose.deploy.yml --profile cloud up -d"
