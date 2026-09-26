import pytest
from datetime import datetime
from sqlalchemy import text
from app.models import EmergencyFacility, FacilityType, DataSourceType
from app.schemas import EmergencyFacilityCreate

def test_emergency_facility_schema_validation():
    # Valid
    facility_data = {
        "name": "Nagercoil Police Station",
        "facility_type": "POLICE",
        "latitude": 8.1833,
        "longitude": 77.4119,
        "phone": "100",
        "address": "Nagercoil",
        "source": "Dummy Source",
        "last_verified": datetime.utcnow()
    }
    schema = EmergencyFacilityCreate(**facility_data)
    assert schema.latitude == 8.1833
    assert schema.longitude == 77.4119
    assert schema.data_type == DataSourceType.OFFICIAL

    # Invalid latitude
    facility_data["latitude"] = 100.0
    with pytest.raises(ValueError):
        EmergencyFacilityCreate(**facility_data)

def test_emergency_facility_db_insert(db):
    # This requires the DB to be running with PostGIS
    # Create a point using ST_SetSRID and ST_MakePoint
    # Coordinates for Nagercoil: 8.1833° N, 77.4119° E -> lon, lat
    lon = 77.4119
    lat = 8.1833
    
    new_facility = EmergencyFacility(
        name="Kanyakumari Govt Hospital",
        facility_type=FacilityType.HOSPITAL,
        geom=text(f"ST_SetSRID(ST_MakePoint({lon}, {lat}), 4326)"),
        phone="104",
        address="Kanyakumari",
        source="Test Source",
        last_verified=datetime.utcnow(),
        data_type=DataSourceType.OFFICIAL
    )
    
    db.add(new_facility)
    db.commit()
    
    # Spatial query test using ST_DWithin with geography for meter-based distance
    # Find facilities within 5km (5000 meters)
    query = db.query(EmergencyFacility).filter(
        text(f"ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint({lon + 0.01}, {lat + 0.01}), 4326)::geography, 5000)")
    ).first()
    
    assert query is not None
    assert query.name == "Kanyakumari Govt Hospital"
