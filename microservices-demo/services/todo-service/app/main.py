# app/main.py
import uvicorn
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Import observability and core functionality
from .core.observability import (
    setup_logging,
    get_logger,
    log_request,
    RequestTimer,
    get_metrics,
)

# Import database functionality
from .database import connect_to_mongo, close_mongo_connection

# Import routers - all business logic is now properly separated
from .routers import todo_router, health_router, graphql_app

# Import services
from .services.messaging_service import messaging_service

# Setup structured logging
setup_logging()
logger = get_logger(__name__)

# Initialize optional gRPC server
grpc_serve = None

# Try to import optional gRPC server
try:
    from .grpc.server import serve as grpc_serve

    logger.info("gRPC server module loaded successfully")
except ImportError as e:
    logger.warning(f"gRPC server module not available: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager for startup and shutdown events.
    Handles all service initialization and cleanup in proper order.
    """
    # Startup sequence
    logger.info("Starting Todo Service...")

    # 1. Connect to MongoDB
    try:
        await connect_to_mongo()
        logger.info("Connected to MongoDB successfully")
    except Exception as e:
        logger.error("Failed to connect to MongoDB", extra={"error": str(e)})
        # Continue startup even if DB connection fails (for health checks)

    # 2. Connect to messaging service (RabbitMQ)
    try:
        await messaging_service.connect()
        logger.info("Connected to messaging service successfully")
    except Exception as e:
        logger.warning(f"Failed to connect to message broker: {e}")
        # Non-critical for basic functionality

    # 3. Start gRPC server in background if available
    grpc_task = None
    if grpc_serve:
        try:
            grpc_task = asyncio.create_task(grpc_serve())
            logger.info("gRPC server started successfully")
        except Exception as e:
            logger.warning(f"Failed to start gRPC server: {e}")

    # Service is now ready
    logger.info("Todo Service startup completed successfully")

    yield

    # Shutdown sequence (reverse order)
    logger.info("Shutting down Todo Service...")

    # 1. Stop gRPC server
    if grpc_task:
        grpc_task.cancel()
        try:
            await grpc_task
        except asyncio.CancelledError:
            logger.info("gRPC server stopped")

    # 2. Close messaging connections
    try:
        await messaging_service.close()
        logger.info("Messaging service connection closed")
    except Exception as e:
        logger.warning(f"Error closing message broker: {e}")

    # 3. Close database connections
    try:
        await close_mongo_connection()
        logger.info("Database connection closed")
    except Exception as e:
        logger.warning(f"Error closing database connection: {e}")

    logger.info("Todo Service shutdown completed")


# Initialize FastAPI application with comprehensive configuration
app = FastAPI(
    title="Todo Service",
    version="1.0.0",
    description="A comprehensive todo management microservice with REST, GraphQL, and gRPC APIs",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend development server
        "http://localhost:8000",  # API Gateway
        "http://frontend:3000",  # Docker container
        "http://kong:8000",  # Kong API Gateway
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Request timing and observability middleware
@app.middleware("http")
async def add_request_timing_and_logging(request: Request, call_next):
    """
    Middleware to add request timing, logging, and metrics collection.
    This provides comprehensive observability for all HTTP requests.
    """
    timer = RequestTimer()

    # Log incoming request
    logger.info(
        "Incoming request",
        extra={
            "method": request.method,
            "url": str(request.url),
            "headers": dict(request.headers),
            "client": request.client.host if request.client else "unknown",
        },
    )

    try:
        response = await call_next(request)
        duration = timer.elapsed()

        # Log and record metrics for successful requests
        log_request(
            method=request.method,
            endpoint=str(request.url.path),
            status_code=response.status_code,
            duration=duration,
        )

        # Add response timing header
        response.headers["X-Response-Time"] = f"{duration:.4f}s"

        return response

    except Exception as e:
        duration = timer.elapsed()

        # Log errors
        logger.error(
            "Request failed",
            extra={
                "method": request.method,
                "url": str(request.url),
                "duration": duration,
                "error": str(e),
            },
        )

        # Re-raise the exception to let FastAPI handle it
        raise


# Include all routers with proper prefixes and tags
# Health endpoints (no prefix for root health checks)
app.include_router(
    health_router,
    tags=["Health"],
)

# Todo API endpoints
app.include_router(
    todo_router,
    tags=["Todos"],
)

# GraphQL endpoint
app.include_router(
    graphql_app,
    prefix="/graphql",
    tags=["GraphQL"],
)


# Root endpoint for service identification
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint providing service information and status.
    """
    return {
        "service": "todo-service",
        "version": "1.0.0",
        "status": "running",
        "message": "Todo Service is running! 🚀",
        "endpoints": {
            "rest": "/todos",
            "graphql": "/graphql",
            "health": "/health",
            "metrics": "/metrics",
            "docs": "/docs",
        },
    }


# Metrics endpoint for Prometheus monitoring
@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """
    Prometheus metrics endpoint for monitoring and alerting.
    Returns metrics in Prometheus format.
    """
    return get_metrics()


# Application entry point for development
if __name__ == "__main__":
    logger.info("Starting Todo Service in development mode")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_config=None,  # Use our structured logging
    )
