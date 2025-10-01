
from fastapi import APIRouter
from datetime import datetime
from app.models import AuditAnswer, AuditResult, HealthScore, RiskItem

router = APIRouter(tags=["audit"], prefix="/audit")


@router.get("/health", response_model=HealthScore)
def get_health_score() -> HealthScore:
    # mock computation
    return HealthScore(score=72, level="medium", updated_at=datetime.utcnow())


@router.post("/checkup", response_model=AuditResult)
def run_checkup(answers: list[AuditAnswer]) -> AuditResult:
    # very naive demo logic
    high_risk = any(a.question_id == "has_employees" and a.value.lower() == "yes" for a in answers)         and any(a.question_id == "bhp_training" and a.value.lower() == "no" for a in answers)

    risks = []
    if high_risk:
        risks.append(RiskItem(
            area="BHP i kadry",
            level="high",
            message="Brak aktualnych szkoleń BHP przy zatrudnionych pracownikach.",
            actions=[
                "Zaplanować szkolenia wstępne/okresowe BHP",
                "Zaktualizować dokumentację stanowiskową",
                "Ustalić cykl przypomnień w kalendarzu zgodności"
            ]
        ))

    score = 85 - (20 if high_risk else 0)
    result = AuditResult(
        score=HealthScore(score=score, level="medium" if score < 80 else "low", updated_at=datetime.utcnow()),
        risks=risks
    )
    return result
