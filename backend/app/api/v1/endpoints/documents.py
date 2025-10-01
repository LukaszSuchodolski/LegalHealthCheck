
from fastapi import APIRouter
from app.models import DocumentTemplate

router = APIRouter(tags=["documents"], prefix="/documents")

MOCK_DOCS = [
    DocumentTemplate(id="regulamin_sklepu", title="Regulamin sklepu internetowego", category="ecommerce", status="update_required"),
    DocumentTemplate(id="polityka_prywatnosci", title="Polityka prywatności (RODO)", category="rodo", status="ok"),
    DocumentTemplate(id="umowa_zlecenia", title="Umowa zlecenia", category="hr", status="missing"),
]


@router.get("/", response_model=list[DocumentTemplate])
def list_documents() -> list[DocumentTemplate]:
    return MOCK_DOCS
