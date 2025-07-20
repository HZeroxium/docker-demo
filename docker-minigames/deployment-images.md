# Docker Quiz Game - Deployment Images

## Built on: 07/19/2025 11:01:54
## Backend URL: http://localhost:8000
## Images:
- Backend: hzeroxium/docker-quiz-game-backend:latest
- Frontend: hzeroxium/docker-quiz-game-frontend:latest (configured for http://localhost:8000)

## Usage:
1. Copy docker-compose.deploy.yml and .env to your cloud server
2. Update .env file with your cloud database credentials
3. Deploy using: docker-compose -f docker-compose.deploy.yml --profile cloud up -d

## Environment Variables Required:
- VITE_BACKEND_URL=http://localhost:8000
- MONGODB_URL=your_mongodb_connection_string
- REDIS_HOST=your_redis_host
- REDIS_PASSWORD=your_redis_password

## Verification:
docker pull hzeroxium/docker-quiz-game-backend:latest
docker pull hzeroxium/docker-quiz-game-frontend:latest
