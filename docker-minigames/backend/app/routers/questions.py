from fastapi import APIRouter, HTTPException
from typing import List
from app.models.question import QuestionResponse
from app.services.question_service import question_service

router = APIRouter()


@router.get("/questions", response_model=List[QuestionResponse])
async def get_questions():
    """Get all quiz questions"""
    try:
        # Seed questions if none exist
        await question_service.seed_questions()

        questions = await question_service.get_all_questions()
        return questions
    except Exception as e:
        print(f"Error in get_questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get questions")
