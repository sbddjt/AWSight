from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from config import DB_PATH

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AccountModel(Base):
    __tablename__ = "accounts"

    id                    = Column(String, primary_key=True)
    name                  = Column(String, nullable=False)
    encrypted_access_key  = Column(String, nullable=False)
    encrypted_secret_key  = Column(String, nullable=False)
    region                = Column(String, default="ap-northeast-2")
    created_at            = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
