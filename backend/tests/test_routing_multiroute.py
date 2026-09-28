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

    with patch("httpx.AsyncClient.get", return_value=mock_response) as mock_get:
        with patch("app.services.safety_service.compute_route_safety_context", side_effect=mock_safety):
            with patch("app.services.weather_service.evaluate_weather_context", return_value=MagicMock(is_adverse=False)):
                response = client.post("/api/v1/routing/directions", json={
                    "origin_lat": 8.18,
                    "origin_lon": 77.41,
                    "dest_lat": 8.19,
                    "dest_lon": 77.42,
                    "profile": "driving",
                    "include_safety_context": True,
                    "preference": "BALANCED"
                })
                
                assert response.status_code == 200
                data = response.json()
                assert len(data["routes"]) == 3
                
                # Check recommended route
                assert data["recommended_route_id"] == "route_3"
                assert "score" in data["recommendation_reason"].lower()
                assert "route_2" in [r["route_id"] for r in data["routes"]]

                # Verify OSRM API call params
                mock_get.assert_called_once()
                args, kwargs = mock_get.call_args
                assert "car" in args[0]
                assert kwargs["params"]["steps"] == "true"
                assert kwargs["params"]["alternatives"] == "true"
                assert kwargs["params"]["overview"] == "full"
                assert kwargs["params"]["geometries"] == "geojson"

def test_routing_multiroute_failure():
    with patch("httpx.AsyncClient.get", side_effect=httpx.RequestError("Network Error", request=MagicMock())):
        response = client.post("/api/v1/routing/directions", json={
            "origin_lat": 8.1833,
            "origin_lon": 77.4119,
            "dest_lat": 8.1834,
            "dest_lon": 77.4120,
            "profile": "walking"
        })
        assert response.status_code == 503
