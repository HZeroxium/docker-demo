# app/core/observability.py

import logging
import structlog
import json
import time
from datetime import datetime
from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
    REGISTRY,
)
from fastapi import Response

# Enhanced Prometheus metrics with more detailed labels
request_count = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status", "service"],
)

request_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint", "service"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
)

database_operations = Counter(
    "database_operations_total",
    "Total database operations",
    ["operation", "collection", "status"],
)

database_duration = Histogram(
    "database_operation_duration_seconds",
    "Database operation duration in seconds",
    ["operation", "collection"],
    buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0),
)

active_connections = Gauge(
    "active_database_connections", "Number of active database connections"
)

todo_operations = Counter(
    "todo_operations_total", "Total todo operations", ["operation", "status"]
)


# Enhanced structured logging with Elasticsearch compatibility
class ElasticsearchFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "@timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service_name": "todo-service",
            "service_version": "1.0.0",
            "environment": "docker-demo",
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "thread": record.thread,
            "process": record.process,
        }

        # Add extra fields if present
        if hasattr(record, "extra"):
            log_entry.update(record.extra)

        # Add exception information if present
        if record.exc_info:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "stack_trace": self.formatException(record.exc_info),
            }

        return json.dumps(log_entry, default=str)


def setup_logging():
    """Configure enhanced structured logging for the service"""
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

    # Configure standard logging with Elasticsearch formatter
    logging.basicConfig(
        level=logging.INFO, format="%(message)s", handlers=[logging.StreamHandler()]
    )

    # Apply Elasticsearch formatter to all handlers
    formatter = ElasticsearchFormatter()
    for handler in logging.root.handlers:
        handler.setFormatter(formatter)


def get_logger(name: str):
    """Get a structured logger instance"""
    return structlog.get_logger(name)


def log_request(method: str, endpoint: str, status_code: int, duration: float, **extra):
    """Enhanced HTTP request logging with metrics"""
    # Record Prometheus metrics
    request_count.labels(
        method=method,
        endpoint=endpoint,
        status=str(status_code),
        service="todo-service",
    ).inc()

    request_duration.labels(
        method=method, endpoint=endpoint, service="todo-service"
    ).observe(duration)

    # Structured logging
    logger = get_logger("http")
    severity = "low" if status_code < 400 else "medium" if status_code < 500 else "high"

    log_data = {
        "http_method": method,
        "http_endpoint": endpoint,
        "http_status": status_code,
        "response_time": duration,
        "severity": severity,
        "event_type": "http_request",
        **extra,
    }

    logger.info("HTTP request completed", **log_data)


def log_database_operation(
    operation: str, collection: str, duration: float = None, status: str = "success"
):
    """Enhanced database operation logging with metrics"""
    # Record Prometheus metrics
    database_operations.labels(
        operation=operation, collection=collection, status=status
    ).inc()

    if duration:
        database_duration.labels(operation=operation, collection=collection).observe(
            duration
        )

    # Structured logging
    logger = get_logger("database")
    log_data = {
        "database_operation": operation,
        "collection": collection,
        "severity": "low",
        "event_type": "database_operation",
        "status": status,
    }

    if duration:
        log_data["duration"] = duration

    logger.info("Database operation completed", **log_data)


def log_todo_operation(
    operation: str, todo_id: str = None, user_id: str = None, status: str = "success"
):
    """Log todo-specific operations for business metrics"""
    todo_operations.labels(operation=operation, status=status).inc()

    logger = get_logger("business")
    log_data = {
        "todo_operation": operation,
        "status": status,
        "event_type": "todo_operation",
        "severity": "low",
    }

    if todo_id:
        log_data["todo_id"] = todo_id
    if user_id:
        log_data["user_id"] = user_id

    logger.info("Todo operation completed", **log_data)


def get_metrics():
    """Return enhanced Prometheus metrics"""
    return Response(generate_latest(REGISTRY), media_type=CONTENT_TYPE_LATEST)


# Request timing context manager
class RequestTimer:
    def __init__(self):
        self.start_time = time.time()

    def elapsed(self):
        return time.time() - self.start_time

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
