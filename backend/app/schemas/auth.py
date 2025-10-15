from typing import Literal

from pydantic import BaseModel


class User(BaseModel):
    id: str
    email: str
    password_hash: str
    role: Literal["admin", "user"] = "user"


class UsersPayload(BaseModel):
    version: int
    users: list[User]


class LoginRequest(BaseModel):
    email: str | None = None
    password: str | None = None


class LoginResponse(BaseModel):
    token: str
    user_id: str
    role: str


class MeResponse(BaseModel):
    user_id: str
    email: str
    role: str
