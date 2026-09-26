import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.config import settings

# Usually we might want to use a separate test DB, but for this step we can use the same
# or just assume the DB is running locally as per docker-compose.
# Since we need PostGIS, we can't easily use SQLite.

SQLALCHEMY_DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    # Create the tables (requires PostGIS to be enabled on the DB)
    Base.metadata.create_all(bind=engine)
    yield engine
from fastapi.testclient import TestClient
from app.main import app

from app.database import get_db

@pytest.fixture(scope="function")
def db(db_engine):
    # Clear the table before running the test to ensure isolated state
    with db_engine.connect() as cleanup_conn:
        cleanup_conn.execute(text("TRUNCATE TABLE emergency_facilities RESTART IDENTITY CASCADE;"))
        cleanup_conn.commit()

    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    
    # Explicitly clear the table to prevent data bleed from session.commit() calls in tests
    with db_engine.connect() as cleanup_conn:
        cleanup_conn.execute(text("TRUNCATE TABLE emergency_facilities RESTART IDENTITY CASCADE;"))
        cleanup_conn.commit()
        
    connection.close()

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
