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
