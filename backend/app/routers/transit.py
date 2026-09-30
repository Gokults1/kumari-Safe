from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MultimodalConnectivityResponse
from app.services.transit_service import get_multimodal_connectivity
from app.data.train_schedules import search_trains, get_all_trains

router = APIRouter()

@router.get("/connectivity", response_model=MultimodalConnectivityResponse)
def get_connectivity(
    origin_lat: float, 
    origin_lon: float, 
    dest_lat: float, 
    dest_lon: float, 
    db: Session = Depends(get_db)
):
    """
    Get the nearest transit hubs for a given origin and destination (First/Last Mile).
    """
    return get_multimodal_connectivity(db, origin_lon, origin_lat, dest_lon, dest_lat)


@router.get("/trains/search")
def search_trains_endpoint(
    destination: Optional[str] = Query(None, description="Destination city, station, or route place to search trains for"),
    direction: Optional[str] = Query("ALL", description="Filter by direction: ALL, DEPARTING (Going), ARRIVING (Coming)"),
    station: Optional[str] = Query("ALL", description="Filter by Kanniyakumari station: ALL, NCJ, CAPE, NCT")
):
    """
    Search for trains coming to or going from Nagercoil Junction, Kanyakumari, and Nagercoil Town.
    Returns matching train schedules with timings, stops, and days of operation.
    """
    query_str = destination or ""
    results = search_trains(query=query_str, direction=direction or "ALL", station=station or "ALL")
    return {
        "query": query_str,
        "direction": direction,
        "station": station,
        "count": len(results),
        "trains": results
    }


@router.get("/trains/all")
def get_all_trains_endpoint(
    direction: Optional[str] = Query("ALL", description="Filter by direction: ALL, DEPARTING, ARRIVING"),
    station: Optional[str] = Query("ALL", description="Filter by station: ALL, NCJ, CAPE, NCT")
):
    """
    Get the complete list of all coming and going trains from Nagercoil Junction, Kanyakumari, and Nagercoil Town.
    """
    trains = search_trains(query="", direction=direction or "ALL", station=station or "ALL")
    return {
        "count": len(trains),
        "trains": trains
    }
