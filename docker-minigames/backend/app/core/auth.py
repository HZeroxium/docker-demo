# app/core/auth.py

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def verify_admin_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> bool:
    """Verify admin API key"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if credentials.credentials != settings.ADMIN_API_KEY:
        logger.warning(
            f"Invalid admin API key attempt: {credentials.credentials[:10]}..."
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin API key",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return True


# Dependency for admin-only endpoints
AdminRequired = Depends(verify_admin_key)
