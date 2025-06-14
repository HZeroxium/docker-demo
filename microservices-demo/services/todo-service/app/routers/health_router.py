# app/routers/health_router.py

from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..core.health import HealthResponse
from ..database import database
from ..core.observability import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["health"])


@router.get("/todos/health", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check database connection
        if database.client:
            await database.client.admin.command("ping")
            db_status = "connected"
        else:
            db_status = "disconnected"

        return HealthResponse(
            status="healthy",
            service="todo-service",
            timestamp=datetime.utcnow().isoformat(),
            database=db_status,
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=HealthResponse(
                status="unhealthy",
                service="todo-service",
                timestamp=datetime.utcnow().isoformat(),
                database="error",
                error=str(e),
            ),
        )


@router.get("/health/ready")
async def readiness_check():
    """Kubernetes readiness probe"""
    try:
        if not database.client:
            raise Exception("Database client not initialized")
        await database.client.admin.command("ping")
        return {"status": "ready"}
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(status_code=503, detail="Not ready")


@router.get("/health/live")
async def liveness_check():
    """Kubernetes liveness probe"""
    return {"status": "alive"}


@router.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Todo Service is running! 🚀"}
