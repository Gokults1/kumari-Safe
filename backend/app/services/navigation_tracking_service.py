from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas import RouteTrackingRequest, RouteTrackingResponse

def evaluate_navigation_progress(
    db: Session, 
    request: RouteTrackingRequest, 
    off_route_threshold_meters: float = 35.0
) -> RouteTrackingResponse:
    if not request.active_route_coordinates:
        raise ValueError("active_route_coordinates cannot be empty")
    
    current_lon, current_lat = request.current_location

    # Construct LineString text for PostGIS
    # Note: coordinates in route are [lon, lat]
    route_points = ", ".join(f"{lon} {lat}" for lon, lat in request.active_route_coordinates)
    route_linestring = f"SRID=4326;LINESTRING({route_points})"
    
    current_point = f"SRID=4326;POINT({current_lon} {current_lat})"
    
    # Calculate distance to route polyline
    distance_query = text("""
        SELECT ST_Distance(
            ST_GeomFromEWKT(:point)::geography, 
            ST_GeomFromEWKT(:line)::geography
        )
    """)
    distance_to_route = db.execute(distance_query, {"point": current_point, "line": route_linestring}).scalar()
    
    is_off_route = distance_to_route > off_route_threshold_meters
    reroute_needed = is_off_route
    
    has_arrived = False
    current_step_index = request.current_step_index
    distance_to_next_maneuver = 0.0
    current_instruction = ""
    
    if not is_off_route:
        # Check if arrived (distance to last point of polyline < 20m)
        last_lon, last_lat = request.active_route_coordinates[-1]
        last_point = f"SRID=4326;POINT({last_lon} {last_lat})"
        dist_to_dest_query = text("""
            SELECT ST_Distance(
                ST_GeomFromEWKT(:point)::geography, 
                ST_GeomFromEWKT(:dest)::geography
            )
        """)
        distance_to_dest = db.execute(dist_to_dest_query, {"point": current_point, "dest": last_point}).scalar()
        
        if distance_to_dest < 20.0:
            has_arrived = True
            
        if request.steps and current_step_index < len(request.steps):
            current_step = request.steps[current_step_index]
            step_lon, step_lat = current_step.location
            step_point = f"SRID=4326;POINT({step_lon} {step_lat})"
            
            dist_to_step_query = text("""
                SELECT ST_Distance(
                    ST_GeomFromEWKT(:point)::geography, 
                    ST_GeomFromEWKT(:step_loc)::geography
                )
            """)
            distance_to_maneuver = db.execute(dist_to_step_query, {"point": current_point, "step_loc": step_point}).scalar()
            
            # If within 15 meters of current maneuver, advance to next step
            if distance_to_maneuver < 15.0 and current_step_index < len(request.steps) - 1:
                current_step_index += 1
                current_step = request.steps[current_step_index]
                
                # Recalculate distance to the *new* current step
                step_lon, step_lat = current_step.location
                step_point = f"SRID=4326;POINT({step_lon} {step_lat})"
                distance_to_maneuver = db.execute(dist_to_step_query, {"point": current_point, "step_loc": step_point}).scalar()

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
