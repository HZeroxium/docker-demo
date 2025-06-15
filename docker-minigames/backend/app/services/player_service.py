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
            player_dict = {
                "name": player_data.name,
                "score": 0,
                "joined_at": datetime.utcnow(),
                "total_questions": 0,  # Track total questions answered
                "correct_answers": 0,  # Track correct answers
                "average_speed": 0.0,  # Track average answer speed
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
        self,
        player_id: str,
        points_earned: int,
        time_taken: float,
        is_correct: bool = True,
    ) -> Optional[PlayerResponse]:
        """Update player score with points earned and statistics"""
        try:
            if not ObjectId.is_valid(player_id):
                logger.warning(f"Invalid player ID format: {player_id}")
                return None

            logger.info(
                f"Updating player {player_id}: +{points_earned} points, {time_taken}s"
            )

            # Get current player data for average calculation
            current_player = await self.collection.find_one(
                {"_id": ObjectId(player_id)}
            )
            if not current_player:
                logger.warning(f"Player not found for score update: {player_id}")
                return None

            # Calculate new statistics
            current_total = current_player.get("total_questions", 0)
            current_correct = current_player.get("correct_answers", 0)
            current_avg_speed = current_player.get("average_speed", 0.0)

            new_total = current_total + 1
            new_correct = current_correct + (1 if is_correct else 0)

            # Calculate new average speed
            if current_total > 0:
                new_avg_speed = (
                    (current_avg_speed * current_total) + time_taken
                ) / new_total
            else:
                new_avg_speed = time_taken

            # Update with statistics
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(player_id)},
                {
                    "$inc": {"score": points_earned},
                    "$set": {
                        "total_questions": new_total,
                        "correct_answers": new_correct,
                        "average_speed": round(new_avg_speed, 2),
                    },
                },
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
