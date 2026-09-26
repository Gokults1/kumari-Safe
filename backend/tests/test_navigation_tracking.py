from fastapi.testclient import TestClient
from app.main import app

def test_track_progress_on_route(client):
    route_coords = [[77.5300, 8.0800], [77.5400, 8.0900], [77.5500, 8.1000]]
    steps = [
        {
            "instruction": "Head north",
            "maneuver_type": "depart",
            "distance_meters": 1000.0,
            "duration_seconds": 120.0,
            "location": [77.5300, 8.0800]
        },
        {
            "instruction": "Turn right",
            "maneuver_type": "turn",
            "modifier": "right",
            "distance_meters": 1000.0,
            "duration_seconds": 120.0,
            "location": [77.5400, 8.0900]
        },
        {
            "instruction": "Arrive at destination",
            "maneuver_type": "arrive",
            "distance_meters": 0.0,
            "duration_seconds": 0.0,
            "location": [77.5500, 8.1000]
        }
    ]
    
    # Placed close to route line and before second step
    request = {
        "current_location": [77.5350, 8.0850], 
        "active_route_coordinates": route_coords,
        "steps": steps,
        "current_step_index": 1
    }
    
    response = client.post("/api/v1/routing/track-progress", json=request)
    assert response.status_code == 200
    data = response.json()
    assert data["is_off_route"] is False
    assert data["reroute_needed"] is False
    assert data["current_step_index"] == 1
    assert data["current_instruction"] == "Turn right"
    assert data["distance_to_next_maneuver_meters"] > 0
    assert data["has_arrived"] is False

def test_track_progress_advance_step(client):
    route_coords = [[77.5300, 8.0800], [77.5400, 8.0900], [77.5500, 8.1000]]
    steps = [
        {
            "instruction": "Turn right",
            "maneuver_type": "turn",
            "distance_meters": 1000.0,
            "duration_seconds": 120.0,
            "location": [77.5400, 8.0900]
        },
        {
            "instruction": "Arrive at destination",
            "maneuver_type": "arrive",
            "distance_meters": 0.0,
            "duration_seconds": 0.0,
            "location": [77.5500, 8.1000]
        }
    ]
    
    # Placed within 15 meters of the first step [77.5400, 8.0900]
    # At equator 1 degree ~ 111km, 0.0001 ~ 11m
    request = {
        "current_location": [77.53995, 8.08995], 
        "active_route_coordinates": route_coords,
        "steps": steps,
        "current_step_index": 0
    }
    
    response = client.post("/api/v1/routing/track-progress", json=request)
    assert response.status_code == 200
    data = response.json()
    assert data["is_off_route"] is False
    assert data["current_step_index"] == 1
    assert data["current_instruction"] == "Arrive at destination"

def test_track_progress_off_route(client):
    route_coords = [[77.53, 8.08], [77.54, 8.09]]
    steps = []
    
    # User is far away from the route
    request = {
        "current_location": [77.55, 8.08], # About ~2km away
        "active_route_coordinates": route_coords,
        "steps": steps,
        "current_step_index": 0
    }
    
    response = client.post("/api/v1/routing/track-progress", json=request)
    assert response.status_code == 200
    data = response.json()
    assert data["is_off_route"] is True
    assert data["reroute_needed"] is True
    assert data["distance_to_route_meters"] > 35.0

def test_track_progress_arrival(client):
    route_coords = [[77.53, 8.08], [77.54, 8.09]]
    steps = []
    
    # User is at destination
    request = {
        "current_location": [77.54, 8.09],
        "active_route_coordinates": route_coords,
        "steps": steps,
        "current_step_index": 0
    }
    
    response = client.post("/api/v1/routing/track-progress", json=request)
    assert response.status_code == 200
    data = response.json()
    assert data["has_arrived"] is True
