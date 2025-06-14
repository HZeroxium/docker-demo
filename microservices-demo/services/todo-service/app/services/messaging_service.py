# app/services/messaging_service.py

import json
import asyncio
from typing import Optional
from aio_pika import connect_robust, Message, ExchangeType
from aio_pika.abc import AbstractConnection, AbstractChannel, AbstractExchange
from ..models.graphql_schemas import TodoGraph
from ..core.observability import get_logger

logger = get_logger(__name__)


class MessagingService:
    def __init__(self):
        self.connection: Optional[AbstractConnection] = None
        self.channel: Optional[AbstractChannel] = None
        self.exchange: Optional[AbstractExchange] = None
        self._reconnect_attempts = 0
        self._max_reconnect_attempts = 5

    async def connect(self):
        """Connect to RabbitMQ with retry logic"""
        for attempt in range(self._max_reconnect_attempts):
            try:
                self.connection = await connect_robust(
                    "amqp://guest:guest@rabbitmq:5672/", heartbeat=60
                )
                self.channel = await self.connection.channel()
                await self.channel.set_qos(prefetch_count=10)

                self.exchange = await self.channel.declare_exchange(
                    "todo_events", ExchangeType.TOPIC, durable=True
                )

                self._reconnect_attempts = 0
                logger.info("Connected to RabbitMQ successfully")
                return

            except Exception as e:
                self._reconnect_attempts += 1
                logger.warning(
                    f"Failed to connect to RabbitMQ (attempt {attempt + 1}/{self._max_reconnect_attempts}): {e}"
                )

                if attempt < self._max_reconnect_attempts - 1:
                    await asyncio.sleep(2**attempt)  # Exponential backoff
                else:
                    logger.error(
                        "Max reconnection attempts reached. RabbitMQ unavailable."
                    )
                    raise

    async def _ensure_connected(self):
        """Ensure we have a valid connection"""
        if not self.connection or self.connection.is_closed:
            await self.connect()

    async def publish_todo_event(self, event_type: str, todo_data: dict):
        """Generic method to publish todo events with retry logic"""
        try:
            await self._ensure_connected()

            message_body = {
                "event_type": event_type,
                "timestamp": todo_data.get("updated_at", ""),
                "service": "todo-service",
                "data": todo_data,
            }

            message = Message(
                json.dumps(message_body).encode(),
                content_type="application/json",
                delivery_mode=2,  # Make message persistent
            )

            routing_key = (
                f"todo.{event_type.split('_')[1]}"  # todo.created, todo.updated
            )
            await self.exchange.publish(message, routing_key=routing_key)

            logger.info(
                f"Published {event_type} event",
                extra={"todo_id": todo_data.get("id"), "routing_key": routing_key},
            )
        except Exception as e:
            logger.error(f"Failed to publish {event_type} event: {e}")
            # Don't raise the exception to prevent breaking the main business logic

    async def publish_todo_created(self, todo: TodoGraph):
        """Publish todo created event"""
        await self.publish_todo_event(
            "todo_created",
            {
                "id": todo.id,
                "title": todo.title,
                "description": todo.description,
                "completed": todo.completed,
                "priority": todo.priority,
                "user_id": todo.user_id,
                "created_at": todo.created_at.isoformat() if todo.created_at else None,
                "updated_at": todo.updated_at.isoformat() if todo.updated_at else None,
            },
        )

    async def publish_todo_updated(self, todo: TodoGraph):
        """Publish todo updated event"""
        await self.publish_todo_event(
            "todo_updated",
            {
                "id": todo.id,
                "title": todo.title,
                "description": todo.description,
                "completed": todo.completed,
                "priority": todo.priority,
                "user_id": todo.user_id,
                "created_at": todo.created_at.isoformat() if todo.created_at else None,
                "updated_at": todo.updated_at.isoformat() if todo.updated_at else None,
            },
        )

    async def publish_todo_deleted(self, todo_id: str, user_id: str = ""):
        """Publish todo deleted event"""
        await self.publish_todo_event(
            "todo_deleted",
            {
                "id": todo_id,
                "user_id": user_id,
            },
        )

    async def close(self):
        """Close connection gracefully"""
        try:
            if self.channel and not self.channel.is_closed:
                await self.channel.close()
            if self.connection and not self.connection.is_closed:
                await self.connection.close()
            logger.info("Messaging service connection closed")
        except Exception as e:
            logger.warning(f"Error closing messaging service: {e}")


# Global messaging service instance
messaging_service = MessagingService()
