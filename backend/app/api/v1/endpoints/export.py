from datetime import UTC, datetime
from io import BytesIO

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas

router = APIRouter(prefix="/api/v1", tags=["checkup-export"])


class CheckupExportPayload(BaseModel):
    score: int = Field(ge=0, le=100)
    max_score: int = 100
    recommendations: list[str] = []
    company_name: str | None = None
    locale: str = "pl"


def _build_pdf_bytes(payload: CheckupExportPayload) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    x = 2 * cm
    y = height - 2 * cm

    c.setFont("Helvetica-Bold", 16)
    c.drawString(x, y, "Legal Health Check — Raport")
    y -= 1.2 * cm

    c.setFont("Helvetica", 10)
    c.drawString(x, y, f"Data: {datetime.now(tz=UTC).astimezone().strftime('%Y-%m-%d %H:%M %Z')}")
    y -= 0.6 * cm

    if payload.company_name:
        c.drawString(x, y, f"Firma: {payload.company_name}")
        y -= 0.6 * cm

    # ✅ Poprawa E501 — krótszy wiersz
    c.setFont("Helvetica-Bold", 12)
    percent = round(100 * payload.score / max(payload.max_score, 1))
    score_text = f"Wynik: {payload.score}/{payload.max_score} ({percent}%)"
    c.drawString(x, y, score_text)
    y -= 1.0 * cm

    c.setFont("Helvetica-Bold", 12)
    c.drawString(x, y, "Rekomendacje:")
    y -= 0.6 * cm

    c.setFont("Helvetica", 10)
    if payload.recommendations:
        for idx, rec in enumerate(payload.recommendations, start=1):
            line = f"{idx}. {rec}"
            max_chars = 95
            while line:
                line_part = line[:max_chars]
                c.drawString(x, y, line_part)
                y -= 0.5 * cm
                line = line[max_chars:]
                if y < 2 * cm:
                    c.showPage()
                    y = height - 2 * cm
                    c.setFont("Helvetica", 10)
    else:
        c.drawString(x, y, "— brak dodatkowych zaleceń —")
        y -= 0.5 * cm

    if y < 3 * cm:
        c.showPage()
        y = height - 2 * cm
    c.setFont("Helvetica-Oblique", 8)
    y -= 0.5 * cm
    c.drawString(x, y, "Uwaga: raport ma charakter informacyjny i nie stanowi porady prawnej.")

    c.showPage()
    c.save()
    return buf.getvalue()


@router.post("/checkup/export", response_class=StreamingResponse)
def export_checkup_pdf(payload: CheckupExportPayload):
    try:
        pdf_bytes = _build_pdf_bytes(payload)
    # ✅ Poprawa B904 — wyjątek z „from e”
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF generation error: {e}") from e

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="checkup-report.pdf"'},
    )
