from fastapi import APIRouter, HTTPException, Depends
from app.models.player import PlayerCreate, PlayerResponse
from app.models.question import AnswerSubmission, AnswerResponse
from app.services.player_service import player_service
from app.services.question_service import question_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# We'll inject this from main.py context
websocket_manager = None


def set_websocket_manager(manager):
    global websocket_manager
    websocket_manager = manager


@router.post("/join", response_model=PlayerResponse)
async def join_game(player_data: PlayerCreate):
    """Join the game by creating a new player"""
    try:
        # Validate player name
        if not player_data.name or len(player_data.name.strip()) < 2:
            raise HTTPException(
                status_code=400,
                detail="Player name must be at least 2 characters long",
            )

        player = await player_service.create_player(player_data)
        logger.info(f"Player joined: {player.name} (ID: {player.id})")

        # Emit player joined event
        if websocket_manager:
            await websocket_manager.emit_player_joined(
                {"player_id": player.id, "name": player.name, "score": player.score}
            )

        return player
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in join_game: {e}")
        raise HTTPException(status_code=500, detail="Failed to join game")


@router.post("/answer", response_model=AnswerResponse)
async def submit_answer(answer: AnswerSubmission):
    """Submit an answer for a question with speed-based scoring"""
    try:
        logger.info(
            f"Processing answer - Player: {answer.player_id}, "
            f"Question: {answer.question_id}, Selected: {answer.selected_option}, "
            f"Time: {answer.time_taken}s"
        )

        # Verify answer and calculate score based on speed
        is_correct, points_earned, speed_bonus, question = (
            await question_service.verify_answer_and_calculate_score(
                answer.question_id, answer.selected_option, answer.time_taken
            )
        )

        if question is None:
            logger.error(f"Question not found: {answer.question_id}")
            raise HTTPException(status_code=404, detail="Question not found")

        # Always update player statistics (even for wrong answers)
        updated_player = await player_service.update_player_score(
            answer.player_id, points_earned, answer.time_taken, is_correct
        )

        if not updated_player:
            logger.error(f"Player not found: {answer.player_id}")
            raise HTTPException(status_code=404, detail="Player not found")

        # Get current leaderboard
        leaderboard = await player_service.get_leaderboard()

        # Emit events with enhanced data
        if websocket_manager:
            try:
                await websocket_manager.emit_player_answered(
                    {
                        "player_id": answer.player_id,
                        "question_id": answer.question_id,
                        "is_correct": is_correct,
                        "points_earned": points_earned,
                        "speed_bonus": speed_bonus,
                        "time_taken": answer.time_taken,
                        "new_score": updated_player.score,
                    }
                )

                await websocket_manager.emit_leaderboard_updated(
                    {"leaderboard": [player.model_dump() for player in leaderboard]}
                )
                logger.info("WebSocket events emitted successfully")
            except Exception as ws_error:
                logger.error(f"WebSocket error: {ws_error}")

        # Create response - only include correct answer if user was wrong
        response = AnswerResponse(
            is_correct=is_correct,
            points_earned=points_earned,
            new_score=updated_player.score,
            time_taken=answer.time_taken,
            speed_bonus=speed_bonus,
            message=f"{'Correct!' if is_correct else 'Incorrect.'} You earned {points_earned} points.",
            correct_answer=question.correct_answer if not is_correct else None,  # Only show if wrong
        )

        logger.info(f"Answer processed successfully: {response}")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in submit_answer: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Failed to submit answer: {str(e)}"
        )
        logger.error(f"Error in submit_answer: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to submit answer: {str(e)}"
        )
