import uvicorn
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from .health import router as health_router
from .database import connect_to_mongo, close_mongo_connection, get_collection
from .observability import (
    setup_logging,
    get_logger,
    log_request,
    RequestTimer,
    get_metrics,
)

# Setup structured logging
setup_logging()
logger = get_logger(__name__)


# Pydantic models for REST API
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    user_id: str


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None


class TodoResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool
    priority: str
    user_id: str
    created_at: datetime
    updated_at: datetime


class TodoListResponse(BaseModel):
    todos: List[TodoResponse]
    total: int
    page: int
    limit: int


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
        logger.info("Connected to MongoDB successfully")
    except Exception as e:
        logger.error("Failed to connect to MongoDB", error=str(e))

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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)

if graphql_app:
    app.include_router(graphql_app, prefix="/graphql")


# REST API endpoints
@app.get("/")
async def root():
    return {"message": "Todo Service is running"}


@app.get("/todos", response_model=TodoListResponse)
async def get_todos(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user_id: Optional[str] = None,
):
    try:
        collection = get_collection()
        skip = (page - 1) * limit

        # Build query
        query = {}
        if user_id:
            query["user_id"] = user_id

        # Get todos and total count
        cursor = collection.find(query).skip(skip).limit(limit)
        todos_docs = await cursor.to_list(length=limit)
        total = await collection.count_documents(query)

        # Convert to response format
        todos = []
        for doc in todos_docs:
            todos.append(
                TodoResponse(
                    id=str(doc["_id"]),
                    title=doc["title"],
                    description=doc.get("description"),
                    completed=doc.get("completed", False),
                    priority=doc.get("priority", "medium"),
                    user_id=doc.get("user_id", ""),
                    created_at=doc.get("created_at", datetime.utcnow()),
                    updated_at=doc.get("updated_at", datetime.utcnow()),
                )
            )

        return TodoListResponse(todos=todos, total=total, page=page, limit=limit)
    except Exception as e:
        logger.error(f"Error getting todos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/todos", response_model=TodoResponse)
async def create_todo(todo: TodoCreate):
    try:
        collection = get_collection()
        now = datetime.utcnow()

        todo_doc = {
            "title": todo.title,
            "description": todo.description,
            "completed": False,
            "priority": todo.priority,
            "user_id": todo.user_id,
            "created_at": now,
            "updated_at": now,
        }

        result = await collection.insert_one(todo_doc)
        todo_doc["_id"] = result.inserted_id

        return TodoResponse(
            id=str(todo_doc["_id"]),
            title=todo_doc["title"],
            description=todo_doc["description"],
            completed=todo_doc["completed"],
            priority=todo_doc["priority"],
            user_id=todo_doc["user_id"],
            created_at=todo_doc["created_at"],
            updated_at=todo_doc["updated_at"],
        )
    except Exception as e:
        logger.error(f"Error creating todo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/todos/health", response_model=dict)
async def health_check_api():
    """Health check endpoint that matches frontend expectations"""
    try:
        collection = get_collection()
        # Test database connection
        await collection.find_one()

        return {
            "status": "healthy",
            "service": "todo-service",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected",
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "service": "todo-service",
                "timestamp": datetime.utcnow().isoformat(),
                "database": "error",
                "error": str(e),
            },
        )


@app.get("/todos/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: str):
    try:
        collection = get_collection()
        doc = await collection.find_one({"_id": ObjectId(todo_id)})

        if not doc:
            raise HTTPException(status_code=404, detail="Todo not found")

        return TodoResponse(
            id=str(doc["_id"]),
            title=doc["title"],
            description=doc.get("description"),
            completed=doc.get("completed", False),
            priority=doc.get("priority", "medium"),
            user_id=doc.get("user_id", ""),
            created_at=doc.get("created_at", datetime.utcnow()),
            updated_at=doc.get("updated_at", datetime.utcnow()),
        )
    except Exception as e:
        logger.error(f"Error getting todo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: str, todo: TodoUpdate):
    try:
        collection = get_collection()

        update_data = {"updated_at": datetime.utcnow()}
        if todo.title is not None:
            update_data["title"] = todo.title
        if todo.description is not None:
            update_data["description"] = todo.description
        if todo.completed is not None:
            update_data["completed"] = todo.completed
        if todo.priority is not None:
            update_data["priority"] = todo.priority

        doc = await collection.find_one_and_update(
            {"_id": ObjectId(todo_id)}, {"$set": update_data}, return_document=True
        )

        if not doc:
            raise HTTPException(status_code=404, detail="Todo not found")

        return TodoResponse(
            id=str(doc["_id"]),
            title=doc["title"],
            description=doc.get("description"),
            completed=doc.get("completed", False),
            priority=doc.get("priority", "medium"),
            user_id=doc.get("user_id", ""),
            created_at=doc.get("created_at", datetime.utcnow()),
            updated_at=doc.get("updated_at", datetime.utcnow()),
        )
    except Exception as e:
        logger.error(f"Error updating todo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    try:
        collection = get_collection()
        result = await collection.delete_one({"_id": ObjectId(todo_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Todo not found")

        return {"message": "Todo deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting todo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/todos/{todo_id}/toggle", response_model=TodoResponse)
async def toggle_todo(todo_id: str):
    try:
        collection = get_collection()

        # Get current todo
        doc = await collection.find_one({"_id": ObjectId(todo_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Todo not found")

        # Toggle completed status
        new_completed = not doc.get("completed", False)

        updated_doc = await collection.find_one_and_update(
            {"_id": ObjectId(todo_id)},
            {"$set": {"completed": new_completed, "updated_at": datetime.utcnow()}},
            return_document=True,
        )

        return TodoResponse(
            id=str(updated_doc["_id"]),
            title=updated_doc["title"],
            description=updated_doc.get("description"),
            completed=updated_doc["completed"],
            priority=updated_doc.get("priority", "medium"),
            user_id=updated_doc.get("user_id", ""),
            created_at=updated_doc.get("created_at", datetime.utcnow()),
            updated_at=updated_doc.get("updated_at", datetime.utcnow()),
        )
    except Exception as e:
        logger.error(f"Error toggling todo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Add health endpoint that matches the expected API format
@app.get("/health")
async def health_check_api():
    """Health check endpoint that matches frontend expectations"""
    try:
        collection = get_collection()
        # Test database connection
        await collection.find_one()

        return {
            "status": "healthy",
            "service": "todo-service",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected",
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "service": "todo-service",
                "timestamp": datetime.utcnow().isoformat(),
                "database": "error",
                "error": str(e),
            },
        )


# Add request timing middleware
@app.middleware("http")
async def add_request_timing(request: Request, call_next):
    timer = RequestTimer()
    response = await call_next(request)
    duration = timer.elapsed()

    # Log request with metrics
    log_request(
        method=request.method,
        endpoint=str(request.url.path),
        status_code=response.status_code,
        duration=duration,
    )

    return response


# Add metrics endpoint
@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return get_metrics()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
