
# LegalHealth Check — Full-Stack Skeleton (React + FastAPI)

This zip contains a minimal working skeleton.

## Run Backend (FastAPI)
```
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API available at http://127.0.0.1:8000 (docs at /docs).

## Run Frontend (React)
You can use Vite:

```
cd frontend
npm install
npm run dev
```
If your environment doesn't have Vite initialized, create a Vite app first and copy `src` & `index.html` into it (see `frontend/README.md`).

## Configure CORS
- Backend CORS origins are read from `.env` (default allows Vite on :5173).

## Notes
- This is a demo skeleton with mock data and very simple logic.
- Replace mock endpoints with real implementations, validation, and auth before production.
