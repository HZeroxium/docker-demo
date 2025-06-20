# app/router/admin.py


from fastapi import APIRouter, HTTPException, status, Query, Path
from typing import List
import logging
from app.models.question import Question
from app.database.connection import get_database
from app.core.auth import AdminRequired
from app.core.cache import cache_service
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/questions/count", response_model=dict, dependencies=[AdminRequired])
async def get_questions_count():
    """Get total count of questions (Admin only)"""
    try:
        # Check cache first
        cache_key = "admin_questions_count"
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
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while counting questions",
        )


@router.post("/questions", response_model=dict, dependencies=[AdminRequired])
async def create_question(question: Question):
    """Create a new question (Admin only)"""
    try:
        db = get_database()
        questions_collection = db.questions

        # Prepare question data
        question_data = question.model_dump(exclude={"id"})

        # Insert question
        result = await questions_collection.insert_one(question_data)

        if result.inserted_id:
            # Invalidate cache
            await cache_service.invalidate_questions_cache()

            logger.info(f"✅ Created question with ID: {result.inserted_id}")

            return {
                "message": "Question created successfully",
                "question_id": str(result.inserted_id),
                "status": "success",
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create question",
            )

    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Question with similar content already exists",
        )
    except Exception as e:
        logger.error(f"❌ Error creating question: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while creating question",
        )


@router.get("/questions", response_model=List[Question], dependencies=[AdminRequired])
async def get_all_questions_admin(
    skip: int = Query(0, ge=0, description="Number of questions to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of questions to return"),
    include_answers: bool = Query(
        True, description="Include correct answers in response"
    ),
):
    """Get all questions with pagination (Admin only)"""
    try:
        # Check cache first
        cache_key = (
            f"admin_questions:limit_{limit}:skip_{skip}:answers_{include_answers}"
        )
        cached_questions = await cache_service.get(cache_key)

        if cached_questions:
            logger.info(f"📋 Returning {len(cached_questions)} cached admin questions")
            return cached_questions

        db = get_database()
        questions_collection = db.questions

        # Get questions with pagination
        cursor = questions_collection.find().skip(skip).limit(limit)
        questions_data = await cursor.to_list(length=limit)

        # Convert to Question models
        questions = []
        for q_data in questions_data:
            q_data["id"] = str(q_data["_id"])
            questions.append(Question(**q_data))

        # Cache the results
        await cache_service.set(
            cache_key,
            [q.model_dump() for q in questions],
            ttl=settings.QUESTIONS_CACHE_TTL,
        )

        logger.info(f"📋 Retrieved {len(questions)} questions for admin")
        return questions

    except Exception as e:
        logger.error(f"❌ Error retrieving admin questions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving questions",
        )


@router.get(
    "/questions/{question_id}", response_model=Question, dependencies=[AdminRequired]
)
async def get_question_admin(question_id: str = Path(..., description="Question ID")):
    """Get a specific question by ID (Admin only)"""
    try:
        if not ObjectId.is_valid(question_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid question ID format",
            )

        # Check cache first
        cache_key = f"admin_question:{question_id}"
        cached_question = await cache_service.get(cache_key)

        if cached_question:
            logger.info(f"📄 Returning cached admin question: {question_id}")
            return Question(**cached_question)

        db = get_database()
        questions_collection = db.questions

        question_data = await questions_collection.find_one(
            {"_id": ObjectId(question_id)}
        )

        if not question_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
            )

        question_data["id"] = str(question_data["_id"])
        question = Question(**question_data)

        # Cache the result
        await cache_service.set(
            cache_key, question.model_dump(), ttl=settings.QUESTIONS_CACHE_TTL
        )

        logger.info(f"📄 Retrieved admin question: {question_id}")
        return question

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving admin question {question_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving question",
        )


@router.put(
    "/questions/{question_id}", response_model=dict, dependencies=[AdminRequired]
)
async def update_question(
    question_update: Question, question_id: str = Path(..., description="Question ID")
):
    """Update a specific question (Admin only)"""
    try:
        if not ObjectId.is_valid(question_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid question ID format",
            )

        db = get_database()
        questions_collection = db.questions

        # Prepare update data (exclude id field)
        update_data = question_update.model_dump(exclude={"id"})

        # Update question
        result = await questions_collection.update_one(
            {"_id": ObjectId(question_id)}, {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
            )

        if result.modified_count > 0:
            # Invalidate cache
            await cache_service.invalidate_questions_cache()
            await cache_service.delete(f"admin_question:{question_id}")

            logger.info(f"✅ Updated question: {question_id}")

            return {
                "message": "Question updated successfully",
                "question_id": question_id,
                "status": "success",
            }
        else:
            return {
                "message": "No changes made to question",
                "question_id": question_id,
                "status": "unchanged",
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating question {question_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating question",
        )


@router.delete(
    "/questions/{question_id}", response_model=dict, dependencies=[AdminRequired]
)
async def delete_question(question_id: str = Path(..., description="Question ID")):
    """Delete a specific question (Admin only)"""
    try:
        if not ObjectId.is_valid(question_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid question ID format",
            )

        db = get_database()
        questions_collection = db.questions

        # Check if question exists
        existing_question = await questions_collection.find_one(
            {"_id": ObjectId(question_id)}
        )
        if not existing_question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
            )

        # Delete question
        result = await questions_collection.delete_one({"_id": ObjectId(question_id)})

        if result.deleted_count > 0:
            # Invalidate cache
            await cache_service.invalidate_questions_cache()
            await cache_service.delete(f"admin_question:{question_id}")

            logger.info(f"🗑️ Deleted question: {question_id}")

            return {
                "message": "Question deleted successfully",
                "question_id": question_id,
                "status": "success",
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete question",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting question {question_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while deleting question",
        )


@router.post("/cache/invalidate", response_model=dict, dependencies=[AdminRequired])
async def invalidate_cache():
    """Manually invalidate all question-related cache (Admin only)"""
    try:
        deleted_count = await cache_service.invalidate_questions_cache()

        return {
            "message": "Cache invalidated successfully",
            "deleted_entries": deleted_count,
            "status": "success",
        }
    except Exception as e:
        logger.error(f"❌ Error invalidating cache: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while invalidating cache",
        )
