# app/auth/routes.py (DB-backed)
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import create_access_token, decode_token
from app.db.database import get_db
from app.db.schemas import UserCreate, UserRead
from app.db.crud import verify_user_credentials, create_user, get_user_by_username

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/register", response_model=UserRead, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_username(db, data.username):
        raise HTTPException(status_code=400, detail="UĹĽytkownik o takiej nazwie juĹĽ istnieje")
    user = create_user(db, data)
    return user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = verify_user_credentials(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NieprawidĹ‚owy login lub hasĹ‚o",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": str(user.username)})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def me(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token niewaĹĽny lub wygasĹ‚y")
    return {"username": payload.get("sub")}
