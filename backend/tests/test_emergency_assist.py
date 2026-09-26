import pytest
from datetime import datetime, timezone

def test_get_emergency_assistance_context(client, db):
    # 1. Create a base location (Nagercoil Collectorate)
    base_lat = 8.1833
    base_lon = 77.4119

    # 2. Add POLICE, HOSPITAL, and FIRE_STATION facilities
    # One close police station
    client.post("/api/v1/emergency/facilities", json={
        "name": "Nagercoil Police Station",
        "facility_type": "POLICE",
        "latitude": 8.1833,
        "longitude": 77.4119,
        "phone": "100",
        "source": "Test",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    })
    
    # One far police station
    client.post("/api/v1/emergency/facilities", json={
        "name": "Kanyakumari Police Station",
        "facility_type": "POLICE",
        "latitude": 8.0883,
        "longitude": 77.5385,
        "phone": "100",
        "source": "Test",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    })

    # One close hospital
    client.post("/api/v1/emergency/facilities", json={
        "name": "Nagercoil Govt Hospital",
        "facility_type": "HOSPITAL",
        "latitude": 8.1840,
        "longitude": 77.4120,
        "phone": "104",
        "source": "Test",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    })

    # Note: Intentionally omitting FIRE_STATION to verify null handling for missing types

    # 3. Call the /assist endpoint
    response = client.get(f"/api/v1/emergency/assist?lat={base_lat}&lon={base_lon}")
    assert response.status_code == 200
    data = response.json()

    # 4. Assert district helplines exist
    assert "district_helplines" in data
    assert len(data["district_helplines"]) > 0
    names = [h["name"] for h in data["district_helplines"]]
    assert "District Disaster Control Room" in names
    assert "Women Helpline" in names

    # 5. Assert closest_facilities logic
    assert "closest_facilities" in data
    closest = data["closest_facilities"]
    
    # POLICE should be Nagercoil Police Station (closer one)
    assert closest["POLICE"] is not None
    assert closest["POLICE"]["facility"]["name"] == "Nagercoil Police Station"
    # distance should be 0 or very close to 0
    assert closest["POLICE"]["distance_km"] == 0.0

    # HOSPITAL should be Nagercoil Govt Hospital
    assert closest["HOSPITAL"] is not None
    assert closest["HOSPITAL"]["facility"]["name"] == "Nagercoil Govt Hospital"
    assert closest["HOSPITAL"]["distance_km"] > 0.0

    # FIRE_STATION should be None since we didn't insert any
    assert closest["FIRE_STATION"] is None
