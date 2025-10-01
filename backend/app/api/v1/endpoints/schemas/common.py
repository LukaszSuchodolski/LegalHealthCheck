from pydantic import BaseModel
from datetime import datetime
from typing import List

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
