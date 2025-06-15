from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema

        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
        raise ValueError("Invalid ObjectId")

    def __str__(self):
        return str(self)


class Question(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

    id: Optional[str] = Field(default=None, alias="_id")  # Change to str
    question: str = Field(..., min_length=10, max_length=500)
    options: List[str] = Field(..., min_length=2, max_length=4)
    correct_answer: int = Field(..., ge=0, le=3)
    time_limit: int = Field(default=30, description="Time limit in seconds")
    max_points: int = Field(
        default=100, description="Maximum points for correct answer"
    )

    @field_validator("id", mode="before")
    @classmethod
    def validate_id(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

    @field_validator("options")
    @classmethod
    def validate_options(cls, v):
        if len(v) < 2:
            raise ValueError("Must have at least 2 options")
        if len(v) > 4:
            raise ValueError("Cannot have more than 4 options")
        for option in v:
            if not option.strip():
                raise ValueError("Options cannot be empty")
        return [option.strip() for option in v]

    @field_validator("correct_answer")
    @classmethod
    def validate_correct_answer(cls, v, info):
        return v


class QuestionResponse(BaseModel):
    id: str
    question: str
    options: List[str]
    time_limit: int = 30
    max_points: int = 100
    # Note: correct_answer is deliberately NOT included in response for security


class AnswerSubmission(BaseModel):
    player_id: str = Field(..., description="Player ID")
    question_id: str = Field(..., description="Question ID")
    selected_option: int = Field(
        ..., ge=0, le=3, description="Selected option index (0-3)"
    )
    time_taken: float = Field(..., gt=0, description="Time taken to answer in seconds")

    @field_validator("player_id", "question_id")
    @classmethod
    def validate_object_ids(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId format")
        return v

    @field_validator("selected_option")
    @classmethod
    def validate_option_range(cls, v):
        if v < 0 or v > 3:
            raise ValueError("Selected option must be between 0 and 3")
        return v

    @field_validator("time_taken")
    @classmethod
    def validate_time_taken(cls, v):
        if v <= 0:
            raise ValueError("Time taken must be positive")
        if v > 120:  # Max 2 minutes per question
            raise ValueError("Time taken cannot exceed 120 seconds")
        return v


class AnswerResponse(BaseModel):
    is_correct: bool
    points_earned: int = 0
    new_score: Optional[int] = None
    time_taken: float
    speed_bonus: int = 0
    message: str = "Answer processed successfully"
    correct_answer: Optional[int] = None  # Include correct answer for feedback
