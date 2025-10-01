
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class HealthScore(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Overall legal health score 0-100")
    level: str  # 'low' | 'medium' | 'high' risk
    updated_at: datetime


class RiskItem(BaseModel):
    area: str
    level: str  # 'low' | 'medium' | 'high'
    message: str
    actions: List[str] = []


class AuditAnswer(BaseModel):
    question_id: str
    value: str


class AuditResult(BaseModel):
    score: HealthScore
    risks: List[RiskItem]


class DocumentTemplate(BaseModel):
    id: str
    title: str
    category: str
    status: str  # 'ok' | 'update_required' | 'missing'


class AlertItem(BaseModel):
    id: str
    title: str
    effective_from: datetime
    summary: str
    actions: List[str] = []
