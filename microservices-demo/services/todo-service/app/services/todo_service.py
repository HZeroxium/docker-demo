# app/services/todo_service.py

from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorCollection
from ..models.todo import Todo, TodoCreate, TodoUpdate, TodoResponse, TodoListResponse
from ..core.observability import get_logger, log_database_operation

logger = get_logger(__name__)


class TodoService:
    """
    Todo business logic service with proper dependency injection.
    Uses lazy initialization to avoid database connection issues at import time.
    """

    def __init__(self, collection: Optional[AsyncIOMotorCollection] = None):
        """
        Initialize TodoService with optional collection dependency.
        If no collection is provided, it will be injected later.
        """
        self._collection = collection
        logger.debug(
            "TodoService initialized", extra={"has_collection": collection is not None}
        )

    def set_collection(self, collection: AsyncIOMotorCollection):
        """Set the database collection (dependency injection)"""
        self._collection = collection
        logger.debug("Database collection injected into TodoService")

    @property
    def collection(self) -> AsyncIOMotorCollection:
        """Get the database collection with proper error handling"""
        if self._collection is None:
            # Import here to avoid circular imports
            from ..database import get_collection

            try:
                self._collection = get_collection()
                logger.debug("Collection obtained on-demand")
            except Exception as e:
                logger.error(f"Failed to get database collection: {e}")
                raise RuntimeError(
                    "Database collection not available. Ensure database is connected."
                ) from e
        return self._collection

    async def get_todos(
        self, page: int = 1, limit: int = 10, user_id: Optional[str] = None
    ) -> TodoListResponse:
        """Get paginated todos with optional user filtering"""
        try:
            skip = (page - 1) * limit
            query = {}
            if user_id:
                query["user_id"] = user_id

            # Get todos and total count
            cursor = self.collection.find(query).skip(skip).limit(limit)
            todos_docs = await cursor.to_list(length=limit)
            total = await self.collection.count_documents(query)

            log_database_operation("find", "todos", 0.1)

            # Convert to response format
            todos = [Todo.from_dict(doc).to_response() for doc in todos_docs]

            logger.info(
                "Retrieved todos successfully",
                extra={
                    "total_count": total,
                    "page": page,
                    "limit": limit,
                    "user_id": user_id,
                    "returned_count": len(todos),
                },
            )

            return TodoListResponse(todos=todos, total=total, page=page, limit=limit)
        except Exception as e:
            logger.error(
                f"Error getting todos",
                extra={
                    "error": str(e),
                    "page": page,
                    "limit": limit,
                    "user_id": user_id,
                },
            )
            raise

    async def get_todo_by_id(self, todo_id: str) -> Optional[TodoResponse]:
        """Get a single todo by ID"""
        try:
            doc = await self.collection.find_one({"_id": ObjectId(todo_id)})
            log_database_operation("findOne", "todos", 0.05)

            if not doc:
                logger.info(f"Todo not found", extra={"todo_id": todo_id})
                return None

            logger.info(f"Retrieved todo successfully", extra={"todo_id": todo_id})
            return Todo.from_dict(doc).to_response()
        except Exception as e:
            logger.error(
                f"Error getting todo", extra={"error": str(e), "todo_id": todo_id}
            )
            raise

    async def create_todo(self, todo_data: TodoCreate) -> TodoResponse:
        """Create a new todo"""
        try:
            now = datetime.utcnow()
            todo_doc = {
                "title": todo_data.title,
                "description": todo_data.description,
                "completed": False,
                "priority": todo_data.priority,
                "user_id": todo_data.user_id,
                "created_at": now,
                "updated_at": now,
            }

            result = await self.collection.insert_one(todo_doc)
            todo_doc["_id"] = result.inserted_id

            log_database_operation("insert", "todos", 0.1)

            logger.info(
                "Created todo successfully",
                extra={
                    "todo_id": str(result.inserted_id),
                    "title": todo_data.title,
                    "user_id": todo_data.user_id,
                },
            )

            return Todo.from_dict(todo_doc).to_response()
        except Exception as e:
            logger.error(
                f"Error creating todo",
                extra={
                    "error": str(e),
                    "title": todo_data.title,
                    "user_id": todo_data.user_id,
                },
            )
            raise

    async def update_todo(
        self, todo_id: str, todo_data: TodoUpdate
    ) -> Optional[TodoResponse]:
        """Update an existing todo"""
        try:
            update_data = {"updated_at": datetime.utcnow()}

            # Build update data only for provided fields
            update_fields = []
            if todo_data.title is not None:
                update_data["title"] = todo_data.title
                update_fields.append("title")
            if todo_data.description is not None:
                update_data["description"] = todo_data.description
                update_fields.append("description")
            if todo_data.completed is not None:
                update_data["completed"] = todo_data.completed
                update_fields.append("completed")
            if todo_data.priority is not None:
                update_data["priority"] = todo_data.priority
                update_fields.append("priority")

            doc = await self.collection.find_one_and_update(
                {"_id": ObjectId(todo_id)}, {"$set": update_data}, return_document=True
            )

            log_database_operation("update", "todos", 0.1)

            if not doc:
                logger.info(f"Todo not found for update", extra={"todo_id": todo_id})
                return None

            logger.info(
                "Updated todo successfully",
                extra={"todo_id": todo_id, "updated_fields": update_fields},
            )

            return Todo.from_dict(doc).to_response()
        except Exception as e:
            logger.error(
                f"Error updating todo", extra={"error": str(e), "todo_id": todo_id}
            )
            raise

    async def delete_todo(self, todo_id: str) -> bool:
        """Delete a todo"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(todo_id)})
            log_database_operation("delete", "todos", 0.05)

            success = result.deleted_count > 0

            if success:
                logger.info(f"Deleted todo successfully", extra={"todo_id": todo_id})
            else:
                logger.info(f"Todo not found for deletion", extra={"todo_id": todo_id})

            return success
        except Exception as e:
            logger.error(
                f"Error deleting todo", extra={"error": str(e), "todo_id": todo_id}
            )
            raise

    async def toggle_todo_completion(self, todo_id: str) -> Optional[TodoResponse]:
        """Toggle todo completion status"""
        try:
            # Get current todo
            doc = await self.collection.find_one({"_id": ObjectId(todo_id)})
            if not doc:
                logger.info(f"Todo not found for toggle", extra={"todo_id": todo_id})
                return None

            # Toggle completed status
            current_status = doc.get("completed", False)
            new_completed = not current_status

            updated_doc = await self.collection.find_one_and_update(
                {"_id": ObjectId(todo_id)},
                {"$set": {"completed": new_completed, "updated_at": datetime.utcnow()}},
                return_document=True,
            )

            log_database_operation("update", "todos", 0.1)

            logger.info(
                "Toggled todo completion successfully",
                extra={
                    "todo_id": todo_id,
                    "previous_status": current_status,
                    "new_status": new_completed,
                },
            )

            return Todo.from_dict(updated_doc).to_response()
        except Exception as e:
            logger.error(
                f"Error toggling todo completion",
                extra={"error": str(e), "todo_id": todo_id},
            )
            raise


# Global service instance factory
def get_todo_service() -> TodoService:
    """
    Factory function to get TodoService instance.
    This implements a simple service locator pattern.
    """
    return TodoService()
