import strawberry
from typing import Optional


@strawberry.type
class TodoGraph:
    id: str
    title: str
    completed: bool = False


@strawberry.input
class TodoInput:
    title: str


@strawberry.input
class TodoUpdateInput:
    title: Optional[str] = None
    completed: Optional[bool] = None
