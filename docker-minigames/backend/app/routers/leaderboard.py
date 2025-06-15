from fastapi import APIRouter, HTTPException
from typing import List
from app.models.player import PlayerResponse
from app.services.player_service import player_service

router = APIRouter()


@router.get("/leaderboard", response_model=List[PlayerResponse])
async def get_leaderboard():
    """Get current leaderboard"""
    try:
        leaderboard = await player_service.get_leaderboard()
        return leaderboard
    except Exception as e:
        print(f"Error in get_leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get leaderboard")
