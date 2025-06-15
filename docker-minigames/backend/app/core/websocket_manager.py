import socketio
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


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

    async def emit_player_joined(self, player_data: Dict[str, Any]):
        """Emit player joined event to all clients"""
        try:
            await self.sio.emit("player_joined", player_data)
            logger.info(f"Emitted player_joined: {player_data}")
        except Exception as e:
            logger.error(f"Error emitting player_joined: {e}")

    async def emit_leaderboard_updated(self, leaderboard_data: Dict[str, Any]):
        """Emit leaderboard updated event to all clients"""
        try:
            await self.sio.emit("leaderboard_updated", leaderboard_data)
            logger.info("Emitted leaderboard_updated")
        except Exception as e:
            logger.error(f"Error emitting leaderboard_updated: {e}")

    async def emit_player_answered(self, answer_data: Dict[str, Any]):
        """Emit player answered event to all clients"""
        try:
            await self.sio.emit("player_answered", answer_data)
            logger.info(f"Emitted player_answered: {answer_data}")
        except Exception as e:
            logger.error(f"Error emitting player_answered: {e}")
