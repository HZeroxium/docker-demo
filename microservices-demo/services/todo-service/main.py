import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import strawberry
from strawberry.fastapi import GraphQLRouter
import aio_pika
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
mongodb_client = None
database = None

# RabbitMQ connection
rabbitmq_connection = None
rabbitmq_channel = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global mongodb_client, database, rabbitmq_connection, rabbitmq_channel

    # Connect to MongoDB
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://todo-mongo:27017")
    mongodb_client = AsyncIOMotorClient(mongodb_url)
    database = mongodb_client.todos
    logger.info("Connected to MongoDB")

    # Connect to RabbitMQ
    try:
        rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
        rabbitmq_connection = await aio_pika.connect_robust(rabbitmq_url)
        rabbitmq_channel = await rabbitmq_connection.channel()
        await rabbitmq_channel.declare_exchange(
            "todo_exchange", aio_pika.ExchangeType.TOPIC
        )
        logger.info("Connected to RabbitMQ")
    except Exception as e:
        logger.error(f"Failed to connect to RabbitMQ: {e}")

    yield

    # Shutdown
    if mongodb_client:
        mongodb_client.close()
    if rabbitmq_connection:
        await rabbitmq_connection.close()


app = FastAPI(
    title="Todo Service",
    description="A comprehensive todo management service with FastAPI, GraphQL, and gRPC",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: bool = False
    priority: str = Field("medium", regex="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    user_id: str = Field(..., min_length=1)


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None
    priority: Optional[str] = Field(None, regex="^(low|medium|high)$")
    due_date: Optional[datetime] = None


class TodoResponse(TodoBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedTodoResponse(BaseModel):
    items: List[TodoResponse]
    total: int
    page: int
    limit: int


# Helper functions
def todo_helper(todo) -> dict:
    return {
        "id": str(todo["_id"]),
        "title": todo["title"],
        "description": todo.get("description"),
        "completed": todo["completed"],
        "priority": todo["priority"],
        "due_date": todo.get("due_date"),
        "user_id": todo["user_id"],
        "created_at": todo["created_at"],
        "updated_at": todo["updated_at"],
    }


async def publish_todo_event(event_type: str, todo_data: dict):
    """Publish todo events to RabbitMQ"""
    if rabbitmq_channel:
        try:
            message = {
                "event_type": event_type,
                "todo": todo_data,
                "timestamp": datetime.utcnow().isoformat(),
            }
            await rabbitmq_channel.default_exchange.publish(
                aio_pika.Message(json.dumps(message).encode()),
                routing_key="todo.events",
            )
            logger.info(f"Published event: {event_type}")
        except Exception as e:
            logger.error(f"Failed to publish event: {e}")


# REST API endpoints
@app.get("/")
async def root():
    return {"message": "Todo Service is running! 🚀"}


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "todo-service",
        "version": "1.0.0",
    }


@app.post("/todos", response_model=TodoResponse)
async def create_todo(todo: TodoCreate):
    todo_dict = todo.dict()
    todo_dict["created_at"] = datetime.utcnow()
    todo_dict["updated_at"] = datetime.utcnow()

    result = await database.items.insert_one(todo_dict)
    created_todo = await database.items.find_one({"_id": result.inserted_id})

    todo_response = todo_helper(created_todo)
    await publish_todo_event("todo.created", todo_response)

    return todo_response


@app.get("/todos", response_model=PaginatedTodoResponse)
async def get_todos(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user_id: Optional[str] = Query(None),
    completed: Optional[bool] = Query(None),
    priority: Optional[str] = Query(None),
):
    skip = (page - 1) * limit
    query = {}

    if user_id:
        query["user_id"] = user_id
    if completed is not None:
        query["completed"] = completed
    if priority:
        query["priority"] = priority

    todos_cursor = (
        database.items.find(query).skip(skip).limit(limit).sort("created_at", -1)
    )
    todos = await todos_cursor.to_list(length=limit)
    total = await database.items.count_documents(query)

    return {
        "items": [todo_helper(todo) for todo in todos],
        "total": total,
        "page": page,
        "limit": limit,
    }


@app.get("/todos/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: str):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail="Invalid todo ID")

    todo = await database.items.find_one({"_id": ObjectId(todo_id)})
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    return todo_helper(todo)


@app.put("/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: str, todo_update: TodoUpdate):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail="Invalid todo ID")

    update_data = {k: v for k, v in todo_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow()

    result = await database.items.update_one(
        {"_id": ObjectId(todo_id)}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")

    updated_todo = await database.items.find_one({"_id": ObjectId(todo_id)})
    todo_response = todo_helper(updated_todo)
    await publish_todo_event("todo.updated", todo_response)

    return todo_response


@app.patch("/todos/{todo_id}/toggle", response_model=TodoResponse)
async def toggle_todo(todo_id: str):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail="Invalid todo ID")

    todo = await database.items.find_one({"_id": ObjectId(todo_id)})
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    new_status = not todo["completed"]
    await database.items.update_one(
        {"_id": ObjectId(todo_id)},
        {"$set": {"completed": new_status, "updated_at": datetime.utcnow()}},
    )

    updated_todo = await database.items.find_one({"_id": ObjectId(todo_id)})
    todo_response = todo_helper(updated_todo)
    await publish_todo_event("todo.toggled", todo_response)

    return todo_response


@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    if not ObjectId.is_valid(todo_id):
        raise HTTPException(status_code=400, detail="Invalid todo ID")

    todo = await database.items.find_one({"_id": ObjectId(todo_id)})
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    await database.items.delete_one({"_id": ObjectId(todo_id)})
    await publish_todo_event("todo.deleted", todo_helper(todo))

    return {"message": "Todo deleted successfully"}


@app.get("/todos/stats/overview")
async def get_todo_stats():
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "completed": {"$sum": {"$cond": ["$completed", 1, 0]}},
                "pending": {"$sum": {"$cond": ["$completed", 0, 1]}},
                "high_priority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "high"]}, 1, 0]}
                },
                "medium_priority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "medium"]}, 1, 0]}
                },
                "low_priority": {
                    "$sum": {"$cond": [{"$eq": ["$priority", "low"]}, 1, 0]}
                },
            }
        }
    ]

    result = await database.items.aggregate(pipeline).to_list(length=1)
    if not result:
        return {
            "total": 0,
            "completed": 0,
            "pending": 0,
            "by_priority": {"high": 0, "medium": 0, "low": 0},
        }

    stats = result[0]
    return {
        "total": stats["total"],
        "completed": stats["completed"],
        "pending": stats["pending"],
        "by_priority": {
            "high": stats["high_priority"],
            "medium": stats["medium_priority"],
            "low": stats["low_priority"],
        },
    }


# GraphQL Schema
@strawberry.type
class Todo:
    id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: str
    due_date: Optional[datetime]
    user_id: str
    created_at: datetime
    updated_at: datetime


@strawberry.input
class TodoInput:
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    user_id: str


@strawberry.input
class TodoUpdateInput:
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None


@strawberry.type
class Query:
    @strawberry.field
    async def todos(
        self, page: int = 1, limit: int = 10, user_id: Optional[str] = None
    ) -> List[Todo]:
        skip = (page - 1) * limit
        query = {}
        if user_id:
            query["user_id"] = user_id

        todos_cursor = database.items.find(query).skip(skip).limit(limit)
        todos = await todos_cursor.to_list(length=limit)

        return [
            Todo(
                id=str(todo["_id"]),
                title=todo["title"],
                description=todo.get("description"),
                completed=todo["completed"],
                priority=todo["priority"],
                due_date=todo.get("due_date"),
                user_id=todo["user_id"],
                created_at=todo["created_at"],
                updated_at=todo["updated_at"],
            )
            for todo in todos
        ]

    @strawberry.field
    async def todo(self, id: str) -> Optional[Todo]:
        if not ObjectId.is_valid(id):
            return None

        todo = await database.items.find_one({"_id": ObjectId(id)})
        if not todo:
            return None

        return Todo(
            id=str(todo["_id"]),
            title=todo["title"],
            description=todo.get("description"),
            completed=todo["completed"],
            priority=todo["priority"],
            due_date=todo.get("due_date"),
            user_id=todo["user_id"],
            created_at=todo["created_at"],
            updated_at=todo["updated_at"],
        )


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_todo(self, todo: TodoInput) -> Todo:
        todo_dict = {
            "title": todo.title,
            "description": todo.description,
            "completed": False,
            "priority": todo.priority,
            "due_date": todo.due_date,
            "user_id": todo.user_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = await database.items.insert_one(todo_dict)
        created_todo = await database.items.find_one({"_id": result.inserted_id})

        return Todo(
            id=str(created_todo["_id"]),
            title=created_todo["title"],
            description=created_todo.get("description"),
            completed=created_todo["completed"],
            priority=created_todo["priority"],
            due_date=created_todo.get("due_date"),
            user_id=created_todo["user_id"],
            created_at=created_todo["created_at"],
            updated_at=created_todo["updated_at"],
        )


schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)

app.include_router(graphql_app, prefix="/graphql")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
