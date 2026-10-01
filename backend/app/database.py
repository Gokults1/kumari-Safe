import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

connect_args = {}
if "postgresql" in settings.SQLALCHEMY_DATABASE_URI:
    connect_args["connect_timeout"] = 1

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_db_available = None
_last_check = 0.0

def is_db_available() -> bool:
    global _db_available, _last_check
    now = time.time()
    if _db_available is not None and (now - _last_check) < 15.0:
        return _db_available
    
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        _db_available = True
    except Exception:
        _db_available = False
    
    _last_check = now
    return _db_available

def get_db():
    if not is_db_available():
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

