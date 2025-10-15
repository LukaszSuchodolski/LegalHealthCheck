from pydantic import BaseModel
from app.models import AuditAnswer, AuditResult, HealthScore, RiskItem
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

# NAJPIERW router:
router = APIRouter(tags=["audit"], prefix="/audit")

# Twoje istniejące modele
# Ścieżki do schematów
APP_DIR = Path(__file__).resolve().parents[3]  # app/
SCHEMA_PATH = APP_DIR / "schemas" / "checkup_schema.json"
DOCS_PATH = APP_DIR / "schemas" / "documents.json"


# --- (opcjonalny) GET schematu przez /audit ---
@router.get("/checkup/schema")
def get_checkup_schema_via_audit():
    try:
        if not SCHEMA_PATH.exists():
            raise HTTPException(status_code=404, detail=f"Nie znaleziono pliku: {SCHEMA_PATH}") from None
        return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise HTTPException(
        status_code=500,
        detail=f"Błąd JSON w {SCHEMA_PATH}: {e.msg} (linia {e.lineno}, kol {e.colno})",
    ) from None


# ---------- ISTNIEJĄCE ENDPOINTY (bez zmian) ----------
@router.get("/health", response_model=HealthScore)
def get_health_score() -> HealthScore:
    return HealthScore(score=72, level="medium", updated_at=datetime.utcnow())


@router.post("/checkup", response_model=AuditResult)
def run_checkup(answers: list[AuditAnswer]) -> AuditResult:
    high_risk = any(
        a.question_id == "has_employees" and a.value.lower() == "yes" for a in answers
    ) and any(a.question_id == "bhp_training" and a.value.lower() == "no" for a in answers)
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
                    "Ustalić cykl przypomnień w kalendarzu zgodności",
                ],
            )
        )
    score = 85 - (20 if high_risk else 0)
    return AuditResult(
        score=HealthScore(
            score=score, level="medium" if score < 80 else "low", updated_at=datetime.utcnow()
        ),
        risks=risks,
    )


# ---------- NOWE: CHECKUP v2 z plików JSON + visible_when ----------
def _eval_jsonlogic(rule: Any, data: dict[str, Any]) -> bool:
    if rule is None:
        return True
    if isinstance(rule, bool):
        return rule
    if isinstance(rule, dict):
        if "var" in rule:
            return data.get(rule["var"])
        if "==" in rule:
            a, b = rule["=="]
            return _eval_jsonlogic(a, data) == _eval_jsonlogic(b, data)
        if "and" in rule:
            return all(_eval_jsonlogic(r, data) for r in rule["and"])
        if "or" in rule:
            return any(_eval_jsonlogic(r, data) for r in rule["or"])
    return False


def _is_visible(q: dict, data: dict[str, Any]) -> bool:
    return _eval_jsonlogic(q.get("visible_when"), data)


class Answer(BaseModel):
    question_id: str
    value: bool


class CheckupResult(BaseModel):
    score: float
    level: str
    recommendations: list[str]
    missing_documents: list[dict[str, Any]]


@router.post("/checkup_v2", response_model=CheckupResult)
def run_checkup_v2(answers: list[Answer]) -> CheckupResult:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    docs = json.loads(DOCS_PATH.read_text(encoding="utf-8"))["documents"]

    ans_map: dict[str, bool] = {a.question_id: a.value for a in answers}
    applicable = [q for q in schema["questions"] if _is_visible(q, ans_map)]
    total_weight = sum(q.get("weight", 1) for q in applicable)
    gained = 0.0
    recommendations: list[str] = []

    for q in applicable:
        qid = q["id"]
        val = ans_map.get(qid)
        target = q.get("target", "true") == "true"
        weight = q.get("weight", 1)
        missing_penalty = q.get("missing", 0)

        if val is None:
            gained += max(0, weight - missing_penalty)
            recommendations.append(f"Uzupełnij: {q['label_pl']}")
        elif val == target:
            gained += weight
        else:
            recommendations.append(f"Popraw/uzupełnij: {q['label_pl']}")

    score = round((gained / total_weight) * 100, 2) if total_weight > 0 else 0.0

    level = "medium"
    for sl in schema["score_levels"]:
        if score <= sl["max"] and score > sl["min"]:
            level = sl["level"]
            break

    missing_documents: list[dict[str, Any]] = []
    for d in docs:
        if _eval_jsonlogic(d.get("required_when"), ans_map):
            missing_documents.append(
                {
                    "id": d["id"],
                    "name_pl": d["name_pl"],
                    "legal_basis": d["legal_basis"],
                    "area": d["area"],
                }
            )

    if ans_map.get("has_employees") and (
        not ans_map.get("bhp_training") or not ans_map.get("bhp_training_proofs")
    ):
        level = "high"

    return CheckupResult(
        score=score,
        level=level,
        recommendations=recommendations,
        missing_documents=missing_documents,
    )





