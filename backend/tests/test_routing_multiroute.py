import pytest
import httpx
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_routing_multiroute_success():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "code": "Ok",
        "routes": [
            {
                "distance": 1200.0,
                "duration": 300.0,
                "geometry": {
                    "coordinates": [[77.41, 8.18], [77.42, 8.19]],
                    "type": "LineString"
                },
                "legs": [
                    {
                        "steps": [
                            {
                                "distance": 600,
                                "duration": 150,
                                "name": "Cape Road",
                                "maneuver": {
                                    "instruction": "Turn left onto Cape Road",
                                    "type": "turn",
                                    "modifier": "left",
                                    "location": [77.41, 8.18]
                                }
                            },
                            {
                                "distance": 600,
                                "duration": 150,
                                "name": "Main Street",
                                "maneuver": {
                                    "type": "straight",
                                    "modifier": "straight",
                                    "location": [77.415, 8.185]
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "distance": 1300.0,
                "duration": 360.0,
                "geometry": {
                    "coordinates": [[77.41, 8.18], [77.415, 8.182], [77.42, 8.19]],
                    "type": "LineString"
                },
                "legs": [
                    {
                        "steps": [
                            {
                                "distance": 1300,
                                "duration": 360,
                                "name": "Alternate Road",
                                "maneuver": {
                                    "type": "turn",
                                    "modifier": "right",
                                    "location": [77.41, 8.18]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
    mock_response.raise_for_status.return_value = None

    # We also mock compute_route_safety_context to give distinct safety profiles
    def mock_safety(db, route_coordinates, corridor_radius_meters):
        from app.schemas import RouteSafetySummary
        if len(route_coordinates) == 2:
            return RouteSafetySummary(
                corridor_radius_meters=corridor_radius_meters,
                police_stations_count=1,
                hospitals_count=0,
                fire_stations_count=0,
                facilities_within_corridor=[],
                context_description="Basic"
            )
        else:
            return RouteSafetySummary(
                corridor_radius_meters=corridor_radius_meters,
                police_stations_count=2,
                hospitals_count=1,
                fire_stations_count=1,
                facilities_within_corridor=[],
                context_description="Safer"
            )

    with patch("app.services.routing_service.httpx.get", return_value=mock_response) as mock_get:
        with patch("app.services.safety_service.compute_route_safety_context", side_effect=mock_safety):
            response = client.post("/api/v1/routing/directions", json={
                "origin_lat": 8.18,
                "origin_lon": 77.41,
                "dest_lat": 8.19,
                "dest_lon": 77.42,
                "profile": "driving",
                "include_safety_context": True
            })
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["routes"]) == 2
            
            # Fastest route (index 0)
            route1 = data["routes"][0]
            assert route1["route_id"] == "route_1"
            assert route1["label"] == "Fastest Route"
            assert len(route1["steps"]) == 2
            assert route1["steps"][0]["instruction"] == "Turn left onto Cape Road"
            assert route1["steps"][1]["instruction"] == "straight straight"  # Fallback text since instruction wasn't provided

            # Safer route (index 1)
            route2 = data["routes"][1]
            assert route2["route_id"] == "route_2"
            assert route2["label"] == "Safer Corridor Route"
            assert len(route2["steps"]) == 1

            # Recommendation Logic Check
            assert data["recommended_route_id"] == "route_2"
            assert "dangerous" not in data["recommendation_reason"].lower()
            assert "mins faster" in data["recommendation_reason"]
            assert "well-monitored corridor" in data["recommendation_reason"]
            assert "2 police" in data["recommendation_reason"]

            # Verify OSRM API call params
            mock_get.assert_called_once()
            args, kwargs = mock_get.call_args
            assert "car" in args[0]
            assert kwargs["params"]["steps"] == "true"
            assert kwargs["params"]["alternatives"] == "true"
            assert kwargs["params"]["overview"] == "full"
            assert kwargs["params"]["geometries"] == "geojson"

def test_routing_multiroute_failure():
    with patch("app.services.routing_service.httpx.get", side_effect=httpx.RequestError("Network Error", request=MagicMock())):
        response = client.post("/api/v1/routing/directions", json={
            "origin_lat": 8.1833,
            "origin_lon": 77.4119,
            "dest_lat": 8.1834,
            "dest_lon": 77.4120,
            "profile": "walking"
        })
        assert response.status_code == 503
