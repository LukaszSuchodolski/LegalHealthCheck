# backend/app/core/security.py

from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import settings

# Bezpieczny i prosty algorytm haszowania (działa na każdej platformie)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Prosta, wbudowana baza użytkowników (na start). Podmień na DB.
_FAKE_USER_DB = {
    "admin": {
        "username": "admin",
        # hasło: admin
        "password_hash": pwd_context.hash("admin"),
    }
}

def verify_password(plain_password: str, password_hash: str) -> bool:
    """Sprawdza czy podane hasło pasuje do hasha"""
    return pwd_context.verify(plain_password, password_hash)


def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Zwraca użytkownika, jeśli dane logowania są poprawne"""
    user = _FAKE_USER_DB.get(username)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return user


def create_access_token(data: dict, expires_minutes: Optional[int] = None) -> str:
    """Tworzy JWT z określonym czasem ważności"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Dekoduje JWT i zwraca payload, jeśli token jest ważny"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError as e:
        raise ValueError("Invalid or expired token") from e
