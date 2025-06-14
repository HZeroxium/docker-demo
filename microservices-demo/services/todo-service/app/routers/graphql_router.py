# app/routers/graphql_router.py

import strawberry
from strawberry.fastapi import GraphQLRouter
from typing import Optional
from ..models.graphql_schemas import TodoGraph, TodoInput, TodoUpdateInput
from ..services.messaging_service import messaging_service
from ..services.todo_service import TodoService
from ..core.observability import get_logger

logger = get_logger(__name__)
todo_service = TodoService()


def convert_todo_to_graph(todo_response) -> TodoGraph:
    """Convert TodoResponse to TodoGraph"""
    return TodoGraph(
        id=todo_response.id,
        title=todo_response.title,
        description=todo_response.description,
        completed=todo_response.completed,
        priority=todo_response.priority,
        user_id=todo_response.user_id,
        created_at=todo_response.created_at,
        updated_at=todo_response.updated_at,
        due_date=None,  # Add due_date handling if needed
    )


@strawberry.type
class Query:
    @strawberry.field
    async def todos(self, user_id: Optional[str] = None) -> list[TodoGraph]:
        try:
            result = await todo_service.get_todos(page=1, limit=100, user_id=user_id)
            return [convert_todo_to_graph(todo) for todo in result.todos]
        except Exception as e:
            logger.error(f"Error fetching todos: {e}")
            return []

    @strawberry.field
    async def todo(self, id: str) -> Optional[TodoGraph]:
        try:
            todo_response = await todo_service.get_todo_by_id(id)
            if todo_response:
                return convert_todo_to_graph(todo_response)
            return None
        except Exception as e:
            logger.error(f"Error fetching todo {id}: {e}")
            return None


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_todo(self, data: TodoInput) -> TodoGraph:
        try:
            from ..models.todo import TodoCreate

            todo_create = TodoCreate(
                title=data.title,
                description=data.description,
                priority=data.priority,
                user_id=data.user_id,
            )

            todo_response = await todo_service.create_todo(todo_create)
            todo_graph = convert_todo_to_graph(todo_response)

            # Publish event
            await messaging_service.publish_todo_created(todo_graph)
            return todo_graph
        except Exception as e:
            logger.error(f"Error creating todo: {e}")
            raise

    @strawberry.mutation
    async def update_todo(self, id: str, data: TodoUpdateInput) -> Optional[TodoGraph]:
        try:
            from ..models.todo import TodoUpdate

            todo_update = TodoUpdate(
                title=data.title,
                description=data.description,
                completed=data.completed,
                priority=data.priority,
            )

            todo_response = await todo_service.update_todo(id, todo_update)
            if todo_response:
                todo_graph = convert_todo_to_graph(todo_response)
                await messaging_service.publish_todo_updated(todo_graph)
                return todo_graph
            return None
        except Exception as e:
            logger.error(f"Error updating todo {id}: {e}")
            raise

    @strawberry.mutation
    async def delete_todo(self, id: str) -> bool:
        try:
            return await todo_service.delete_todo(id)
        except Exception as e:
            logger.error(f"Error deleting todo {id}: {e}")
            return False


schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)
