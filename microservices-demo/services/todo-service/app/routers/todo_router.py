# app/routers/todo_router.py

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..models.todo import TodoCreate, TodoUpdate, TodoResponse, TodoListResponse
from ..services.todo_service import TodoService
from ..core.observability import get_logger, log_todo_operation, RequestTimer

logger = get_logger(__name__)
router = APIRouter(prefix="/todos", tags=["todos"])

# Initialize service
todo_service = TodoService()


@router.get("", response_model=TodoListResponse)
async def get_todos(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
):
    """Get paginated todos with optional user filtering"""
    with RequestTimer() as timer:
        try:
            logger.info(
                "Getting todos",
                page=page,
                limit=limit,
                user_id=user_id,
                event_type="api_request",
            )

            result = await todo_service.get_todos(page, limit, user_id)

            log_todo_operation("list", user_id=user_id, status="success")

            logger.info(
                "Todos retrieved successfully",
                total=result.total,
                returned=len(result.todos),
                page=page,
                duration=timer.elapsed(),
            )

            return result

        except Exception as e:
            log_todo_operation("list", user_id=user_id, status="error")
            logger.error(f"Error getting todos: {e}", extra={"error": str(e)})
            raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=TodoResponse)
async def create_todo(todo: TodoCreate):
    """Create a new todo"""
    with RequestTimer() as timer:
        try:
            logger.info(
                "Creating todo",
                title=todo.title,
                user_id=todo.user_id,
                priority=todo.priority,
            )

            result = await todo_service.create_todo(todo)

            log_todo_operation(
                "create",
                todo_id=result.id,
                user_id=todo.user_id,
                status="success",
            )

            logger.info(
                "Todo created successfully", todo_id=result.id, duration=timer.elapsed()
            )

            return result

        except Exception as e:
            log_todo_operation("create", user_id=todo.user_id, status="error")
            logger.error(f"Error creating todo: {e}", extra={"error": str(e)})
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: str):
    """Get a specific todo by ID"""
    with RequestTimer() as timer:
        try:
            logger.info("Getting todo by ID", todo_id=todo_id)

            todo = await todo_service.get_todo_by_id(todo_id)
            if not todo:
                log_todo_operation("get", todo_id=todo_id, status="not_found")
                raise HTTPException(status_code=404, detail="Todo not found")

            log_todo_operation("get", todo_id=todo_id, status="success")

            logger.info(
                "Todo retrieved successfully", todo_id=todo_id, duration=timer.elapsed()
            )

            return todo

        except HTTPException:
            raise
        except Exception as e:
            log_todo_operation("get", todo_id=todo_id, status="error")
            logger.error(f"Error getting todo: {e}", extra={"error": str(e)})
            raise HTTPException(status_code=500, detail=str(e))


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: str, todo: TodoUpdate):
    """Update a todo"""
    with RequestTimer() as timer:
        try:
            logger.info("Updating todo", todo_id=todo_id)

            updated_todo = await todo_service.update_todo(todo_id, todo)
            if not updated_todo:
                log_todo_operation("update", todo_id=todo_id, status="not_found")
                raise HTTPException(status_code=404, detail="Todo not found")

            log_todo_operation("update", todo_id=todo_id, status="success")

            logger.info(
                "Todo updated successfully", todo_id=todo_id, duration=timer.elapsed()
            )

            return updated_todo

        except HTTPException:
            raise
        except Exception as e:
            log_todo_operation("update", todo_id=todo_id, status="error")
            logger.error(f"Error updating todo: {e}", extra={"error": str(e)})
            raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{todo_id}")
async def delete_todo(todo_id: str):
    """Delete a todo"""
    with RequestTimer() as timer:
        try:
            logger.info("Deleting todo", todo_id=todo_id)

            deleted = await todo_service.delete_todo(todo_id)
            if not deleted:
                log_todo_operation("delete", todo_id=todo_id, status="not_found")
                raise HTTPException(status_code=404, detail="Todo not found")

            log_todo_operation("delete", todo_id=todo_id, status="success")

            logger.info(
                "Todo deleted successfully", todo_id=todo_id, duration=timer.elapsed()
            )

            return {"message": "Todo deleted successfully"}

        except HTTPException:
            raise
        except Exception as e:
            log_todo_operation("delete", todo_id=todo_id, status="error")
            logger.error(f"Error deleting todo: {e}", extra={"error": str(e)})
            raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
async def toggle_todo(todo_id: str):
    """Toggle todo completion status"""
    with RequestTimer() as timer:
        try:
            logger.info("Toggling todo", todo_id=todo_id)

            todo = await todo_service.toggle_todo_completion(todo_id)
            if not todo:
                log_todo_operation("toggle", todo_id=todo_id, status="not_found")
                raise HTTPException(status_code=404, detail="Todo not found")

            log_todo_operation("toggle", todo_id=todo_id, status="success")

            logger.info(
                "Todo toggled successfully",
                todo_id=todo_id,
                completed=todo.completed,
                duration=timer.elapsed(),
            )

            return todo

        except HTTPException:
            raise
        except Exception as e:
            log_todo_operation("toggle", todo_id=todo_id, status="error")
            logger.error(f"Error toggling todo: {e}", extra={"error": str(e)})
            raise HTTPException(status_code=500, detail=str(e))
