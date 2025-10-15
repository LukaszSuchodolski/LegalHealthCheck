from fastapi import APIRouter, HTTPException

from app.core.files import read_json
from app.schemas.checkup import Answer, CheckupResult, QuestionsPayload

router = APIRouter(prefix="/api/v1", tags=["checkup"])


@router.get("/checkup/questions", response_model=QuestionsPayload)
def get_questions():
    data = read_json("checkup/questions.json")
    return QuestionsPayload(**data)


@router.post("/audit/checkup", response_model=CheckupResult)
def run_checkup(answers: list[Answer]):
    payload = read_json("checkup/questions.json")
    qp = QuestionsPayload(**payload)

    weights = {q.id: q.weight for q in qp.questions}

    score = 0
    for a in answers:
        if a.question_id not in weights:
            raise HTTPException(
                status_code=422,
                detail=f"Unknown question_id: {a.question_id}",
            )
        if a.value == "yes":
            score += weights[a.question_id] * 10

    max_score = sum(weights.values()) * 10

    recommendations: list[str] = []
    if score < max_score:
        if "bhp_training" in weights:
            recommendations.append("Zorganizuj i udokumentuj szkolenia BHP.")
        if "rodo_policy" in weights:
            recommendations.append("Wdroż politykę ochrony danych (RODO).")

    if not recommendations:
        recommendations = ["Wygląda dobrze — utrzymuj zgodność."]

    return CheckupResult(
        score=score,
        max_score=max_score,
        recommendations=recommendations,
    )
