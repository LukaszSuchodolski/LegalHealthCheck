from typing import Literal

from pydantic import BaseModel


class Question(BaseModel):
    id: str
    text: str
    type: Literal["boolean"] = "boolean"
    weight: int = 1


class QuestionsPayload(BaseModel):
    version: int
    questions: list[Question]


class Answer(BaseModel):
    question_id: str
    value: Literal["yes", "no"]


class CheckupResult(BaseModel):
    score: int
    max_score: int
    recommendations: list[str]
