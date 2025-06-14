# app/models/todo.py

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


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


class Todo:
    """Internal todo model for business logic"""

    def __init__(self, **kwargs):
        self.id = kwargs.get("id")
        self.title = kwargs.get("title")
        self.description = kwargs.get("description")
        self.completed = kwargs.get("completed", False)
        self.priority = kwargs.get("priority", "medium")
        self.user_id = kwargs.get("user_id")
        self.created_at = kwargs.get("created_at", datetime.utcnow())
        self.updated_at = kwargs.get("updated_at", datetime.utcnow())

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=str(data.get("_id", "")),
            title=data.get("title"),
            description=data.get("description"),
            completed=data.get("completed", False),
            priority=data.get("priority", "medium"),
            user_id=data.get("user_id", ""),
            created_at=data.get("created_at", datetime.utcnow()),
            updated_at=data.get("updated_at", datetime.utcnow()),
        )

    def to_response(self) -> TodoResponse:
        return TodoResponse(
            id=self.id,
            title=self.title,
            description=self.description,
            completed=self.completed,
            priority=self.priority,
            user_id=self.user_id,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )
