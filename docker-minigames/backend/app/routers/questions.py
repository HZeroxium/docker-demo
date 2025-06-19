from fastapi import APIRouter, HTTPException, Query
from typing import List
import logging
from app.models.question import QuestionResponse
from app.services.question_service import question_service
from app.database.connection import get_database
from app.core.cache import cache_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/questions/random", response_model=List[QuestionResponse])
async def get_random_questions(count: int = Query(10, ge=1, le=50)):
    """Get random questions for the quiz (without correct answers)"""
    try:
        # Check cache first
        cache_key = cache_service.get_random_questions_cache_key(count)
        cached_questions = await cache_service.get(cache_key)

        if cached_questions:
            logger.info(f"🎲 Returning {len(cached_questions)} cached random questions")
            return [QuestionResponse(**q) for q in cached_questions]

        db = get_database()
        questions_collection = db.questions

        # Get total count of questions
        total_questions = await questions_collection.count_documents({})

        if total_questions == 0:
            raise HTTPException(status_code=404, detail="No questions available")

        # Determine how many questions to fetch
        fetch_count = min(count, total_questions)

        # Use aggregation pipeline for random sampling
        pipeline = [{"$sample": {"size": fetch_count}}]

        cursor = questions_collection.aggregate(pipeline)
        questions_data = await cursor.to_list(length=fetch_count)

        # Convert to QuestionResponse (excluding correct_answer)
        questions = []
        for q_data in questions_data:
            q_data["id"] = str(q_data["_id"])
            # Create QuestionResponse which excludes correct_answer
            question_response = QuestionResponse(
                id=q_data["id"],
                question=q_data["question"],
                options=q_data["options"],
                time_limit=q_data.get("time_limit", 30),
                max_points=q_data.get("max_points", 100),
            )
            questions.append(question_response)

        # Cache the results
        questions_data_for_cache = [q.model_dump() for q in questions]
        await cache_service.set(
            cache_key, questions_data_for_cache, ttl=settings.QUESTIONS_CACHE_TTL
        )

        logger.info(f"🎲 Retrieved {len(questions)} random questions from database")
        return questions

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching random questions: {e}")
        raise HTTPException(
            status_code=500, detail="Internal server error while fetching questions"
        )


@router.get("/questions/count")
async def get_questions_count():
    """Get total number of available questions"""
    try:
        # Check cache first
        cache_key = "question_count"
        cached_count = await cache_service.get(cache_key)

        if cached_count is not None:
            return {"total_questions": cached_count}

        db = get_database()
        questions_collection = db.questions

        total_count = await questions_collection.count_documents({})

        # Cache the result
        await cache_service.set(
            cache_key, total_count, ttl=settings.QUESTIONS_CACHE_TTL
        )

        return {"total_questions": total_count}

    except Exception as e:
        logger.error(f"❌ Error counting questions: {e}")
        raise HTTPException(
            status_code=500, detail="Internal server error while counting questions"
        )


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
