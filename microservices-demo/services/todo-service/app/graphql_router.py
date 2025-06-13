import strawberry
from strawberry.fastapi import GraphQLRouter
from .schemas import TodoGraph, TodoInput, TodoUpdateInput
from .messaging import publish_todo_created, publish_todo_updated
from .database import get_collection
from bson import ObjectId
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@strawberry.type
class Query:
    @strawberry.field
    async def todos(self) -> list[TodoGraph]:
        try:
            collection = get_collection()
            docs = await collection.find().to_list(length=None)
            return [
                TodoGraph(id=str(d["_id"]), title=d["title"], completed=d["completed"])
                for d in docs
            ]
        except Exception as e:
            logger.error(f"Error fetching todos: {e}")
            return []

    @strawberry.field
    async def todo(self, id: str) -> Optional[TodoGraph]:
        try:
            collection = get_collection()
            doc = await collection.find_one({"_id": ObjectId(id)})
            if doc:
                return TodoGraph(
                    id=str(doc["_id"]), title=doc["title"], completed=doc["completed"]
                )
            return None
        except Exception as e:
            logger.error(f"Error fetching todo {id}: {e}")
            return None


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_todo(self, data: TodoInput) -> TodoGraph:
        try:
            collection = get_collection()
            result = await collection.insert_one(
                {"title": data.title, "completed": False}
            )
            todo = TodoGraph(
                id=str(result.inserted_id), title=data.title, completed=False
            )
            await publish_todo_created(todo)
            return todo
        except Exception as e:
            logger.error(f"Error creating todo: {e}")
            raise

    @strawberry.mutation
    async def update_todo(self, id: str, data: TodoUpdateInput) -> Optional[TodoGraph]:
        try:
            collection = get_collection()
            update_data = {}
            if data.title is not None:
                update_data["title"] = data.title
            if data.completed is not None:
                update_data["completed"] = data.completed

            if not update_data:
                return None

            result = await collection.find_one_and_update(
                {"_id": ObjectId(id)}, {"$set": update_data}, return_document=True
            )

            if result:
                todo = TodoGraph(
                    id=str(result["_id"]),
                    title=result["title"],
                    completed=result["completed"],
                )
                await publish_todo_updated(todo)
                return todo
            return None
        except Exception as e:
            logger.error(f"Error updating todo {id}: {e}")
            raise

    @strawberry.mutation
    async def delete_todo(self, id: str) -> bool:
        try:
            collection = get_collection()
            result = await collection.delete_one({"_id": ObjectId(id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting todo {id}: {e}")
            return False


schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)
