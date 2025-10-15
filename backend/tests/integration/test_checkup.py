from fastapi.testclient import TestClient

from app.main import app

# Klient testowy FastAPI
client = TestClient(app)


def test_checkup_basic_flow():
    # Endpoint /api/v1/audit/checkup oczekuje LISTY odpowiedzi,
    # gdzie value to dosłownie string 'yes' lub 'no'
    payload = [
        {"question_id": "has_employees", "value": "yes"},
        {"question_id": "bhp_training", "value": "no"},
    ]

    r = client.post("/api/v1/audit/checkup", json=payload)

    # Jeśli walidacja zwróci 4xx/5xx, pokaż szczegóły w komunikacie testu
    assert r.status_code == 200, f"{r.status_code} -> {r.text}"

    data = r.json()
    assert "score" in data and "recommendations" in data
