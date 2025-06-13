import json
import logging
from aio_pika import connect_robust, Message, ExchangeType
from aio_pika.abc import AbstractConnection, AbstractChannel, AbstractExchange
from .schemas import TodoGraph
from typing import Optional

logger = logging.getLogger(__name__)


class MessagePublisher:
    def __init__(self):
        self.connection: Optional[AbstractConnection] = None
        self.channel: Optional[AbstractChannel] = None
        self.exchange: Optional[AbstractExchange] = None

    async def connect(self):
        try:
            self.connection = await connect_robust("amqp://guest:guest@rabbitmq:5672/")
            self.channel = await self.connection.channel()
            self.exchange = await self.channel.declare_exchange(
                "todo_events", ExchangeType.TOPIC, durable=True
            )
            logger.info("Connected to RabbitMQ")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise

    async def publish_todo_created(self, todo: TodoGraph):
        if not self.exchange:
            await self.connect()

        try:
            message_body = {
                "event_type": "todo_created",
                "data": {
                    "id": todo.id,
                    "title": todo.title,
                    "completed": todo.completed,
                },
            }

            message = Message(
                json.dumps(message_body).encode(), content_type="application/json"
            )

            await self.exchange.publish(message, routing_key="todo.created")
            logger.info(f"Published todo_created event for todo {todo.id}")
        except Exception as e:
            logger.error(f"Failed to publish todo_created event: {e}")

    async def publish_todo_updated(self, todo: TodoGraph):
        if not self.exchange:
            await self.connect()

        try:
            message_body = {
                "event_type": "todo_updated",
                "data": {
                    "id": todo.id,
                    "title": todo.title,
                    "completed": todo.completed,
                },
            }

            message = Message(
                json.dumps(message_body).encode(), content_type="application/json"
            )

            await self.exchange.publish(message, routing_key="todo.updated")
            logger.info(f"Published todo_updated event for todo {todo.id}")
        except Exception as e:
            logger.error(f"Failed to publish todo_updated event: {e}")

    async def close(self):
        if self.connection:
            await self.connection.close()


# Global publisher instance
publisher = MessagePublisher()


async def publish_todo_created(todo: TodoGraph):
    await publisher.publish_todo_created(todo)


async def publish_todo_updated(todo: TodoGraph):
    await publisher.publish_todo_updated(todo)
