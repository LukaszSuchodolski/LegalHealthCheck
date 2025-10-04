# app/db/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)

class UserRead(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class LoginForm(BaseModel):
    username: str
    password: str
