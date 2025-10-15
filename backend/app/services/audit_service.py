from datetime import datetime

from app.schemas.audit import AuditResult, CheckupInput, HealthScore, RiskItem


def compute_audit(payload: CheckupInput) -> AuditResult:
    # Prosta logika demo:
    # jeśli są pracownicy i BHP nieaktualne → high risk
    high_risk = payload.has_employees and (not payload.bhp_training)

    risks = []
    if high_risk:
        risks.append(
            RiskItem(
                area="BHP i kadry",
                level="high",
                message="Brak aktualnych szkoleń BHP przy zatrudnionych pracownikach.",
                actions=[
                    "Zaplanować szkolenia wstępne/okresowe BHP",
                    "Zaktualizować dokumentację stanowiskową",
                    "Dodać przypomnienia w kalendarzu zgodności",
                ],
            )
        )

    score_val = 85 - (20 if high_risk else 0)
    score = HealthScore(
        score=score_val,
        level="medium" if score_val < 80 else "low",
        updated_at=datetime.utcnow(),
    )
    return AuditResult(score=score, risks=risks)
