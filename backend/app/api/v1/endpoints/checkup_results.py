# ruff: noqa: B008
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from app.core.files import DATA_DIR

try:
    from app.api.auth import get_current_user
except Exception:  # fallback gdy brak auth

    def get_current_user():
        return {"sub": "anonymous"}


router = APIRouter(prefix="/api/v1/checkup", tags=["checkup"])


def _current_user_optional(authorization: str | None = Header(default=None)) -> dict:
    """
    Optional auth: jeśli jest Bearer dev-token-<uid> -> zwróć {sub: uid},
    w innym wypadku -> {sub: "anonymous"} (bez 401).
    """
    try:
        if authorization and authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
            if token.startswith("dev-token-"):
                return {"sub": token.removeprefix("dev-token-"), "role": "user"}
    except Exception:
        pass
    return {"sub": "anonymous", "role": "user"}


RESULTS_DIR = (Path(DATA_DIR) / "results").resolve()
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


class CheckupResult(BaseModel):
    answers: dict
    meta: dict | None = None


@router.post("/results", status_code=201)
def save_checkup_results(payload: CheckupResult, user: dict = Depends(_current_user_optional)):
    if not isinstance(payload.answers, dict) or not payload.answers:
        raise HTTPException(status_code=400, detail="answers must be a non-empty object")
    uid = str((user or {}).get("sub", "anonymous"))
    ts = datetime.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    record = {
        "user": uid,
        "timestamp": ts,
        "answers": payload.answers,
        "meta": payload.meta or {},
    }
    udir = RESULTS_DIR / uid
    udir.mkdir(parents=True, exist_ok=True)
    f = udir / f"{ts}.json"
    f.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"ok": True, "file": f.name}


@router.get("/results/list")
def list_checkup_results(user: dict = Depends(_current_user_optional)):
    uid = str((user or {}).get("sub", "anonymous"))
    udir = RESULTS_DIR / uid
    if not udir.exists():
        return []
    out: list[dict[str, Any]] = []
    for p in sorted(udir.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
        st = p.stat()
        out.append(
            {
                "filename": p.name,
                "size": st.st_size,
                "modified": datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).isoformat(),
            }
        )
    return out


@router.get("/results/latest")
def latest_checkup_result(user: dict = Depends(_current_user_optional)):
    uid = str((user or {}).get("sub", "anonymous"))
    udir = RESULTS_DIR / uid
    if not udir.exists():
        raise HTTPException(status_code=404, detail="No results")
    files = sorted(udir.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)
    if not files:
        raise HTTPException(status_code=404, detail="No results")
    return json.loads(files[0].read_text(encoding="utf-8"))
