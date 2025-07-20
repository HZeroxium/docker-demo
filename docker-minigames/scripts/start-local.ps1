# Start Local Development - Docker Quiz Game with Local MongoDB (Windows)

param(
  [switch]$Dev,
  [switch]$NoBuild
)

# Colors
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

# Configuration
$ProjectName = "docker-quiz"
$Profile = if ($Dev) { "local-dev" } else { "local" }
$EnvFile = ".env.local"

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

function Write-Service {
  param($Message)
  Write-Host "${Cyan}🔧 $Message${Reset}"
}

# Navigate to project root
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Header "Starting Docker Quiz Game"
Write-Info "Environment: Local Development with MongoDB Container"
Write-Info "Profile: $Profile"

# Copy environment file
if (Test-Path $EnvFile) {
  Copy-Item $EnvFile ".env" -Force
  Write-Success "Environment file copied from $EnvFile"
}
else {
  Write-Warning "Environment file $EnvFile not found. Using default settings."
}

# Stop existing containers if running
Write-Info "Stopping existing containers..."
docker-compose --profile $Profile down 2>$null

# Build and start services
Write-Header "Building and Starting Services"
if ($NoBuild) {
  docker-compose --profile $Profile up -d
}
else {
  docker-compose --profile $Profile up --build -d
}

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to start services"
  exit 1
}

# Wait for services to be ready
Write-Info "Waiting for services to start..."
Start-Sleep -Seconds 10

# Check service health
Write-Header "Service Status"

# Check MongoDB
try {
  $MongoStatus = docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Service "MongoDB: Running on port 27017"
  }
}
catch {
  Write-Service "MongoDB: Starting..."
}

# Check Redis
try {
  $RedisStatus = docker-compose exec redis redis-cli ping 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Service "Redis: Running on port 6379"
  }
}
catch {
  Write-Service "Redis: Starting..."
}

# Check Backend
try {
  Start-Sleep -Seconds 5
  Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 10 | Out-Null
  Write-Service "Backend API: Running on port 8000"
}
catch {
  Write-Service "Backend API: Starting... (check logs if needed)"
}

# Check Frontend
try {
  Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10 | Out-Null
  Write-Service "Frontend: Running on port 3000"
}
catch {
  Write-Service "Frontend: Starting... (check logs if needed)"
}

Write-Success "Docker Quiz Game started successfully!"
Write-Host ""
Write-Host "${Cyan}📱 Access Points:${Reset}"
Write-Host "🌐 Frontend: http://localhost:3000"
Write-Host "🔧 Backend API: http://localhost:8000"
Write-Host "🔧 API Docs: http://localhost:8000/docs"
Write-Host "🗄️ MongoDB: localhost:27017"
Write-Host "🔴 Redis: localhost:6379"
Write-Host ""
Write-Host "${Yellow}📋 Useful Commands:${Reset}"
Write-Host "View logs: docker-compose logs -f"
Write-Host "Stop services: .\scripts\stop-local.ps1"
Write-Host "Restart: .\scripts\start-local.ps1"