import grpc
from concurrent import futures
import logging
from . import todo_pb2_grpc, todo_pb2
from .database import get_collection
from bson import ObjectId

logger = logging.getLogger(__name__)


class TodoServicer(todo_pb2_grpc.TodoServiceServicer):
    def __init__(self):
        self.collection = get_collection()

    async def GetTodos(self, request, context):
        try:
            docs = await self.collection.find().to_list(length=None)
            todos = []
            for doc in docs:
                todo = todo_pb2.Todo(
                    id=str(doc["_id"]),
                    title=doc["title"],
                    completed=doc["completed"],
                )
                todos.append(todo)
            return todo_pb2.TodoList(todos=todos)
        except Exception as e:
            logger.error(f"Error getting todos: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.TodoList()

    async def CreateTodo(self, request, context):
        try:
            result = await self.collection.insert_one(
                {"title": request.title, "completed": False}
            )
            return todo_pb2.Todo(
                id=str(result.inserted_id), title=request.title, completed=False
            )
        except Exception as e:
            logger.error(f"Error creating todo: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.Todo()

    async def UpdateTodo(self, request, context):
        try:
            update_data = {}
            if request.title:
                update_data["title"] = request.title
            if hasattr(request, "completed"):
                update_data["completed"] = request.completed

            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(request.id)},
                {"$set": update_data},
                return_document=True,
            )

            if result:
                return todo_pb2.Todo(
                    id=str(result["_id"]),
                    title=result["title"],
                    completed=result["completed"],
                )
            else:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details("Todo not found")
                return todo_pb2.Todo()
        except Exception as e:
            logger.error(f"Error updating todo: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return todo_pb2.Todo()


async def serve():
    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    todo_pb2_grpc.add_TodoServiceServicer_to_server(TodoServicer(), server)
    listen_addr = "[::]:50052"
    server.add_insecure_port(listen_addr)
    logger.info("Starting gRPC server on %s", listen_addr)
    await server.start()
    await server.wait_for_termination()
