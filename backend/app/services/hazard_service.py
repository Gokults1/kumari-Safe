from sqlalchemy.orm import Session
from datetime import datetime

from app.models import RoadHazard, HazardStatus, DataSourceType
from app.schemas import HazardReportCreate

def submit_hazard_report(db: Session, report: HazardReportCreate) -> RoadHazard:
    geom = f"SRID=4326;POINT({report.longitude} {report.latitude})"
    
    db_hazard = RoadHazard(
        geom=geom,
        hazard_type=report.hazard_type,
        description=report.description,
        status=HazardStatus.REPORTED,
        source="Community User",
        data_type=DataSourceType.USER_REPORTED,
        last_verified=datetime.utcnow()
    )
    
    db.add(db_hazard)
    db.commit()
    db.refresh(db_hazard)
    return db_hazard

def verify_hazard(db: Session, hazard_id: int) -> RoadHazard:
    db_hazard = db.query(RoadHazard).filter(RoadHazard.id == hazard_id).first()
    if db_hazard:
        db_hazard.status = HazardStatus.VERIFIED
        db_hazard.last_verified = datetime.utcnow()
        db.commit()
        db.refresh(db_hazard)
    return db_hazard
