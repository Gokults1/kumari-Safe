from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import RouteRequest, MultiRouteResponse, RouteTrackingRequest, RouteTrackingResponse
from app.services import routing_service, navigation_tracking_service
from app.database import get_db

router = APIRouter()

@router.post("/directions", response_model=MultiRouteResponse)
def get_directions(request: RouteRequest, db: Session = Depends(get_db)):
    """
    Get routing directions between two coordinates, including multiple route candidates.
    """
    return routing_service.get_multi_routes(
        db=db,
        origin_lat=request.origin_lat,
        origin_lon=request.origin_lon,
        dest_lat=request.dest_lat,
        dest_lon=request.dest_lon,
        profile=request.profile,
        include_safety_context=request.include_safety_context,
        corridor_radius_meters=request.corridor_radius_meters
    )

@router.post("/track-progress", response_model=RouteTrackingResponse)
def track_progress(request: RouteTrackingRequest, db: Session = Depends(get_db)):
    """
    Evaluate navigation progress against the active route.
    """
    return navigation_tracking_service.evaluate_navigation_progress(db, request)
