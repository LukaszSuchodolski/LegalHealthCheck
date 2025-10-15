from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.checkup import router as checkup_router
from app.api.auth import router as auth_router
from app.api.v1.endpoints.checkup_results import router as checkup_results_router
from app.api.v1.endpoints.documents import router as documents_v1_router
# (opcjonalnie) alerts jeśli masz ten plik:
try:
    from app.api.v1.endpoints.alerts import router as alerts_router  # noqa: F401
except Exception:
    alerts_router = None  # type: ignore

app = FastAPI(title="LegalHealthCheck API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# Podpinamy routery (każdy ma swój prefix, np. /api/v1/...)
app.include_router(checkup_router)
app.include_router(documents_v1_router)
app.include_router(checkup_results_router)
app.include_router(auth_router)
if alerts_router:
    app.include_router(alerts_router)


app.include_router(checkup_results_router)


app.include_router(checkup_results_router)








