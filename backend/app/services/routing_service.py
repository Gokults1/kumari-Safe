import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.config import settings
from app.schemas import RouteResponse, MultiRouteResponse, CandidateRoute, NavigationStep
from app.services import safety_service

def parse_steps(osrm_steps) -> list[NavigationStep]:
    steps = []
    for step in osrm_steps:
        maneuver = step.get("maneuver", {})
        instruction = maneuver.get("instruction", "")
        if not instruction:
            # Fallback text if OSRM doesn't provide text instructions by default
            instruction = f"{maneuver.get('type', 'Go')} {maneuver.get('modifier', '')}"
            
        steps.append(NavigationStep(
            instruction=instruction,
            maneuver_type=maneuver.get("type", "unknown"),
            modifier=maneuver.get("modifier"),
            street_name=step.get("name"),
            distance_meters=step.get("distance", 0.0),
            duration_seconds=step.get("duration", 0.0),
            location=maneuver.get("location", [0.0, 0.0])
        ))
    return steps

def get_multi_routes(
    db: Session,
    origin_lat: float, 
    origin_lon: float, 
    dest_lat: float, 
    dest_lon: float, 
    profile: str = "walking",
    include_safety_context: bool = True,
    corridor_radius_meters: float = 500.0
) -> MultiRouteResponse:
    # Map the requested profile to OSRM's internal profile names
    osrm_profile = "foot"
    if profile == "driving":
        osrm_profile = "car"

    # OSRM expects coordinates as lon,lat;lon,lat
    coordinates = f"{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
    
    url = f"{settings.OSRM_BASE_URL}/route/v1/{osrm_profile}/{coordinates}"
    
    # We want full geometry (geojson), alternatives, and steps
    params = {
        "overview": "full",
        "geometries": "geojson",
        "alternatives": "true",
        "steps": "true"
    }

    try:
        response = httpx.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") != "Ok" or not data.get("routes"):
            raise HTTPException(status_code=400, detail="Unable to calculate route.")
            
        candidate_routes = []
        for i, route_data in enumerate(data["routes"]):
            route_id = f"route_{i+1}"
            label = f"Route {i+1}"
            distance_meters = route_data.get("distance", 0.0)
            duration_seconds = route_data.get("duration", 0.0)
            geometry = route_data.get("geometry", {})
            coords = geometry.get("coordinates", [])
            
            # Parse steps
            steps = []
            legs = route_data.get("legs", [])
            if legs and "steps" in legs[0]:
                steps = parse_steps(legs[0]["steps"])
                
            # Compute safety context if requested
            safety_context = None
            if include_safety_context and coords:
                safety_context = safety_service.compute_route_safety_context(
                    db=db,
                    route_coordinates=coords,
                    corridor_radius_meters=corridor_radius_meters
                )
                
            candidate_routes.append(CandidateRoute(
                route_id=route_id,
                label=label,
                distance_meters=round(distance_meters, 2),
                distance_km=round(distance_meters / 1000.0, 2),
                duration_seconds=round(duration_seconds, 2),
                duration_minutes=round(duration_seconds / 60.0, 2),
                coordinates=coords,
                steps=steps,
                safety_context=safety_context
            ))
            
        # Recommendation Logic
        recommended_route_id = None
        recommendation_reason = None
        
        if candidate_routes:
            # Simple scoring: weigh duration vs safety.
            # Here we just label based on fastest and safest without negative wording.
            fastest = min(candidate_routes, key=lambda r: r.duration_seconds)
            
            if include_safety_context:
                safest = max(
                    candidate_routes, 
                    key=lambda r: (r.safety_context.police_stations_count + r.safety_context.hospitals_count + r.safety_context.fire_stations_count) if r.safety_context else 0
                )
                
                fastest.label = "Fastest Route"
                if safest.route_id != fastest.route_id:
                    safest.label = "Safer Corridor Route"
                    
                    safest_facilities = safest.safety_context.police_stations_count + safest.safety_context.hospitals_count + safest.safety_context.fire_stations_count
                    fastest_facilities = fastest.safety_context.police_stations_count + fastest.safety_context.hospitals_count + fastest.safety_context.fire_stations_count
                    
                    time_diff = round((safest.duration_seconds - fastest.duration_seconds) / 60.0, 1)
                    
                    if safest_facilities > fastest_facilities:
                        recommended_route_id = safest.route_id
                        recommendation_reason = f"{fastest.label} is {time_diff} mins faster, but {safest.label} passes more emergency facilities ({safest.safety_context.police_stations_count} police, {safest.safety_context.hospitals_count} hospitals, {safest.safety_context.fire_stations_count} fire stations) providing a well-monitored corridor."
                    else:
                        recommended_route_id = fastest.route_id
                        recommendation_reason = f"{fastest.label} is the most efficient choice and passes {fastest_facilities} emergency facilities."
                else:
                    recommended_route_id = fastest.route_id
                    facilities = fastest.safety_context.police_stations_count + fastest.safety_context.hospitals_count + fastest.safety_context.fire_stations_count
                    recommendation_reason = f"This route is the fastest and passes {facilities} emergency facilities."
            else:
                fastest.label = "Fastest Route"
                recommended_route_id = fastest.route_id
                recommendation_reason = "This is the fastest available route."

        return MultiRouteResponse(
            origin=[origin_lon, origin_lat],
            destination=[dest_lon, dest_lat],
            routes=candidate_routes,
            recommended_route_id=recommended_route_id,
            recommendation_reason=recommendation_reason
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Routing service unavailable: {str(exc)}")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail="Error from routing service")
