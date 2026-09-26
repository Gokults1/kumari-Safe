import pytest
from datetime import datetime, timezone
from app.models import FacilityType, DataSourceType

def test_create_facility(client, db):
    payload = {
        "name": "Test Police Station",
        "facility_type": "POLICE",
        "latitude": 8.1833,
        "longitude": 77.4119,
        "phone": "100",
        "address": "Nagercoil",
        "source": "Official Website",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    }
    
    response = client.post("/api/v1/emergency/facilities", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Police Station"
    assert data["latitude"] == 8.1833
    assert data["longitude"] == 77.4119
    assert "id" in data

def test_get_facilities_and_filter(client, db):
    # Create first facility
    payload1 = {
        "name": "Test Police Station",
        "facility_type": "POLICE",
        "latitude": 8.1833,
        "longitude": 77.4119,
        "phone": "100",
        "address": "Nagercoil",
        "source": "Official Website",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    }
    client.post("/api/v1/emergency/facilities", json=payload1)

    # Create another facility of different type
    payload2 = {
        "name": "Test Hospital",
        "facility_type": "HOSPITAL",
        "latitude": 8.1844,
        "longitude": 77.4120,
        "phone": "108",
        "source": "Test",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    }
    client.post("/api/v1/emergency/facilities", json=payload2)
    
    # Get all
    response = client.get("/api/v1/emergency/facilities")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    
    # Filter by HOSPITAL
    response = client.get("/api/v1/emergency/facilities?facility_type=HOSPITAL")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(f["facility_type"] == "HOSPITAL" for f in data)

def test_get_facilities_nearby(client, db):
    # Base location (Nagercoil Collectorate area)
    base_lat = 8.1833
    base_lon = 77.4119
    
    payload_base = {
        "name": "Test Police Station",
        "facility_type": "POLICE",
        "latitude": base_lat,
        "longitude": base_lon,
        "phone": "100",
        "source": "Test",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    }
    client.post("/api/v1/emergency/facilities", json=payload_base)

    # Create a far facility (e.g., Kanyakumari town, ~20km away)
    far_lat = 8.0883
    far_lon = 77.5385
    
    payload_far = {
        "name": "Far Police Station",
        "facility_type": "POLICE",
        "latitude": far_lat,
        "longitude": far_lon,
        "phone": "100",
        "source": "Test",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    }
    client.post("/api/v1/emergency/facilities", json=payload_far)
    
    # Test nearby with 5km radius around base
    response = client.get(f"/api/v1/emergency/facilities/nearby?lat={base_lat}&lon={base_lon}&radius_meters=5000")
    assert response.status_code == 200
    data = response.json()
    
    # Ensure Test Police Station (at exact base) is present, but Far Police Station is excluded
    names = [f["name"] for f in data]
    assert "Test Police Station" in names
    assert "Far Police Station" not in names
    
    # Ensure they are sorted by distance ascending
    distances = [f["distance_meters"] for f in data]
    assert distances == sorted(distances)
    
    # Test nearby with 30km radius (should include Far Police Station)
    response_far = client.get(f"/api/v1/emergency/facilities/nearby?lat={base_lat}&lon={base_lon}&radius_meters=30000")
    assert response_far.status_code == 200
    data_far = response_far.json()
    names_far = [f["name"] for f in data_far]
    assert "Test Police Station" in names_far
    assert "Far Police Station" in names_far
    
    # Still sorted?
    distances_far = [f["distance_meters"] for f in data_far]
    assert distances_far == sorted(distances_far)
