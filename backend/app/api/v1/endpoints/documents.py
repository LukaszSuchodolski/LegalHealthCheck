# ruff: noqa: B008
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.api.auth import get_current_user
from app.core.files import DATA_DIR  # C:\LegalHealthCheck_clean\data


class DocumentTemplate(BaseModel):
    id: str
    title: str
    category: str
    status: str  # ok | missing | update_required


class UploadedFile(BaseModel):
    filename: str
    size: int
    content_type: str | None = None
    uploaded_at: datetime


router = APIRouter(prefix="/api/v1", tags=["documents"])

DATA_PATH = Path(DATA_DIR).resolve()
UPLOAD_DIR = DATA_PATH / "uploads"
TEMPLATES_DIR = DATA_PATH / "templates"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)

MOCK_DOCS: list[DocumentTemplate] = [
    DocumentTemplate(
        id="regulamin_sklepu",
        title="Regulamin sklepu internetowego",
        category="ecommerce",
        status="update_required",
    ),
    DocumentTemplate(
        id="polityka_prywatnosci",
        title="Polityka prywatności (RODO)",
        category="rodo",
        status="ok",
    ),
    DocumentTemplate(
        id="umowa_zlecenia",
        title="Umowa zlecenia",
        category="hr",
        status="missing",
    ),
]


@router.get("/documents/templates", response_model=list[DocumentTemplate])
def list_document_templates() -> list[DocumentTemplate]:
    return MOCK_DOCS


@router.get("/documents/templates/download/{doc_id}")
def download_template(doc_id: str):
    for ext in (".docx", ".pdf", ".txt"):
        candidate = (TEMPLATES_DIR / f"{doc_id}{ext}").resolve()
        try:
            candidate.relative_to(TEMPLATES_DIR)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid path") from None
        if candidate.is_file():
            return FileResponse(candidate, filename=candidate.name)
    raise HTTPException(status_code=404, detail="Template not found")


@router.get("/documents/templates/raw/{doc_id}")
def raw_template_info(doc_id: str):
    chosen = None
    for ext in (".docx", ".pdf", ".txt"):
        candidate = (TEMPLATES_DIR / f"{doc_id}{ext}").resolve()
        try:
            candidate.relative_to(TEMPLATES_DIR)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid path") from None
        if candidate.is_file():
            chosen = candidate
            break
    if not chosen:
        return {
            "found": False,
            "tried": [f"{doc_id}{e}" for e in [".docx", ".pdf", ".txt"]],
        }
    info = {
        "found": True,
        "path": str(chosen),
        "name": chosen.name,
        "size": chosen.stat().st_size,
        "ext": chosen.suffix.lower(),
    }
    if chosen.suffix.lower() == ".txt":
        info["preview"] = chosen.read_text(encoding="utf-8", errors="ignore")
    return info


@router.post("/documents/generate/{doc_id}")
async def generate_document(doc_id: str, payload: dict):
    template_path = (TEMPLATES_DIR / f"{doc_id}.txt").resolve()
    try:
        template_path.relative_to(TEMPLATES_DIR)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path") from None
    if not template_path.is_file():
        raise HTTPException(status_code=404, detail="Template not found")

    text = template_path.read_text(encoding="utf-8")
    for k, v in payload.items():
        text = text.replace(f"{{{{{k}}}}}", str(v))

    ts = datetime.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%S")
    out_name = f"{doc_id}__generated__{ts}.txt"
    out_path = (UPLOAD_DIR / out_name).resolve()
    out_path.write_text(text, encoding="utf-8")

    return FileResponse(out_path, media_type="text/plain", filename=out_name)


@router.post("/documents/upload", response_model=UploadedFile)
async def upload_document(
    file: UploadFile = File(...), user: dict = Depends(get_current_user)
) -> UploadedFile:  # noqa: B008
    original_name = Path(file.filename or "uploaded.bin").name.replace(" ", "_")
    ts = datetime.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%S")
    safe_name = f"{ts}__{original_name}"
    dest = (UPLOAD_DIR / safe_name).resolve()
    try:
        dest.relative_to(UPLOAD_DIR)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path") from None

    try:
        with dest.open("wb") as f:
            while chunk := await file.read(1024 * 1024):
                f.write(chunk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nie udało się zapisać pliku: {e}") from None

    size = dest.stat().st_size
    return UploadedFile(
        filename=safe_name,
        size=size,
        content_type=file.content_type,
        uploaded_at=datetime.now(tz=timezone.utc),
    )


@router.get("/documents/uploads", response_model=list[UploadedFile])
def list_uploads() -> list[UploadedFile]:
    out: list[UploadedFile] = []
    for p in sorted(UPLOAD_DIR.glob("*")):
        if p.is_file():
            out.append(
                UploadedFile(
                    filename=p.name,
                    size=p.stat().st_size,
                    content_type=None,
                    uploaded_at=datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc),
                )
            )
    return out


@router.get("/documents/download/{filename}")
def download_document(filename: str):
    candidate = (UPLOAD_DIR / filename).resolve()
    try:
        candidate.relative_to(UPLOAD_DIR)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path") from None
    if not candidate.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(candidate, filename=candidate.name)


@router.delete("/documents/delete/{filename}")
def delete_document(filename: str, user: dict = Depends(get_current_user)):  # noqa: B008
    candidate = (UPLOAD_DIR / filename).resolve()
    try:
        candidate.relative_to(UPLOAD_DIR)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path") from None
    if not candidate.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    try:
        candidate.unlink()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nie udało się usunąć: {e}") from None
    return {"deleted": filename}
