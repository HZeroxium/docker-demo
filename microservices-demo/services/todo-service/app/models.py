from pydantic import BaseModel, Field


class TodoItemInDB(BaseModel):
    id: str = Field(alias="_id")
    title: str
    completed: bool = False


class TodoCreate(BaseModel):
    title: str
