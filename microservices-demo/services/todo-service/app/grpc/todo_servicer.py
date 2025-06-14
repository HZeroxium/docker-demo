# app/grpc/todo_servicer.py

import grpc
from datetime import datetime
from bson import ObjectId
from .. import todo_pb2_grpc, todo_pb2
from ..database import get_collection
from ..core.observability import get_logger

logger = get_logger(__name__)


class TodoServicer(todo_pb2_grpc.TodoServiceServicer):
    def __init__(self):
        self.collection = get_collection()

    async def GetTodos(self, request, context):
        """Get all todos (legacy method for backward compatibility)"""
        try:
            docs = await self.collection.find().to_list(length=None)
            todos = []
            for doc in docs:
                todo = todo_pb2.Todo(
                    id=str(doc["_id"]),
                    title=doc["title"],
                    completed=doc.get("completed", False),
                    description=doc.get("description", ""),
                    priority=doc.get("priority", "medium"),
                    user_id=doc.get("user_id", ""),
                    created_at=doc.get("created_at", datetime.utcnow()).isoformat(),
                    updated_at=doc.get("updated_at", datetime.utcnow()).isoformat(),
                )
                todos.append(todo)
            return todo_pb2.TodoList(todos=todos)
        except Exception as e:
            logger.error(f"Error getting todos: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.TodoList()

    async def GetTodo(self, request, context):
        """Get a single todo by ID"""
        try:
            doc = await self.collection.find_one({"_id": ObjectId(request.id)})
            if not doc:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Todo not found")
                return todo_pb2.TodoResponse()

            todo = todo_pb2.Todo(
                id=str(doc["_id"]),
                title=doc["title"],
                completed=doc.get("completed", False),
                description=doc.get("description", ""),
                priority=doc.get("priority", "medium"),
                user_id=doc.get("user_id", ""),
                created_at=doc.get("created_at", datetime.utcnow()).isoformat(),
                updated_at=doc.get("updated_at", datetime.utcnow()).isoformat(),
            )
            return todo_pb2.TodoResponse(todo=todo)
        except Exception as e:
            logger.error(f"Error getting todo {request.id}: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.TodoResponse()

    async def CreateTodo(self, request, context):
        """Create a new todo"""
        try:
            now = datetime.utcnow()
            todo_doc = {
                "title": request.title,
                "description": request.description,
                "completed": False,
                "priority": request.priority or "medium",
                "user_id": request.user_id,
                "created_at": now,
                "updated_at": now,
            }

            result = await self.collection.insert_one(todo_doc)

            todo = todo_pb2.Todo(
                id=str(result.inserted_id),
                title=request.title,
                completed=False,
                description=request.description,
                priority=request.priority or "medium",
                user_id=request.user_id,
                created_at=now.isoformat(),
                updated_at=now.isoformat(),
            )
            return todo_pb2.TodoResponse(todo=todo)
        except Exception as e:
            logger.error(f"Error creating todo: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.TodoResponse()

    async def UpdateTodo(self, request, context):
        """Update an existing todo"""
        try:
            update_data = {"updated_at": datetime.utcnow()}

            if request.title:
                update_data["title"] = request.title
            if request.description:
                update_data["description"] = request.description
            if hasattr(request, "completed"):
                update_data["completed"] = request.completed
            if request.priority:
                update_data["priority"] = request.priority

            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(request.id)},
                {"$set": update_data},
                return_document=True,
            )

            if result:
                todo = todo_pb2.Todo(
                    id=str(result["_id"]),
                    title=result["title"],
                    completed=result.get("completed", False),
                    description=result.get("description", ""),
                    priority=result.get("priority", "medium"),
                    user_id=result.get("user_id", ""),
                    created_at=result.get("created_at", datetime.utcnow()).isoformat(),
                    updated_at=result.get("updated_at", datetime.utcnow()).isoformat(),
                )
                return todo_pb2.TodoResponse(todo=todo)
            else:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Todo not found")
                return todo_pb2.TodoResponse()
        except Exception as e:
            logger.error(f"Error updating todo: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.TodoResponse()

    async def DeleteTodo(self, request, context):
        """Delete a todo"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(request.id)})
            return todo_pb2.DeleteTodoResponse(success=result.deleted_count > 0)
        except Exception as e:
            logger.error(f"Error deleting todo: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.DeleteTodoResponse(success=False)

    async def ListTodos(self, request, context):
        """List todos with pagination"""
        try:
            page = max(1, request.page or 1)
            limit = min(100, max(1, request.limit or 10))
            skip = (page - 1) * limit

            query = {}
            if request.user_id:
                query["user_id"] = request.user_id

            cursor = self.collection.find(query).skip(skip).limit(limit)
            docs = await cursor.to_list(length=limit)
            total = await self.collection.count_documents(query)

            todos = []
            for doc in docs:
                todo = todo_pb2.Todo(
                    id=str(doc["_id"]),
                    title=doc["title"],
                    completed=doc.get("completed", False),
                    description=doc.get("description", ""),
                    priority=doc.get("priority", "medium"),
                    user_id=doc.get("user_id", ""),
                    created_at=doc.get("created_at", datetime.utcnow()).isoformat(),
                    updated_at=doc.get("updated_at", datetime.utcnow()).isoformat(),
                )
                todos.append(todo)

            return todo_pb2.ListTodosResponse(
                todos=todos, total=total, page=page, limit=limit
            )
        except Exception as e:
            logger.error(f"Error listing todos: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.ListTodosResponse()
