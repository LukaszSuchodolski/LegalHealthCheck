import os
from datetime import UTC, datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.files import read_json

router = APIRouter(prefix="/api/v1", tags=["auth"])

# --- Konfiguracja JWT ---
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-please")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MIN", "60"))

# --- Schematy ---
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str

class MeResponse(BaseModel):
    sub: str
    role: str

# --- JWT helpers ---
def _make_jwt(uid: str, role: str) -> str:
    now = datetime.now(tz=UTC)
    payload = {
        "sub": uid,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MIN)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def _decode_from_header(authorization: Optional[str]) -> dict | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        return None

# --- /auth/login (bcrypt) ---
@router.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request):
    # users.json jest mapą: email -> rekord użytkownika
    users = read_json("users.json") or {}
    user = users.get(payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    phash = user.get("password_hash")
    if not phash or not bcrypt.checkpw(payload.password.encode("utf-8"), phash.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    uid = user.get("id") or payload.email
    role = user.get("role", "user")
    token = _make_jwt(uid, role)
    return LoginResponse(access_token=token)

# --- /auth/me (sprawdzenie tokenu) ---
@router.get("/auth/me", response_model=MeResponse)
def me(authorization: str | None = Header(default=None)):
    payload = _decode_from_header(authorization)
    if not payload:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return MeResponse(sub=payload.get("sub", "unknown"), role=payload.get("role", "user"))

# --- Dependency do ochrony endpointów ---
_security = HTTPBearer(auto_error=False)

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(_security)):  # noqa: B008
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = creds.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from None
    return {"sub": payload.get("sub", "anonymous"), "role": payload.get("role", "user")}


