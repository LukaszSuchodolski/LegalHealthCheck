# app/db/crud.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db import models
from app.db.schemas import UserCreate
from app.core.security import pwd_context

def get_user_by_username(db: Session, username: str) -> models.User | None:
    stmt = select(models.User).where(models.User.username == username)
    return db.execute(stmt).scalar_one_or_none()

def create_user(db: Session, data: UserCreate) -> models.User:
    user = models.User(
        username=data.username,
        email=data.email,
        password_hash=pwd_context.hash(data.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def verify_user_credentials(db: Session, username: str, password: str) -> models.User | None:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not pwd_context.verify(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user
