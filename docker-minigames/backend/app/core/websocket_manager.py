import socketio
from typing import Dict, Any
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)


class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder for datetime objects"""

    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


class WebSocketManager:
    def __init__(self, sio: socketio.AsyncServer):
        self.sio = sio
        self.setup_events()

    def setup_events(self):
        @self.sio.event
        async def connect(sid, environ):
            logger.info(f"Client {sid} connected")
            print(f"🔌 Client {sid} connected")

        @self.sio.event
        async def disconnect(sid):
            logger.info(f"Client {sid} disconnected")
            print(f"🔌 Client {sid} disconnected")

    def _serialize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Serialize data to ensure JSON compatibility"""
        try:
            # Convert to JSON string and back to dict to handle datetime serialization
            json_str = json.dumps(data, cls=DateTimeEncoder, default=str)
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Error serializing data: {e}")
            return data

    async def emit_player_joined(self, player_data: Dict[str, Any]):
        """Emit player joined event to all clients"""
        try:
            serialized_data = self._serialize_data(player_data)
            await self.sio.emit("player_joined", serialized_data)
            logger.info(f"Emitted player_joined: {serialized_data}")
        except Exception as e:
            logger.error(f"Error emitting player_joined: {e}")

    async def emit_leaderboard_updated(self, leaderboard_data: Dict[str, Any]):
        """Emit leaderboard updated event to all clients"""
        try:
            serialized_data = self._serialize_data(leaderboard_data)
            await self.sio.emit("leaderboard_updated", serialized_data)
            logger.info("Emitted leaderboard_updated")
        except Exception as e:
            logger.error(f"Error emitting leaderboard_updated: {e}")

    async def emit_player_answered(self, answer_data: Dict[str, Any]):
        """Emit player answered event to all clients"""
        try:
            serialized_data = self._serialize_data(answer_data)
            await self.sio.emit("player_answered", serialized_data)
            logger.info(f"Emitted player_answered: {serialized_data}")
        except Exception as e:
            logger.error(f"Error emitting player_answered: {e}")
