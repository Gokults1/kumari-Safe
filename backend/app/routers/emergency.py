from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas import EmergencyFacilityResponse, EmergencyFacilityCreate, EmergencyAssistResponse
from app.models import FacilityType
from app.services import emergency_service

router = APIRouter()

@router.get("/assist")
def get_emergency_assistance(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    db: Session = Depends(get_db)
):
    """
    Get aggregated emergency assistance context (closest police, hospital, fire station,
    all nearby police stations with staff directories, and district helplines/officers)
    """
    return emergency_service.get_emergency_assistance_context(db, lat, lon)

@router.post("/facilities", response_model=EmergencyFacilityResponse, status_code=201)
def create_facility(facility: EmergencyFacilityCreate, db: Session = Depends(get_db)):
    return emergency_service.create_facility(db, facility)

@router.get("/facilities", response_model=List[EmergencyFacilityResponse])
def get_facilities(
    facility_type: Optional[FacilityType] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return emergency_service.get_facilities(db, facility_type, limit, offset)

@router.get("/nearby", response_model=List[EmergencyFacilityResponse])
@router.get("/facilities/nearby", response_model=List[EmergencyFacilityResponse])
def get_facilities_nearby(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_meters: float = Query(5000, gt=0),
    facility_type: Optional[FacilityType] = None,
    db: Session = Depends(get_db)
):
    return emergency_service.get_facilities_within_radius(db, lat, lon, radius_meters, facility_type)

@router.get("/facilities/{id}", response_model=EmergencyFacilityResponse)
def get_facility(id: int, db: Session = Depends(get_db)):
    facility = emergency_service.get_facility_by_id(db, id)
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    return facility
