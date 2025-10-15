from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_checkup_basic_flow():
    payload = {
        "answers": [
            {"question_id": "has_employees", "value": "yes"},
            {"question_id": "bhp_training", "value": "no"},
        ]
    }
    r = client.post("/api/v1/audit/checkup", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert "score" in data and "recommendations" in data
