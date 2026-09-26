from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import HazardReportCreate, HazardReportResponse
from app.services import hazard_service

router = APIRouter()

@router.post("/report", response_model=HazardReportResponse)
def report_hazard(report: HazardReportCreate, db: Session = Depends(get_db)):
    return hazard_service.submit_hazard_report(db, report)

@router.post("/{hazard_id}/verify", response_model=HazardReportResponse)
def verify_hazard(hazard_id: int, db: Session = Depends(get_db)):
    hazard = hazard_service.verify_hazard(db, hazard_id)
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard not found")
    return hazard
