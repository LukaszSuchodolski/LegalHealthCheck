from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class CheckupInput(BaseModel):
    has_employees: bool = Field(False, description="Czy zatrudnia pracowników")
    bhp_training: bool = Field(True, description="Czy szkolenia BHP są aktualne")

class RiskItem(BaseModel):
    area: str
    level: str  # 'low' | 'medium' | 'high'
    message: str
    actions: List[str] = []

class HealthScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    level: str
    updated_at: datetime

class AuditResult(BaseModel):
    score: HealthScore
    risks: List[RiskItem]
