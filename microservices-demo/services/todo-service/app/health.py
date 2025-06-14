from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .database import database
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    database: str
    message: str = "Service is healthy"


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Basic health check endpoint"""
    try:
        # Check database connection
        if database.client:
            await database.client.admin.command("ping")
            db_status = "connected"
        else:
            db_status = "disconnected"

        return HealthResponse(
            status="healthy",
            database=db_status,
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "database": "error",
                "message": str(e),
            },
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
