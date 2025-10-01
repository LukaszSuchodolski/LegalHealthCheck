
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["auth"], prefix="/auth")


class AuthRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthRequest):
    # Demo only: don't use in production!
    return AuthResponse(access_token="demo-token")
