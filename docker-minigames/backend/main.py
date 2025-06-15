from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import logging
from contextlib import asynccontextmanager
from app.routers import game, questions, leaderboard
from app.core.websocket_manager import WebSocketManager
from app.database.connection import connect_to_mongo, close_mongo_connection

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
    try:
        await connect_to_mongo()
        logger.info("✅ Server ready!")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

    yield

    # Shutdown
    logger.info("🛑 Shutting down...")
    try:
        await close_mongo_connection()
        logger.info("✅ Shutdown complete!")
    except Exception as e:
        logger.error(f"❌ Shutdown error: {e}")


# Create FastAPI app with lifespan
app = FastAPI(title="Docker Quiz Game API", version="1.0.0", lifespan=lifespan)

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


@app.get("/")
async def root():
    return {"message": "Docker Quiz Game API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "docker-quiz-api"}


# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
