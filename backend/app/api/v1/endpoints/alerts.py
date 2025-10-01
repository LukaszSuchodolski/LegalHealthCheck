from fastapi import APIRouter
from datetime import datetime, timedelta
from app.schemas.common import AlertItem

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=list[AlertItem])
def list_alerts():
    now = datetime.utcnow()
    return [
        AlertItem(
            id="consumer-law-2024",
            title="Zmiany w prawie konsumenckim – aktualizacja regulaminów",
            effective_from=now - timedelta(days=90),
            summary="Nowelizacja wymaga doprecyzowania informacji dla konsumenta i procedur reklamacji.",
            actions=["Sprawdź klauzule odstąpienia", "Zaktualizuj procedurę reklamacyjną"]
        ),
        AlertItem(
            id="cookies-2025",
            title="Wytyczne dot. plików cookies – polityka prywatności",
            effective_from=now - timedelta(days=10),
            summary="Zalecane uzupełnienie o narzędzia analityczne i cele przetwarzania.",
            actions=["Dodaj listę narzędzi", "Zaktualizuj baner i politykę cookies"]
        )
    ]
