import logging
import structlog
import json
from datetime import datetime
from typing import Any, Dict
from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
)
from fastapi import Response
import time

# Prometheus metrics
request_count = Counter(
    "http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"]
)

request_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
)

database_operations = Counter(
    "database_operations_total",
    "Total database operations",
    ["operation", "collection"],
)

active_connections = Gauge(
    "active_database_connections", "Number of active database connections"
)


# Custom JSON formatter for structured logging
class StructuredFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": "todo-service",
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add extra fields if present
        if hasattr(record, "extra"):
            log_entry.update(record.extra)

        return json.dumps(log_entry)


def setup_logging():
    """Configure structured logging for the service"""
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="ISO"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure standard logging
    logging.basicConfig(
        level=logging.INFO, format="%(message)s", handlers=[logging.StreamHandler()]
    )

    # Apply structured formatter to all handlers
    formatter = StructuredFormatter()
    for handler in logging.root.handlers:
        handler.setFormatter(formatter)


def get_logger(name: str):
    """Get a structured logger instance"""
    return structlog.get_logger(name)


def log_request(method: str, endpoint: str, status_code: int, duration: float):
    """Log HTTP request with metrics"""
    request_count.labels(
        method=method, endpoint=endpoint, status=str(status_code)
    ).inc()
    request_duration.labels(method=method, endpoint=endpoint).observe(duration)

    logger = get_logger("http")
    logger.info(
        "HTTP request completed",
        method=method,
        endpoint=endpoint,
        status_code=status_code,
        duration=duration,
        severity=(
            "low" if status_code < 400 else "medium" if status_code < 500 else "high"
        ),
    )


def log_database_operation(operation: str, collection: str, duration: float = None):
    """Log database operation with metrics"""
    database_operations.labels(operation=operation, collection=collection).inc()

    logger = get_logger("database")
    log_data = {
        "database_operation": operation,
        "collection": collection,
        "severity": "low",
    }

    if duration:
        log_data["duration"] = duration

    logger.info("Database operation completed", **log_data)


def get_metrics():
    """Return Prometheus metrics"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


# Request timing middleware context
class RequestTimer:
    def __init__(self):
        self.start_time = time.time()

    def elapsed(self):
        return time.time() - self.start_time
