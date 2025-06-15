from typing import List, Optional
from bson import ObjectId
from app.database.connection import get_database
from app.models.question import Question, QuestionResponse
import logging

logger = logging.getLogger(__name__)


class QuestionService:
    def __init__(self):
        self.collection_name = "questions"

    @property
    def collection(self):
        return get_database()[self.collection_name]

    async def get_all_questions(self) -> List[QuestionResponse]:
        """Get all questions without correct answers"""
        try:
            cursor = self.collection.find()
            questions = []
            async for question_data in cursor:
                questions.append(
                    QuestionResponse(
                        id=str(question_data["_id"]),
                        question=question_data["question"],
                        options=question_data["options"],
                    )
                )
            logger.info(f"Retrieved {len(questions)} questions")
            return questions
        except Exception as e:
            logger.error(f"Error getting questions: {e}")
            raise

    async def get_question(self, question_id: str) -> Optional[Question]:
        """Get question by ID with correct answer"""
        try:
            if not ObjectId.is_valid(question_id):
                logger.warning(f"Invalid ObjectId format: {question_id}")
                return None

            question_data = await self.collection.find_one(
                {"_id": ObjectId(question_id)}
            )

            if question_data:
                # Manually construct the Question object with proper ObjectId handling
                try:
                    question = Question(
                        _id=question_data["_id"],  # Use _id instead of id
                        question=question_data["question"],
                        options=question_data["options"],
                        correct_answer=question_data["correct_answer"],
                    )
                    logger.info(f"Found question: {question_id}")
                    return question
                except Exception as construct_error:
                    logger.error(
                        f"Error constructing question object: {construct_error}"
                    )
                    # Fallback: create a simple dict-based approach
                    return Question.model_validate(
                        {
                            "_id": str(question_data["_id"]),
                            "question": question_data["question"],
                            "options": question_data["options"],
                            "correct_answer": question_data["correct_answer"],
                        }
                    )
            else:
                logger.warning(f"Question not found: {question_id}")
                return None
        except Exception as e:
            logger.error(f"Error getting question {question_id}: {e}")
            return None

    async def verify_answer(
        self, question_id: str, selected_option: int
    ) -> tuple[bool, Optional[int]]:
        """Verify if the selected option is correct and return correct answer"""
        try:
            # Direct database query to avoid Pydantic issues
            if not ObjectId.is_valid(question_id):
                logger.error(f"Invalid ObjectId format: {question_id}")
                return False, None

            question_data = await self.collection.find_one(
                {"_id": ObjectId(question_id)}
            )

            if not question_data:
                logger.error(f"Question not found for verification: {question_id}")
                return False, None

            correct_answer = question_data["correct_answer"]
            is_correct = correct_answer == selected_option

            logger.info(
                f"Answer verification - Question: {question_id}, "
                f"Selected: {selected_option}, Correct: {correct_answer}, "
                f"Result: {is_correct}"
            )

            return is_correct, correct_answer
        except Exception as e:
            logger.error(f"Error verifying answer: {e}")
            return False, None

    async def seed_questions(self):
        """Seed initial questions for demo"""
        sample_questions = [
            {
                "question": "What is Docker?",
                "options": [
                    "A programming language",
                    "A containerization platform",
                    "A database management system",
                    "A web framework",
                ],
                "correct_answer": 1,
            },
            {
                "question": "Which command is used to build a Docker image?",
                "options": [
                    "docker run",
                    "docker build",
                    "docker create",
                    "docker start",
                ],
                "correct_answer": 1,
            },
            {
                "question": "What file is used to define a Docker image?",
                "options": ["docker.json", "Dockerfile", "docker.yaml", "image.config"],
                "correct_answer": 1,
            },
            {
                "question": "Which Docker command shows running containers?",
                "options": [
                    "docker ps",
                    "docker list",
                    "docker show",
                    "docker containers",
                ],
                "correct_answer": 0,
            },
            {
                "question": "What does the -d flag do in 'docker run -d'?",
                "options": [
                    "Deletes the container after running",
                    "Downloads the image first",
                    "Runs the container in detached mode",
                    "Enables debugging mode",
                ],
                "correct_answer": 2,
            },
        ]

        try:
            # Check if questions already exist
            count = await self.collection.count_documents({})
            if count == 0:
                result = await self.collection.insert_many(sample_questions)
                logger.info(
                    f"✅ Seeded {len(result.inserted_ids)} questions successfully"
                )
                print(f"✅ Sample questions seeded successfully")
            else:
                logger.info(f"📚 Found {count} existing questions in database")
                print(f"📚 Found {count} existing questions in database")
        except Exception as e:
            logger.error(f"Error seeding questions: {e}")
            raise


question_service = QuestionService()
