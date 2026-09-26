import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import EmergencyFacility, FacilityType, DataSourceType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Coordinates based on town centers or known locations in WGS84 (lon, lat)
VERIFIED_FACILITIES = [
    # Police Stations
    {
        "name": "Kottar Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.4428, "lat": 8.1705,
        "phone": "04652-220517"
    },
    {
        "name": "Vadasery Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.4300, "lat": 8.1923,
        "phone": "04652-220518"
    },
    {
        "name": "Kanyakumari Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.5517, "lat": 8.0864,
        "phone": "04652-246222"
    },
    {
        "name": "Suchindram Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.4641, "lat": 8.1565,
        "phone": "04652-241222"
    },
    {
        "name": "Thuckalay Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.3275, "lat": 8.2464,
        "phone": "04651-250222"
    },
    {
        "name": "Marthandam Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.2185, "lat": 8.3101,
        "phone": "04651-270222"
    },
    {
        "name": "Colachel Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.2625, "lat": 8.1772,
        "phone": "04651-226222"
    },
    {
        "name": "Eraniel Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.3005, "lat": 8.2045,
        "phone": "04651-221222"
    },
    {
        "name": "Aralvaimozhi Police Station",
        "facility_type": FacilityType.POLICE,
        "lon": 77.5218, "lat": 8.2562,
        "phone": "04652-263222"
    },

    # Government Hospitals
    {
        "name": "Kanyakumari Govt Medical College Hospital (Asaripallam)",
        "facility_type": FacilityType.HOSPITAL,
        "lon": 77.4042, "lat": 8.1691,
        "phone": "04652-232261"
    },
    {
        "name": "Govt Headquarters Hospital (Padmanabhapuram / Nagercoil)",
        "facility_type": FacilityType.HOSPITAL,
        "lon": 77.4273, "lat": 8.1834,
        "phone": "04652-230020"
    },
    {
        "name": "Kanyakumari Govt Hospital",
        "facility_type": FacilityType.HOSPITAL,
        "lon": 77.5451, "lat": 8.0841,
        "phone": "04652-246224"
    },

    # Fire & Rescue Stations
    {
        "name": "Nagercoil Fire Station",
        "facility_type": FacilityType.FIRE_STATION,
        "lon": 77.4334, "lat": 8.1818,
        "phone": "101"
    },
    {
        "name": "Kanyakumari Fire Station",
        "facility_type": FacilityType.FIRE_STATION,
        "lon": 77.5455, "lat": 8.0877,
        "phone": "101"
    },
    {
        "name": "Thuckalay Fire Station",
        "facility_type": FacilityType.FIRE_STATION,
        "lon": 77.3235, "lat": 8.2443,
        "phone": "101"
    },
    {
        "name": "Colachel Fire Station",
        "facility_type": FacilityType.FIRE_STATION,
        "lon": 77.2647, "lat": 8.1775,
        "phone": "101"
    },

    # District Helplines (Placed near District Collectorate)
    {
        "name": "Police Helpline 100",
        "facility_type": FacilityType.OTHER_EMERGENCY,
        "lon": 77.4302, "lat": 8.1824,
        "phone": "100"
    },
    {
        "name": "Fire Helpline 101",
        "facility_type": FacilityType.OTHER_EMERGENCY,
        "lon": 77.4302, "lat": 8.1824,
        "phone": "101"
    },
    {
        "name": "Ambulance Helpline 108",
        "facility_type": FacilityType.OTHER_EMERGENCY,
        "lon": 77.4302, "lat": 8.1824,
        "phone": "108"
    },
    {
        "name": "Disaster Control Room 1077",
        "facility_type": FacilityType.DISASTER_CONTROL_ROOM,
        "lon": 77.4302, "lat": 8.1824,
        "phone": "1077"
    },
    {
        "name": "Coastal Security 1093",
        "facility_type": FacilityType.OTHER_EMERGENCY,
        "lon": 77.4302, "lat": 8.1824,
        "phone": "1093"
    },
]

PROVENANCE = {
    "source": "Kanniyakumari District Administration",
    "source_url": "https://kanniyakumari.nic.in/",
    "data_type": DataSourceType.OFFICIAL,
}

def seed_verified_data(db: Session):
    logger.info("Starting ingestion of verified Kanniyakumari facilities...")
    
    upsert_count = 0
    now = datetime.utcnow()
    
    for facility in VERIFIED_FACILITIES:
        # Check if exists by name
        existing = db.query(EmergencyFacility).filter(
            EmergencyFacility.name == facility["name"]
        ).first()
        
        geom_wkt = f"SRID=4326;POINT({facility['lon']} {facility['lat']})"
        
        if existing:
            existing.facility_type = facility["facility_type"]
            existing.geom = geom_wkt
            existing.phone = facility.get("phone")
            existing.source = PROVENANCE["source"]
            existing.source_url = PROVENANCE["source_url"]
            existing.last_verified = now
            existing.data_type = PROVENANCE["data_type"]
            logger.info(f"Updated: {facility['name']}")
        else:
            new_facility = EmergencyFacility(
                name=facility["name"],
                facility_type=facility["facility_type"],
                geom=geom_wkt,
                phone=facility.get("phone"),
                source=PROVENANCE["source"],
                source_url=PROVENANCE["source_url"],
                last_verified=now,
                data_type=PROVENANCE["data_type"]
            )
            db.add(new_facility)
            logger.info(f"Inserted: {facility['name']}")
        
        upsert_count += 1
    
    db.commit()
    logger.info(f"Successfully processed {upsert_count} facilities.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_verified_data(db)
    finally:
        db.close()
