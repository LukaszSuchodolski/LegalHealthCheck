from fastapi import APIRouter
from app.schemas.common import DocumentTemplate

router = APIRouter(prefix="/documents", tags=["documents"])

MOCK_DOCS = [
    DocumentTemplate(id="regulamin_sklepu", title="Regulamin sklepu internetowego", category="ecommerce", status="update_required"),
    DocumentTemplate(id="polityka_prywatnosci", title="Polityka prywatności (RODO)", category="rodo", status="ok"),
    DocumentTemplate(id="umowa_zlecenia", title="Umowa zlecenia", category="hr", status="missing"),
]

@router.get("/", response_model=list[DocumentTemplate])
def list_documents():
    return MOCK_DOCS
