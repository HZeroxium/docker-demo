from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import logging
from contextlib import asynccontextmanager
from app.routers import game, questions, leaderboard, admin
from app.core.websocket_manager import WebSocketManager
from app.database.connection import connect_to_mongo, close_mongo_connection
from app.core.cache import cache_service
from app.core.config import settings
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Initialize WebSocket manager
websocket_manager = WebSocketManager(sio)


# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting Docker Quiz Game API...")

    # Log environment information (without sensitive data)
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/docker_quiz_game")
    db_name = os.getenv("DB_NAME", "docker_quiz_game")
    environment = os.getenv("ENVIRONMENT", "development")

    logger.info(f"🌍 Environment: {environment}")
    logger.info(f"🗄️ Database Name: {db_name}")
    logger.info(
        f"🔗 MongoDB Type: {'Atlas' if 'mongodb.net' in mongodb_url else 'Local/Remote'}"
    )

    try:
        # Connect to MongoDB
        await connect_to_mongo()
        logger.info("✅ MongoDB connection established!")

        # Connect to Redis
        await cache_service.connect()
        if cache_service.is_connected:
            logger.info("✅ Redis cache connection established!")
        else:
            logger.info("⚠️ Redis cache not available - continuing without caching")

        logger.info("✅ Server ready!")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        logger.error(
            "💡 Please check your MongoDB connection string and database configuration"
        )
        raise

    yield

    # Shutdown
    logger.info("🛑 Shutting down...")
    try:
        await close_mongo_connection()
        await cache_service.disconnect()
        logger.info("✅ Shutdown complete!")
    except Exception as e:
        logger.error(f"❌ Shutdown error: {e}")


# Create FastAPI app with lifespan
app = FastAPI(
    title="Docker Quiz Game API",
    version="1.0.0",
    lifespan=lifespan,
    description="A quiz game API for learning Docker concepts",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inject WebSocket manager into game router
game.set_websocket_manager(websocket_manager)

# Include routers
app.include_router(game.router, prefix="/api", tags=["game"])
app.include_router(questions.router, prefix="/api", tags=["questions"])
app.include_router(leaderboard.router, prefix="/api", tags=["leaderboard"])
app.include_router(admin.router, prefix="/api", tags=["admin"])


@app.get("/")
async def root():
    return {
        "message": "Docker Quiz Game API",
        "status": "running",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "cache_status": "connected" if cache_service.is_connected else "disconnected",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "docker-quiz-api",
        "database": "connected" if hasattr(app.state, "db") else "unknown",
        "cache": "connected" if cache_service.is_connected else "disconnected",
    }


# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
