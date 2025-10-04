param(
  [string]$ProjectRoot = "C:\LegalHealthCheck"
)

$ErrorActionPreference = "Stop"

function Backup-File($path) {
  if (Test-Path $path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item $path "$path.$ts.bak" -Force
  }
}

$backend = Join-Path $ProjectRoot "backend"
$appDir  = Join-Path $backend "app"
$dbDir   = Join-Path $appDir "db"
$authDir = Join-Path $appDir "auth"
$reqTxt  = Join-Path $backend "requirements.txt"
$mainPy  = Join-Path $appDir "main.py"
$routesPy = Join-Path $authDir "routes.py"

# --- 1) Upewnij się, że katalogi istnieją ---
New-Item -ItemType Directory -Force -Path $dbDir | Out-Null
New-Item -ItemType Directory -Force -Path $authDir | Out-Null

# --- 2) Zawartości plików ---
$db_database = @"
# app/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

DATABASE_URL = getattr(settings, "database_url", None) or "sqlite:///./legalhealth.db"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"@

$db_models = @"
# app/db/models.py
from sqlalchemy import Column, Integer, String, DateTime, func, Boolean, UniqueConstraint
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("username", name="uq_users_username"),
                      UniqueConstraint("email", name="uq_users_email"))
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
"@

$db_schemas = @"
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
"@

$db_crud = @"
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
"@

$auth_routes = @"
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
        raise HTTPException(status_code=400, detail="Użytkownik o takiej nazwie już istnieje")
    user = create_user(db, data)
    return user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = verify_user_credentials(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy login lub hasło",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": str(user.username)})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def me(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token nieważny lub wygasły")
    return {"username": payload.get("sub")}
"@

# --- 3) Zapis plików DB ---
Set-Content -Path (Join-Path $dbDir "database.py") -Value $db_database -Encoding UTF8
Set-Content -Path (Join-Path $dbDir "models.py")   -Value $db_models   -Encoding UTF8
Set-Content -Path (Join-Path $dbDir "schemas.py")  -Value $db_schemas  -Encoding UTF8
Set-Content -Path (Join-Path $dbDir "crud.py")     -Value $db_crud     -Encoding UTF8

# --- 4) Podmień auth/routes.py (backup + write) ---
Backup-File $routesPy
Set-Content -Path $routesPy -Value $auth_routes -Encoding UTF8

# --- 5) Dopisz SQLAlchemy do requirements.txt (jeśli brakuje) ---
if (-not (Test-Path $reqTxt)) {
  throw "Nie znaleziono $reqTxt"
}
$req = Get-Content $reqTxt -Raw
if ($req -notmatch "(?im)^\s*SQLAlchemy\s*(>=|==)") {
  Add-Content $reqTxt "`nSQLAlchemy>=2.0.0"
}

# --- 6) Dodaj hook startup do main.py (imports + create_all), jeśli brak ---
if (-not (Test-Path $mainPy)) {
  throw "Nie znaleziono $mainPy"
}
$main = Get-Content $mainPy -Raw

$needImports = $main -notmatch "from\s+app\.db\.database\s+import\s+Base,\s*engine"
$needModels  = $main -notmatch "from\s+app\.db\s+import\s+models"
$needHook    = $main -notmatch "Base\.metadata\.create_all\(bind=engine\)"

if ($needImports) {
  $main = $main -replace "(from fastapi import FastAPI[^\n]*\n)", "`$0from app.db.database import Base, engine`n"
}
if ($needModels) {
  # jeśli już dodano pierwszą linię importu, to dodaj drugą bez dublowania
  if ($main -notmatch "from\s+app\.db\s+import\s+models") {
    $main = $main -replace "(from app\.db\.database import Base, engine[^\n]*\n)", "`$0from app.db import models`n"
  }
}
if ($needHook) {
  $main += @"

@app.on_event("startup")
def _init_db():
    # dev: automatyczne tworzenie tabel
    Base.metadata.create_all(bind=engine)
"@
  Backup-File $mainPy
  Set-Content -Path $mainPy -Value $main -Encoding UTF8
} else {
  # i tak zrób backup, ale nie modyfikuj
  Backup-File $mainPy
}

Write-Host '✅ Zakończono aktualizację.'
Write-Host '➡️ Teraz uruchom:'
Write-Host '   cd $backend'
Write-Host '   .venv\Scripts\activate'
Write-Host '   pip install -r requirements.txt'
Write-Host 'uvicorn app.main:app --reload'
