import uvicorn
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from .health import router as health_router
from .database import connect_to_mongo, close_mongo_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize optional components
grpc_serve = None
graphql_app = None
publisher = None

# Try to import optional components
try:
    from .grpc_server import serve as grpc_serve

    logger.info("gRPC server module loaded successfully")
except ImportError as e:
    logger.warning(f"gRPC server module not available: {e}")

try:
    from .graphql_router import graphql_app

    logger.info("GraphQL router loaded successfully")
except ImportError as e:
    logger.warning(f"GraphQL router not available: {e}")

try:
    from .messaging import publisher

    logger.info("Messaging publisher loaded successfully")
except ImportError as e:
    logger.warning(f"Messaging publisher not available: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Todo Service...")

    try:
        await connect_to_mongo()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")

    if publisher:
        try:
            await publisher.connect()
        except Exception as e:
            logger.warning(f"Failed to connect to message broker: {e}")

    # Start gRPC server in background if available
    grpc_task = None
    if grpc_serve:
        try:
            grpc_task = asyncio.create_task(grpc_serve())
        except Exception as e:
            logger.warning(f"Failed to start gRPC server: {e}")

    yield

    # Shutdown
    logger.info("Shutting down Todo Service...")

    if grpc_task:
        grpc_task.cancel()
        try:
            await grpc_task
        except asyncio.CancelledError:
            pass

    if publisher:
        try:
            await publisher.close()
        except Exception as e:
            logger.warning(f"Error closing message broker: {e}")

    try:
        await close_mongo_connection()
    except Exception as e:
        logger.warning(f"Error closing database connection: {e}")


app = FastAPI(title="Todo Service", version="1.0.0", lifespan=lifespan)
app.include_router(health_router)

if graphql_app:
    app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def root():
    return {"message": "Todo Service is running"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
