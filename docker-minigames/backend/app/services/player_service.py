from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from app.database.connection import get_database
from app.models.player import Player, PlayerCreate, PlayerResponse
import logging

logger = logging.getLogger(__name__)


class PlayerService:
    def __init__(self):
        self.collection_name = "players"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def create_player(self, player_data: PlayerCreate) -> PlayerResponse:
        """Create a new player"""
        try:
            # Create player dict without _id to let MongoDB generate it
            # Fix: Use datetime.utcnow() directly instead of creating Player() instance
            player_dict = {
                "name": player_data.name,
                "score": 0,
                "joined_at": datetime.utcnow(),  # Fixed: Direct datetime creation
            }

            result = await self.collection.insert_one(player_dict)
            logger.info(f"Created player with ID: {result.inserted_id}")

            created_player = await self.collection.find_one({"_id": result.inserted_id})
            return PlayerResponse(
                id=str(created_player["_id"]),
                name=created_player["name"],
                score=created_player["score"],
                joined_at=created_player["joined_at"],
            )
        except Exception as e:
            logger.error(f"Error creating player: {e}")
            raise

    async def get_player(self, player_id: str) -> Optional[PlayerResponse]:
        """Get player by ID"""
        try:
            if not ObjectId.is_valid(player_id):
                logger.warning(f"Invalid player ID format: {player_id}")
                return None

            player_data = await self.collection.find_one({"_id": ObjectId(player_id)})
            if player_data:
                logger.info(f"Found player: {player_id}")
                return PlayerResponse(
                    id=str(player_data["_id"]),
                    name=player_data["name"],
                    score=player_data["score"],
                    joined_at=player_data["joined_at"],
                )
            else:
                logger.warning(f"Player not found: {player_id}")
                return None
        except Exception as e:
            logger.error(f"Error getting player {player_id}: {e}")
            return None

    async def update_player_score(
        self, player_id: str, score_increment: int = 1
    ) -> Optional[PlayerResponse]:
        """Update player score"""
        try:
            if not ObjectId.is_valid(player_id):
                logger.warning(f"Invalid player ID format: {player_id}")
                return None

            logger.info(f"Updating score for player {player_id} by {score_increment}")

            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(player_id)},
                {"$inc": {"score": score_increment}},
                return_document=True,
            )

            if result:
                logger.info(f"Updated player {player_id} score to {result['score']}")
                return PlayerResponse(
                    id=str(result["_id"]),
                    name=result["name"],
                    score=result["score"],
                    joined_at=result["joined_at"],
                )
            else:
                logger.warning(f"Player not found for score update: {player_id}")
                return None
        except Exception as e:
            logger.error(f"Error updating player score: {e}")
            return None

    async def get_leaderboard(self, limit: int = 10) -> List[PlayerResponse]:
        """Get top players by score"""
        try:
            cursor = self.collection.find().sort("score", -1).limit(limit)
            players = []
            async for player_data in cursor:
                players.append(
                    PlayerResponse(
                        id=str(player_data["_id"]),
                        name=player_data["name"],
                        score=player_data["score"],
                        joined_at=player_data["joined_at"],
                    )
                )
            logger.info(f"Retrieved {len(players)} players for leaderboard")
            return players
        except Exception as e:
            logger.error(f"Error getting leaderboard: {e}")
            raise


player_service = PlayerService()
