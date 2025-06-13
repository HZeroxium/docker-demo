import uvicorn
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from .health import router as health_router
from .graphql_router import graphql_app
from .grpc_server import serve as grpc_serve
from .database import connect_to_mongo, close_mongo_connection
from .messaging import publisher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Todo Service...")
    await connect_to_mongo()
    await publisher.connect()

    # Start gRPC server in background
    grpc_task = asyncio.create_task(grpc_serve())

    yield

    # Shutdown
    logger.info("Shutting down Todo Service...")
    grpc_task.cancel()
    await publisher.close()
    await close_mongo_connection()


app = FastAPI(title="Todo Service", version="1.0.0", lifespan=lifespan)
app.include_router(health_router)
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def root():
    return {"message": "Todo Service is running"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
