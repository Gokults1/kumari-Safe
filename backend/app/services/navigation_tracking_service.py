import math
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas import RouteTrackingRequest, RouteTrackingResponse

def _haversine_dist_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def _distance_point_to_segment(p_lat: float, p_lon: float, a_lat: float, a_lon: float, b_lat: float, b_lon: float) -> float:
    d_ab = _haversine_dist_meters(a_lat, a_lon, b_lat, b_lon)
    if d_ab < 1e-6:
        return _haversine_dist_meters(p_lat, p_lon, a_lat, a_lon)
    
    vx = b_lon - a_lon
    vy = b_lat - a_lat
    wx = p_lon - a_lon
    wy = p_lat - a_lat
    
    c1 = wx * vx + wy * vy
    if c1 <= 0:
        return _haversine_dist_meters(p_lat, p_lon, a_lat, a_lon)
    
    c2 = vx * vx + vy * vy
    if c2 <= c1:
        return _haversine_dist_meters(p_lat, p_lon, b_lat, b_lon)
    
    b = c1 / c2
    proj_lat = a_lat + b * vy
    proj_lon = a_lon + b * vx
    return _haversine_dist_meters(p_lat, p_lon, proj_lat, proj_lon)

def _min_dist_to_route_python(current_lat: float, current_lon: float, route_coords: list) -> float:
    if len(route_coords) == 1:
        return _haversine_dist_meters(current_lat, current_lon, route_coords[0][1], route_coords[0][0])
    min_dist = float('inf')
    for i in range(len(route_coords) - 1):
        a = route_coords[i]
        b = route_coords[i+1]
        d = _distance_point_to_segment(current_lat, current_lon, a[1], a[0], b[1], b[0])
        if d < min_dist:
            min_dist = d
    return min_dist

def evaluate_navigation_progress(
    db: Optional[Session], 
    request: RouteTrackingRequest, 
    off_route_threshold_meters: float = 35.0
) -> RouteTrackingResponse:
    if not request.active_route_coordinates:
        raise ValueError("active_route_coordinates cannot be empty")
    
    current_lon, current_lat = request.current_location

    distance_to_route = None
    if db is not None:
        try:
            route_points = ", ".join(f"{lon} {lat}" for lon, lat in request.active_route_coordinates)
            route_linestring = f"SRID=4326;LINESTRING({route_points})"
            current_point = f"SRID=4326;POINT({current_lon} {current_lat})"
            
            distance_query = text("""
                SELECT ST_Distance(
                    ST_GeomFromEWKT(:point)::geography, 
                    ST_GeomFromEWKT(:line)::geography
                )
            """)
            distance_to_route = db.execute(distance_query, {"point": current_point, "line": route_linestring}).scalar()
        except Exception:
            distance_to_route = None

    if distance_to_route is None:
        distance_to_route = _min_dist_to_route_python(current_lat, current_lon, request.active_route_coordinates)
    
    is_off_route = distance_to_route > off_route_threshold_meters
    reroute_needed = is_off_route
    
    has_arrived = False
    current_step_index = request.current_step_index
    distance_to_next_maneuver = 0.0
    current_instruction = ""
    
    if not is_off_route:
        last_lon, last_lat = request.active_route_coordinates[-1]
        distance_to_dest = _haversine_dist_meters(current_lat, current_lon, last_lat, last_lon)
        
        if distance_to_dest < 20.0:
            has_arrived = True
            
        if request.steps and current_step_index < len(request.steps):
            current_step = request.steps[current_step_index]
            step_lon, step_lat = current_step.location
            distance_to_maneuver = _haversine_dist_meters(current_lat, current_lon, step_lat, step_lon)
            
            # If within 15 meters of current maneuver, advance to next step
            if distance_to_maneuver < 15.0 and current_step_index < len(request.steps) - 1:
                current_step_index += 1
                current_step = request.steps[current_step_index]
                step_lon, step_lat = current_step.location
                distance_to_maneuver = _haversine_dist_meters(current_lat, current_lon, step_lat, step_lon)

            current_instruction = current_step.instruction
            distance_to_next_maneuver = distance_to_maneuver
        elif request.steps and current_step_index >= len(request.steps):
            # Already at the last step
            current_step_index = len(request.steps) - 1
            current_step = request.steps[current_step_index]
            current_instruction = current_step.instruction
            distance_to_next_maneuver = distance_to_dest

    return RouteTrackingResponse(
        is_off_route=is_off_route,
        distance_to_route_meters=distance_to_route,
        current_step_index=current_step_index,
        current_instruction=current_instruction,
        distance_to_next_maneuver_meters=distance_to_next_maneuver,
        has_arrived=has_arrived,
        reroute_needed=reroute_needed
    )
