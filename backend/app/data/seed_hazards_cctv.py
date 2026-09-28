import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from app.database import SessionLocal
from app.models import CCTVCamera, RoadHazard, CameraType, HazardType, HazardStatus, DataSourceType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample coordinates around Nagercoil / Kanniyakumari
CCTVS = [
    {"lon": 77.4428, "lat": 8.1705, "camera_type": CameraType.PUBLIC_SURVEILLANCE},
    {"lon": 77.4300, "lat": 8.1923, "camera_type": CameraType.TRAFFIC},
    {"lon": 77.5517, "lat": 8.0864, "camera_type": CameraType.PUBLIC_SURVEILLANCE},
    {"lon": 77.4119, "lat": 8.1833, "camera_type": CameraType.TRAFFIC},
    {"lon": 77.4200, "lat": 8.1800, "camera_type": CameraType.GOVERNMENT},
]

HAZARDS = [
    {"lon": 77.4500, "lat": 8.1600, "hazard_type": HazardType.POTHOLE, "description": "Large pothole"},
    {"lon": 77.5400, "lat": 8.0900, "hazard_type": HazardType.WATERLOGGED, "description": "Flooded street"},
]

def seed_data(db: Session):
    now = datetime.now(timezone.utc)
    
    # Delete existing
    db.query(CCTVCamera).delete()
    db.query(RoadHazard).delete()
    db.commit()

    for c in CCTVS:
        cam = CCTVCamera(
            camera_type=c["camera_type"],
            geom=f"SRID=4326;POINT({c['lon']} {c['lat']})",
            location_name="Nagercoil Traffic Camera",
            source="Govt Data",
            last_verified=now,
            data_type=DataSourceType.OFFICIAL
        )
        db.add(cam)
        
    for h in HAZARDS:
        haz = RoadHazard(
            hazard_type=h["hazard_type"],
            description=h["description"],
            geom=f"SRID=4326;POINT({h['lon']} {h['lat']})",
            status=HazardStatus.VERIFIED,
            source="User Report",
            last_verified=now,
            data_type=DataSourceType.USER_REPORTED
        )
        db.add(haz)
        
    db.commit()
    logger.info(f"Seeded {len(CCTVS)} CCTVs and {len(HAZARDS)} Hazards.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
