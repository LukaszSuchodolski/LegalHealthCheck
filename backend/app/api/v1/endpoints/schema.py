import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/checkup", tags=["checkup-schema"])

APP_DIR = Path(__file__).resolve().parents[3]
SCHEMA_PATH = APP_DIR / "schemas" / "checkup_schema.json"


@router.get("/schema")
def get_checkup_schema():
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
