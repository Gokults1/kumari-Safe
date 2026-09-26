import pytest
from app.schemas import CandidateRoute, RouteSafetySummary, RoutePreference
from app.services.scoring_service import score_routes

def create_mock_route(route_id, duration, cctv=0, police=0, hospital=0, hazard=0):
    safety_context = RouteSafetySummary(
        corridor_radius_meters=500.0,
        police_stations_count=police,
        hospitals_count=hospital,
        fire_stations_count=0,
        cctv_count=cctv,
        road_hazards_count=hazard,
        facilities_within_corridor=[],
        hazards=[],
        context_description="Test"
    )
    return CandidateRoute(
        route_id=route_id,
        label=route_id,
        distance_meters=1000,
        distance_km=1.0,
        duration_seconds=duration,
        duration_minutes=duration/60,
        coordinates=[],
        steps=[],
        safety_context=safety_context
    )

def test_fastest_preference():
    fast_unsafe = create_mock_route("r1", 300, hazard=2) # 5 min, 2 hazards
    slow_safe = create_mock_route("r2", 600, cctv=10, police=2, hospital=1) # 10 min, lots of safety
    
    routes = [fast_unsafe, slow_safe]
    
    scored = score_routes(routes, RoutePreference.FASTEST)
    scored.sort(key=lambda r: r.score, reverse=True)
    
    assert scored[0].route_id == "r1", "Fastest route should win under FASTEST preference"

def test_safest_preference():
    fast_unsafe = create_mock_route("r1", 300, hazard=2)
    slow_safe = create_mock_route("r2", 600, cctv=10, police=2, hospital=1)
    
    routes = [fast_unsafe, slow_safe]
    
    scored = score_routes(routes, RoutePreference.SAFEST)
    scored.sort(key=lambda r: r.score, reverse=True)
    
    assert scored[0].route_id == "r2", "Safest route should win under SAFEST preference"
