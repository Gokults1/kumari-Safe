from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MultimodalConnectivityResponse
from app.services.transit_service import get_multimodal_connectivity

router = APIRouter()

@router.get("/connectivity", response_model=MultimodalConnectivityResponse)
def get_connectivity(
    origin_lon: float,
    origin_lat: float,
    dest_lon: float,
    dest_lat: float,
    db: Session = Depends(get_db)
):
    """
    Get the nearest transit hubs for a given origin and destination (First/Last Mile).
    """
    return get_multimodal_connectivity(db, origin_lon, origin_lat, dest_lon, dest_lat)
