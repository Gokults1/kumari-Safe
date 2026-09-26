import pytest
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock

def test_safety_context_integration(client, db):
    # 1. Insert a Police Station at (lon: 77.4119, lat: 8.1833)
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

    # 2. Insert a Hospital very far away (lon: 77.5385, lat: 8.0883)
    client.post("/api/v1/emergency/facilities", json={
        "name": "Far Hospital",
        "facility_type": "HOSPITAL",
        "latitude": 8.0883,
        "longitude": 77.5385,
        "phone": "100",
        "source": "Test",
        "last_verified": datetime.now(timezone.utc).isoformat(),
        "data_type": "OFFICIAL"
    })

    # 3. Mock the routing service to return a route that passes EXACTLY near the Police station
    # but far away from the hospital.
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "code": "Ok",
        "routes": [
            {
                "distance": 1250.5,
                "duration": 300.0,
                "geometry": {
                    # Coordinates in [lon, lat] format passing right through [77.4119, 8.1833]
                    "coordinates": [
                        [77.4110, 8.1830],
                        [77.4119, 8.1833],
                        [77.4125, 8.1840]
                    ],
                    "type": "LineString"
                }
            }
        ]
    }
    mock_response.raise_for_status.return_value = None

    with patch("app.services.routing_service.httpx.get", return_value=mock_response):
        response = client.post("/api/v1/routing/directions", json={
            "origin_lat": 8.1830,
            "origin_lon": 77.4110,
            "dest_lat": 8.1840,
            "dest_lon": 77.4125,
            "profile": "walking",
            "include_safety_context": True,
            "corridor_radius_meters": 500.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify route output
        route = data["routes"][0]
        assert route["distance_meters"] == 1250.5
        
        # Verify safety context
        assert "safety_context" in route
        safety = route["safety_context"]
        
        assert safety["police_stations_count"] == 1
        assert safety["hospitals_count"] == 0
        assert safety["fire_stations_count"] == 0
        
        facilities = safety["facilities_within_corridor"]
        assert len(facilities) == 1
        assert facilities[0]["facility"]["name"] == "Nagercoil Police Station"
        
        desc = safety["context_description"]
        assert "Mapped infrastructure within 500m" in desc
        assert "1 police station(s)" in desc
        # The prompt mandates it must NOT claim "dangerous"
        assert "dangerous" not in desc.lower()
