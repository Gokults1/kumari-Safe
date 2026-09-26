import pytest
from app.data.kanniyakumari_verified_seeds import seed_verified_data, VERIFIED_FACILITIES
from app.models import EmergencyFacility, FacilityType, DataSourceType
from app.services.emergency_service import get_emergency_assistance_context

def test_seed_verified_data_success(db):
    # Execute the seed script
    seed_verified_data(db)
    
    # Query database
    facilities = db.query(EmergencyFacility).all()
    
    # Verify count matches
    assert len(facilities) == len(VERIFIED_FACILITIES)
    
    # Verify a specific facility loaded correctly with valid fields
    kottar_ps = db.query(EmergencyFacility).filter(EmergencyFacility.name == "Kottar Police Station").first()
    assert kottar_ps is not None
    assert kottar_ps.facility_type == FacilityType.POLICE
    assert kottar_ps.phone == "04652-220517"
    assert kottar_ps.source == "Kanniyakumari District Administration"
    assert kottar_ps.data_type == DataSourceType.OFFICIAL
    assert kottar_ps.geom is not None

def test_seed_idempotency(db):
    # Execute the seed script twice
    seed_verified_data(db)
    seed_verified_data(db)
    
    # Count shouldn't duplicate
    facilities = db.query(EmergencyFacility).all()
    assert len(facilities) == len(VERIFIED_FACILITIES)

def test_emergency_assist_query(db):
    # Ensure data is loaded
    seed_verified_data(db)
    
    # Test Nagercoil center (8.1833, 77.4119)
    # Expected nearby Police: Kottar or Vadasery
    # Expected nearby Hospital: Govt Headquarters Hospital or Asaripallam
    
    lat = 8.1833
    lon = 77.4119
    context = get_emergency_assistance_context(db, lat=lat, lon=lon)
    
    closest = context.get("closest_facilities", {})
    
    police = closest.get(FacilityType.POLICE)
    assert police is not None
    assert police["facility"]["name"] in ["Kottar Police Station", "Vadasery Police Station"]
    
    hospital = closest.get(FacilityType.HOSPITAL)
    assert hospital is not None
    # We seeded "Govt Headquarters Hospital (Padmanabhapuram / Nagercoil)" and "Kanyakumari Govt Medical College Hospital (Asaripallam)"
    assert "Hospital" in hospital["facility"]["name"]
    
    fire = closest.get(FacilityType.FIRE_STATION)
    assert fire is not None
    assert fire["facility"]["name"] == "Nagercoil Fire Station"
