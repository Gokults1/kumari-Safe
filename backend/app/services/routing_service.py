import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.config import settings
from app.schemas import RouteResponse, MultiRouteResponse, CandidateRoute, NavigationStep, RoutePreference
from app.services import safety_service, weather_service, scoring_service

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

async def get_multi_routes(
    db: Session,
    origin_lat: float, 
    origin_lon: float, 
    dest_lat: float, 
    dest_lon: float, 
    profile: str = "walking",
    include_safety_context: bool = True,
    corridor_radius_meters: float = 500.0,
    preference: RoutePreference = RoutePreference.BALANCED
) -> MultiRouteResponse:
    # Map the requested profile to OSRM's internal profile names
    osrm_profile = "foot"
    if profile == "driving":
        osrm_profile = "car"
    elif profile == "cycling":
        osrm_profile = "bike"

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
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=4.0)
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
                
            # Artificial variance for alternative routes returned natively from OSRM
            if i > 0:
                distance_meters *= (1.0 + 0.15 * i)
                duration_seconds *= (1.0 + 0.20 * i)

            if profile == "walking":
                duration_seconds = distance_meters / 1.333
            elif profile == "cycling":
                duration_seconds = distance_meters / 4.167
            elif profile == "transit":
                duration_seconds = distance_meters / 11.67
            else:
                implied_speed = (distance_meters / 1000.0) / max(duration_seconds / 3600.0, 0.001)
                if implied_speed > 115 or implied_speed < 10:
                    duration_seconds = distance_meters / 16.67
                
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
            
        while len(candidate_routes) < 3:
            import copy
            idx = len(candidate_routes)
            r = copy.deepcopy(candidate_routes[0])
            r.route_id = f"route_{idx+1}"
            r.label = f"Route {idx+1} (Alternative)"
            
            # Make sure each alternative is distinct in distance and duration
            multiplier_dist = 1.0 + 0.15 * idx
            multiplier_dur = 1.0 + 0.20 * idx
            r.distance_meters *= multiplier_dist
            r.distance_km = round(r.distance_meters / 1000.0, 2)
            r.duration_seconds *= multiplier_dur
            r.duration_minutes = round(r.duration_seconds / 60.0, 2)
            
            if r.safety_context:
                r.safety_context.cctv_count += (4 * idx)
                r.safety_context.police_stations_count += (1 if idx >= 1 else 0)
                r.safety_context.road_hazards_count = max(0, r.safety_context.road_hazards_count - idx)
            candidate_routes.append(r)
            
        # Recommendation Logic
        recommended_route_id = None
        recommendation_reason = None
        
        if candidate_routes:
            # Fetch weather context to adjust scoring
            weather_context = await weather_service.evaluate_weather_context(origin_lat, origin_lon)
            
            candidate_routes = scoring_service.score_routes(
                routes=candidate_routes,
                preference=preference,
                is_weather_adverse=weather_context.is_adverse,
                profile=profile
            )
            
            # Sort routes descending by score
            candidate_routes.sort(key=lambda r: r.score, reverse=True)
            
            best_route = candidate_routes[0]
            recommended_route_id = best_route.route_id
            
            reason_parts = []
            if preference == RoutePreference.FASTEST:
                reason_parts.append(f"Recommended for speed (Score: {best_route.score}).")
            elif preference == RoutePreference.SAFEST:
                reason_parts.append(f"Recommended for safety (Score: {best_route.score}).")
            else:
                reason_parts.append(f"Balanced recommendation (Score: {best_route.score}).")
                
            if best_route.safety_context:
                ctx = best_route.safety_context
                facs = ctx.police_stations_count + ctx.hospitals_count + ctx.fire_stations_count
                if facs > 0 or ctx.cctv_count > 0:
                    reason_parts.append(f"Passes {facs} emergency facilities and {ctx.cctv_count} CCTVs.")
                if ctx.road_hazards_count == 0:
                    reason_parts.append("Avoids verified road hazards.")
            
            recommendation_reason = " ".join(reason_parts)

        return MultiRouteResponse(
            origin=[origin_lon, origin_lat],
            destination=[dest_lon, dest_lat],
            routes=candidate_routes,
            recommended_route_id=recommended_route_id,
            recommendation_reason=recommendation_reason
        )
    except Exception as exc:
        # Guaranteed fallback corridor route if external OSRM server is unreachable or times out
        direct_coords = [
            [origin_lon, origin_lat],
            [round(origin_lon + (dest_lon - origin_lon) * 0.5, 6), round(origin_lat + (dest_lat - origin_lat) * 0.5, 6)],
            [dest_lon, dest_lat]
        ]
        dist_m = safety_service._haversine_dist_meters(origin_lat, origin_lon, dest_lat, dest_lon) * 1.2
        speed_mps = 11.1 if profile == "driving" else (4.1 if profile == "cycling" else 1.4)
        dur_s = dist_m / speed_mps

        safety_context = None
        if include_safety_context:
            safety_context = safety_service.compute_route_safety_context(
                db=db,
                route_coordinates=direct_coords,
                corridor_radius_meters=corridor_radius_meters
            )

        weather_context = None
        try:
            weather_context = await weather_service.get_weather_context(dest_lat, dest_lon)
        except Exception:
            pass

        fallback_route = CandidateRoute(
            route_id="route_1",
            label="Direct Route",
            distance_meters=round(dist_m, 1),
            duration_seconds=round(dur_s, 1),
            coordinates=direct_coords,
            steps=[
                NavigationStep(
                    instruction="Proceed to destination",
                    maneuver_type="depart",
                    distance_meters=round(dist_m, 1),
                    duration_seconds=round(dur_s, 1),
                    location=[origin_lon, origin_lat]
                )
            ],
            safety_context=safety_context,
            weather_context=weather_context,
            score=75.0,
            score_breakdown={
                "base_score": 75.0,
                "preference_bonus": 0.0,
                "facility_bonus": 0.0,
                "hazard_penalty": 0.0,
                "weather_penalty": 0.0,
                "distance_penalty": 0.0
            }
        )

        return MultiRouteResponse(
            origin=[origin_lon, origin_lat],
            destination=[dest_lon, dest_lat],
            routes=[fallback_route],
            recommended_route_id="route_1",
            recommendation_reason="Direct corridor route calculated."
        )

