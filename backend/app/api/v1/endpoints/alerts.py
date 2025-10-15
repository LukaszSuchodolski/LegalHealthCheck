from datetime import UTC, datetime

from fastapi import APIRouter
from pydantic import BaseModel


class Alert(BaseModel):
    id: str
    title: str
    message: str
    severity: str  # e.g. "info" | "warning" | "critical"
    created_at: datetime


router = APIRouter(prefix="/api/v1", tags=["alerts"])


@router.get("/alerts", response_model=list[Alert])
def list_alerts() -> list[Alert]:
    now = datetime.now(tz=UTC)
    return [
        Alert(
            id="consumer-law-2024",
            title="Zmiany w prawie konsumenckim 2024/2025",
            message=(
                "Od 01.01.2025 wchodzą zmiany w ustawie o prawach konsumenta. "
                "Sprawdź, czy regulaminy i procedury są zgodne."
            ),
            severity="warning",
            created_at=now,
        ),
        Alert(
            id="bhp-training-deadlines",
            title="BHP – zbliżają się terminy szkoleń",
            message=(
                "Upływa ważność szkoleń okresowych BHP dla części pracowników. "
                "Zaplanuj odnowienia i uzupełnij dokumentację."
            ),
            severity="critical",
            created_at=now,
        ),
        Alert(
            id="rodo-dpa-review",
            title="RODO – przegląd umów powierzenia",
            message=(
                "Zalecany kwartalny przegląd umów powierzenia z dostawcami "
                "(hosting, mailing, analityka)."
            ),
            severity="info",
            created_at=now,
        ),
    ]
