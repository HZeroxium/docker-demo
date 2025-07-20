from typing import List, Optional, Tuple
from bson import ObjectId
from app.database.connection import get_database
from app.models.question import Question, QuestionResponse
import logging
import math

logger = logging.getLogger(__name__)


SAMPLE_QUESTIONS = [
    {
        "question": "What is Docker?",
        "options": [
            "A programming language",
            "A containerization platform",
            "A database management system",
            "A web framework",
        ],
        "correct_answer": 1,
        "time_limit": 20,
        "max_points": 100,
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
        "time_limit": 15,
        "max_points": 80,
    },
    {
        "question": "What file is used to define a Docker image?",
        "options": ["docker.json", "Dockerfile", "docker.yaml", "image.config"],
        "correct_answer": 1,
        "time_limit": 10,
        "max_points": 60,
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
        "time_limit": 25,
        "max_points": 90,
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
        "time_limit": 30,
        "max_points": 120,
    },
    {
        "question": "What is the difference between a Docker image and a container?",
        "options": [
            "An image is running, a container is not",
            "A container is a template, an image is an instance",
            "An image is a blueprint, a container is a running instance",
            "They are exactly the same",
        ],
        "correct_answer": 2,
        "time_limit": 20,
        "max_points": 100,
    },
    {
        "question": "What is Docker Compose primarily used for?",
        "options": [
            "Deploying apps to Kubernetes",
            "Managing multiple containers via a single YAML file",
            "Optimizing container performance",
            "Building Docker images in parallel",
        ],
        "correct_answer": 1,
        "time_limit": 25,
        "max_points": 90,
    },
    {
        "question": "What is the default network driver used by Docker?",
        "options": ["host", "bridge", "overlay", "none"],
        "correct_answer": 1,
        "time_limit": 15,
        "max_points": 70,
    },
    {
        "question": "In Docker, how can you reduce rebuild time when modifying a Dockerfile?",
        "options": [
            "By placing changing lines like COPY at the top",
            "By using ADD instead of COPY",
            "By minimizing layers and ordering static instructions first",
            "By writing all instructions in a shell script",
        ],
        "correct_answer": 2,
        "time_limit": 25,
        "max_points": 90,
    },
    {
        "question": "Why are Docker volumes used?",
        "options": [
            "To expose ports",
            "To persist data across container restarts",
            "To improve build speed",
            "To compile code faster",
        ],
        "correct_answer": 1,
        "time_limit": 20,
        "max_points": 85,
    },
    {
        "question": "What happens when you run 'docker pull nginx'?",
        "options": [
            "It builds the image locally",
            "It pulls nginx from GitHub",
            "It downloads the image from Docker Hub registry",
            "It installs nginx in your system",
        ],
        "correct_answer": 2,
        "time_limit": 15,
        "max_points": 70,
    },
    {
        "question": "Which command is used to start services defined in docker-compose.yml?",
        "options": [
            "docker-compose build",
            "docker-compose init",
            "docker-compose run",
            "docker-compose up",
        ],
        "correct_answer": 3,
        "time_limit": 20,
        "max_points": 100,
    },
    {
        "question": "Which command stops all services started by Docker Compose?",
        "options": [
            "docker-compose kill",
            "docker-compose down",
            "docker-compose remove",
            "docker-compose pause",
        ],
        "correct_answer": 1,
        "time_limit": 20,
        "max_points": 90,
    },
    {
        "question": "How do you rebuild images and recreate all containers using Docker Compose?",
        "options": [
            "docker-compose up --build",
            "docker-compose restart",
            "docker-compose reset",
            "docker-compose build --force",
        ],
        "correct_answer": 0,
        "time_limit": 20,
        "max_points": 100,
    },
    {
        "question": "Which keyword in Docker Compose is used to persist data between container restarts?",
        "options": ["storage", "mount", "volumes", "binds"],
        "correct_answer": 2,
        "time_limit": 25,
        "max_points": 90,
    },
    {
        "question": "In Docker Compose, what does 'ports: - \"8080:80\"' mean?",
        "options": [
            "Map container port 8080 to host port 80",
            "Map host port 8080 to container port 80",
            "Expose port 80 for all containers",
            "Create a new virtual network on port 8080",
        ],
        "correct_answer": 1,
        "time_limit": 20,
        "max_points": 95,
    },
]


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
                        time_limit=question_data.get("time_limit", 30),
                        max_points=question_data.get("max_points", 100),
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
                try:
                    question = Question(
                        _id=question_data["_id"],
                        question=question_data["question"],
                        options=question_data["options"],
                        correct_answer=question_data["correct_answer"],
                        time_limit=question_data.get("time_limit", 30),
                        max_points=question_data.get("max_points", 100),
                    )
                    logger.info(f"Found question: {question_id}")
                    return question
                except Exception as construct_error:
                    logger.error(
                        f"Error constructing question object: {construct_error}"
                    )
                    return Question.model_validate(
                        {
                            "_id": str(question_data["_id"]),
                            "question": question_data["question"],
                            "options": question_data["options"],
                            "correct_answer": question_data["correct_answer"],
                            "time_limit": question_data.get("time_limit", 30),
                            "max_points": question_data.get("max_points", 100),
                        }
                    )
            else:
                logger.warning(f"Question not found: {question_id}")
                return None
        except Exception as e:
            logger.error(f"Error getting question {question_id}: {e}")
            return None

    def calculate_score(
        self,
        is_correct: bool,
        time_taken: float,
        max_points: int = 100,
        time_limit: int = 30,
    ) -> Tuple[int, int]:
        """
        Calculate score based on correctness and speed
        Returns: (total_points, speed_bonus)
        """
        if not is_correct:
            return 0, 0

        # Base points for correct answer (60% of max points)
        base_points = int(max_points * 0.6)

        # Speed bonus calculation (40% of max points)
        # Faster answers get higher bonus
        time_ratio = min(time_taken / time_limit, 1.0)  # Cap at 1.0

        # Exponential decay for speed bonus - rewards very fast answers
        speed_multiplier = math.exp(-2 * time_ratio)  # e^(-2t) gives good curve
        speed_bonus = int(max_points * 0.4 * speed_multiplier)

        total_points = base_points + speed_bonus

        logger.info(
            f"Score calculation - Correct: {is_correct}, Time: {time_taken}s/{time_limit}s, "
            f"Base: {base_points}, Speed Bonus: {speed_bonus}, Total: {total_points}"
        )

        return total_points, speed_bonus

    async def verify_answer_and_calculate_score(
        self, question_id: str, selected_option: int, time_taken: float
    ) -> Tuple[bool, int, int, Optional[Question]]:
        """
        Verify answer and calculate score based on correctness and speed
        Returns: (is_correct, total_points, speed_bonus, question)
        """
        try:
            if not ObjectId.is_valid(question_id):
                logger.error(f"Invalid ObjectId format: {question_id}")
                return False, 0, 0, None

            question_data = await self.collection.find_one(
                {"_id": ObjectId(question_id)}
            )

            if not question_data:
                logger.error(f"Question not found for verification: {question_id}")
                return False, 0, 0, None

            # Create question object with proper ObjectId handling
            question = Question(
                _id=str(question_data["_id"]),  # Convert ObjectId to string
                question=question_data["question"],
                options=question_data["options"],
                correct_answer=question_data["correct_answer"],
                time_limit=question_data.get("time_limit", 30),
                max_points=question_data.get("max_points", 100),
            )

            # Check correctness
            is_correct = question.correct_answer == selected_option

            # Calculate score
            total_points, speed_bonus = self.calculate_score(
                is_correct, time_taken, question.max_points, question.time_limit
            )

            logger.info(
                f"Answer verification - Question: {question_id}, "
                f"Selected: {selected_option}, Correct: {question.correct_answer}, "
                f"Time: {time_taken}s, Points: {total_points} (Speed: {speed_bonus})"
            )

            return is_correct, total_points, speed_bonus, question

        except Exception as e:
            logger.error(f"Error verifying answer and calculating score: {e}")
            return False, 0, 0, None

    async def seed_questions(self):
        """Seed initial questions for demo with timing data"""
        sample_questions = SAMPLE_QUESTIONS

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
