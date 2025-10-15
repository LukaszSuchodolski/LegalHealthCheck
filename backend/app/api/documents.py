from fastapi import APIRouter

from app.core.files import read_json
from app.schemas.documents import DocumentsPayload

router = APIRouter(prefix="/api/v1", tags=["documents"])


@router.get("/documents", response_model=DocumentsPayload)
def list_documents():
    return DocumentsPayload(**read_json("documents/documents.json"))
