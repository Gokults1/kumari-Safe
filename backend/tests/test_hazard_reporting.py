import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker
from app.models import RoadHazard

# Setup test DB
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    db.query(RoadHazard).delete()
    db.commit()
    db.close()
    yield

def test_user_report_submission_and_verify():
    # 1. Submit report
    report_data = {
        "latitude": 8.08,
        "longitude": 77.55,
        "hazard_type": "POTHOLE",
        "description": "Deep pothole on the main road"
    }
    response = client.post("/api/v1/hazards/report", json=report_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "REPORTED"
    assert data["source"] == "Community User"
    assert data["data_type"] == "USER_REPORTED"
    hazard_id = data["id"]
    
    # 2. Check that it does not show up in routing safety query (mock route)
    route_req = {
        "origin_lat": 8.07,
        "origin_lon": 77.55,
        "dest_lat": 8.09,
        "dest_lon": 77.55,
        "profile": "driving",
        "corridor_radius_meters": 1500,
        "include_safety_context": True
    }
    # Mocking osrm route response might be needed if the external osrm server is not available or if the testing environment requires mocking.
    # However, since the user has a real test environment with `osrm` running, we can use the actual endpoint.
    route_resp = client.post("/api/v1/routing/directions", json=route_req)
    assert route_resp.status_code == 200, route_resp.text
    route_data = route_resp.json()
    assert len(route_data["routes"]) > 0
    route1 = next(r for r in route_data["routes"] if r["route_id"] == "route_1")
    safety = route1.get("safety_context")
    assert safety is not None
    assert safety["road_hazards_count"] == 0
    assert len(safety["hazards"]) == 0
    
    # 3. Verify hazard
    verify_resp = client.post(f"/api/v1/hazards/{hazard_id}/verify")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] == "VERIFIED"
    
    # 4. Check routing safety query again
    route_resp2 = client.post("/api/v1/routing/directions", json=route_req)
    assert route_resp2.status_code == 200
    route_data2 = route_resp2.json()
    route2 = next(r for r in route_data2["routes"] if r["route_id"] == "route_1")
    safety2 = route2.get("safety_context")
    assert safety2["road_hazards_count"] >= 1
    found = any(h["id"] == hazard_id for h in safety2["hazards"])
    assert found is True
