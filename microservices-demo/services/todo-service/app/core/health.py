# app/core/health.py

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    database: str
    service: str = "todo-service"
    message: str = "Service is healthy"
