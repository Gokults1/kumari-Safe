from typing import List
from app.schemas import CandidateRoute, RoutePreference

def score_routes(
    routes: List[CandidateRoute], 
    preference: RoutePreference,
    is_weather_adverse: bool = False,
    profile: str = "walking"
) -> List[CandidateRoute]:
    if not routes:
        return []

    min_duration = min(r.duration_seconds for r in routes)

    weights = {
        RoutePreference.FASTEST: {"time": 0.8, "safety": 0.2},
        RoutePreference.SAFEST: {"time": 0.3, "safety": 0.7},
        RoutePreference.BALANCED: {"time": 0.5, "safety": 0.5}
    }
    w_time = weights.get(preference, weights[RoutePreference.BALANCED])["time"]
    w_safety = weights.get(preference, weights[RoutePreference.BALANCED])["safety"]

    for route in routes:
        # Time Score: 0 to 100
        time_score = (min_duration / route.duration_seconds * 100) if route.duration_seconds > 0 else 100.0

        # Safety Score: starts at 50, goes up or down
        safety_score = 50.0

        if route.safety_context:
            ctx = route.safety_context
            safety_score += (ctx.cctv_count * 10)
            safety_score += (ctx.police_stations_count * 15)
            safety_score += (ctx.hospitals_count * 15)
            safety_score += (ctx.fire_stations_count * 10)

            # Hazards penalty
            safety_score -= (ctx.road_hazards_count * 20)

        # Weather penalty
        if is_weather_adverse and profile == "walking":
            safety_score -= 30

        # Cap safety score between 0 and 100
        safety_score = max(0.0, min(100.0, safety_score))

        final_score = (time_score * w_time) + (safety_score * w_safety)
        route.score = round(final_score, 2)

    # Return the routes, sorted descending by score in place or just return them
    # The requirement says to do this in the service or here. Let's just return the list.
    return routes
