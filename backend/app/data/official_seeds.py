from datetime import datetime, timezone
from app.schemas import EmergencyFacilityCreate
from app.models import FacilityType, DataSourceType

OFFICIAL_SEEDS = [
    EmergencyFacilityCreate(
        name="District Disaster Management Control Room",
        facility_type=FacilityType.DISASTER_CONTROL_ROOM,
        latitude=8.1833,
        longitude=77.4119,
        phone="1077",
        address="District Collectorate, Nagercoil, Kanniyakumari",
        source="Official District Website",
        last_verified=datetime.now(timezone.utc),
        data_type=DataSourceType.OFFICIAL
    ),
    EmergencyFacilityCreate(
        name="Coastal Security Helpline",
        facility_type=FacilityType.OTHER_EMERGENCY,
        latitude=8.1833,
        longitude=77.4119,
        phone="1093",
        address="Kanniyakumari Coastal Security Group",
        source="Official Government Sources",
        last_verified=datetime.now(timezone.utc),
        data_type=DataSourceType.OFFICIAL
    )
]

def seed_official_facilities(db):
    """Seed the database with verified official emergency facilities."""
    from app.services import emergency_service
    
    seeded_count = 0
    for facility in OFFICIAL_SEEDS:
        # Check if already exists (basic check by name to prevent duplicates on multiple runs)
        from app.models import EmergencyFacility
        existing = db.query(EmergencyFacility).filter_by(name=facility.name).first()
        if not existing:
            emergency_service.create_facility(db, facility)
            seeded_count += 1
            
    return seeded_count
