# app/grpc/server.py

import grpc
from concurrent import futures
from .. import todo_pb2_grpc
from .todo_servicer import TodoServicer
from ..core.observability import get_logger

logger = get_logger(__name__)


async def serve():
    """Start the gRPC server"""
    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    todo_pb2_grpc.add_TodoServiceServicer_to_server(TodoServicer(), server)
    listen_addr = "[::]:50052"
    server.add_insecure_port(listen_addr)
    logger.info("Starting gRPC server on %s", listen_addr)
    await server.start()
    await server.wait_for_termination()
