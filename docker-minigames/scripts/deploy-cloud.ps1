param(
  [Parameter(Mandatory = $false)]
  [string]$ComposeFile = "docker-compose.deploy.yml",

  [Parameter(Mandatory = $false)]
  [string]$EnvFile = ".env",

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

Write-Info "🚀 Docker Quiz Game - Cloud Deployment"
Write-Info "======================================"

# Check if required files exist
if (-not (Test-Path $ComposeFile)) {
  Write-Error "$ComposeFile not found!"
  Write-Info "Please ensure you have the deployment compose file in the current directory."
  exit 1
}

if (-not (Test-Path $EnvFile)) {
  Write-Error "$EnvFile file not found!"
  Write-Info "Please create a $EnvFile file with your cloud configuration."
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

# Load and display environment configuration
if (Test-Path $EnvFile) {
  $envContent = Get-Content $EnvFile
  $config = @{}
  foreach ($line in $envContent) {
    if ($line -match '^([^#][^=]+)=(.*)$') {
      $config[$matches[1]] = $matches[2]
    }
  }
  
  Write-Info "Configuration loaded from $EnvFile"
  Write-Info "Backend URL: $($config['VITE_BACKEND_URL'] ?? 'Not set')"
  Write-Info "Environment: $($config['ENVIRONMENT'] ?? 'Not set')"
  Write-Info "Profile: $($config['COMPOSE_PROFILES'] ?? 'Not set')"
}

# Verify Docker registry access
Write-Info "🔐 Checking Docker registry access..."
try {
  docker pull hello-world | Out-Null
  Write-Success "Docker registry access verified"
  docker rmi hello-world | Out-Null
}
catch {
  Write-Warning "Cannot verify Docker registry access"
}

# Pull latest images
Write-Info "📥 Pulling latest Docker images..."
try {
  docker-compose -f $ComposeFile --profile $Profile pull
  Write-Success "Images pulled successfully"
}
catch {
  Write-Error "Failed to pull images: $_"
  exit 1
}

# Stop existing containers (if any)
Write-Info "🛑 Stopping existing containers..."
try {
  docker-compose -f $ComposeFile --profile $Profile down
}
catch {
  Write-Warning "No existing containers to stop"
}

# Start the application
Write-Info "🚀 Starting application..."
try {
  docker-compose -f $ComposeFile --profile $Profile up -d
  Write-Success "Application started successfully"
}
catch {
  Write-Error "Failed to start application: $_"
  exit 1
}

# Wait for services to be healthy
Write-Info "⏳ Waiting for services to be healthy..."
Start-Sleep -Seconds 30

# Check service health
Write-Info "🔍 Checking service health..."

# Get ports from config or use defaults
$backendPort = $config['BACKEND_PORT'] ?? "8000"
$frontendPort = $config['FRONTEND_PORT'] ?? "3000"

# Check backend health
try {
  $response = Invoke-WebRequest -Uri "http://localhost:$backendPort/health" -UseBasicParsing -TimeoutSec 10
  if ($response.StatusCode -eq 200) {
    Write-Success "Backend service is healthy"
  }
}
catch {
  Write-Warning "Backend service health check failed"
}

# Check frontend health
try {
  $response = Invoke-WebRequest -Uri "http://localhost:$frontendPort/health" -UseBasicParsing -TimeoutSec 10
  if ($response.StatusCode -eq 200) {
    Write-Success "Frontend service is healthy"
  }
}
catch {
  Write-Warning "Frontend service health check failed"
}

# Display running containers
Write-Info "📋 Running containers:"
docker-compose -f $ComposeFile --profile $Profile ps

# Display service URLs
Write-Success "🎉 Deployment completed successfully!"
Write-Host ""
Write-Info "📝 Service URLs:"
Write-Info "Frontend: http://localhost:$frontendPort"
Write-Info "Backend API: http://localhost:$backendPort"
Write-Info "Backend Health: http://localhost:$backendPort/health"
Write-Info "API Documentation: http://localhost:$backendPort/docs"
Write-Host ""
Write-Info "💡 To view logs: docker-compose -f $ComposeFile --profile $Profile logs -f"
Write-Info "💡 To stop: docker-compose -f $ComposeFile --profile $Profile down"
Write-Host ""
Write-Info "🎮 You can now access the quiz game at: http://localhost:$frontendPort"
