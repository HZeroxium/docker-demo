# app/models/graphql_schemas.py

import strawberry
from typing import Optional
from datetime import datetime


@strawberry.type
class TodoGraph:
    id: str
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: str = "medium"
    due_date: Optional[datetime] = None
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
class TodoResponse:
    todo: TodoGraph
    message: str
    success: bool


@strawberry.type
class TodoListResponse:
    todos: list[TodoGraph]
    total: int
    page: int
    limit: int
