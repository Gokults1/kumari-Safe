from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from geoalchemy2.types import Geography
from typing import Optional
from app.models import EmergencyFacility, FacilityType
from app.schemas import EmergencyFacilityCreate

def _row_to_dict(row):
    """Helper to merge SQLAlchemy row objects (Facility, latitude, longitude, distance) into a dict"""
    if not row:
        return None
    # row[0] is the EmergencyFacility model
    fac = row[0]
    data = {c.name: getattr(fac, c.name) for c in fac.__table__.columns if c.name != 'geom'}
    
    # getattr or direct index depending on SQLAlchemy row mapping
    data['latitude'] = getattr(row, 'latitude', None)
    data['longitude'] = getattr(row, 'longitude', None)
    if hasattr(row, 'distance_meters'):
        data['distance_meters'] = getattr(row, 'distance_meters', None)
        
    return data

def get_base_query(db: Session):
    return db.query(
        EmergencyFacility,
        func.ST_Y(EmergencyFacility.geom).label('latitude'),
        func.ST_X(EmergencyFacility.geom).label('longitude')
    )

def get_facility_by_id(db: Session, facility_id: int):
    row = get_base_query(db).filter(EmergencyFacility.id == facility_id).first()
    return _row_to_dict(row)

def create_facility(db: Session, facility: EmergencyFacilityCreate):
    # Using parameterized ST_MakePoint and ST_SetSRID
    db_facility = EmergencyFacility(
        name=facility.name,
        facility_type=facility.facility_type,
        phone=facility.phone,
        address=facility.address,
        source=facility.source,
        source_url=facility.source_url,
        last_verified=facility.last_verified,
        data_type=facility.data_type,
        geom=func.ST_SetSRID(func.ST_MakePoint(facility.longitude, facility.latitude), 4326)
    )
    db.add(db_facility)
    db.commit()
    db.refresh(db_facility)
    return get_facility_by_id(db, db_facility.id)

def get_facilities(db: Session, facility_type: Optional[FacilityType], limit: int, offset: int):
    query = get_base_query(db)
    if facility_type:
        query = query.filter(EmergencyFacility.facility_type == facility_type)
    rows = query.offset(offset).limit(limit).all()
    return [_row_to_dict(row) for row in rows]

def get_facilities_within_radius(db: Session, lat: float, lon: float, radius_meters: float, facility_type: Optional[FacilityType]):
    target_point = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326).cast(Geography)
    geom_geog = EmergencyFacility.geom.cast(Geography)
    
    distance_col = func.ST_Distance(geom_geog, target_point).label('distance_meters')
    
    query = db.query(
        EmergencyFacility,
        func.ST_Y(EmergencyFacility.geom).label('latitude'),
        func.ST_X(EmergencyFacility.geom).label('longitude'),
        distance_col
    ).filter(
        func.ST_DWithin(geom_geog, target_point, radius_meters)
    )
    
    if facility_type:
        query = query.filter(EmergencyFacility.facility_type == facility_type)
        
    query = query.order_by(distance_col)
    rows = query.all()
    return [_row_to_dict(row) for row in rows]

def get_emergency_assistance_context(db: Session, lat: float, lon: float) -> dict:
    target_point = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326).cast(Geography)
    geom_geog = EmergencyFacility.geom.cast(Geography)
    distance_col = func.ST_Distance(geom_geog, target_point).label('distance_meters')
    
    closest_facilities = {}
    
    for f_type in [FacilityType.POLICE, FacilityType.HOSPITAL, FacilityType.FIRE_STATION]:
        row = db.query(
            EmergencyFacility,
            func.ST_Y(EmergencyFacility.geom).label('latitude'),
            func.ST_X(EmergencyFacility.geom).label('longitude'),
            distance_col
        ).filter(
            EmergencyFacility.facility_type == f_type
        ).order_by(distance_col).first()
        
        if row:
            fac_dict = _row_to_dict(row)
            distance_m = fac_dict.get('distance_meters', 0.0)
            closest_facilities[f_type] = {
                "facility": fac_dict,
                "distance_km": round(distance_m / 1000.0, 2)
            }
        else:
            closest_facilities[f_type] = None
            
    district_helplines = [
        {"name": "Emergency / Police", "phone": "112", "description": "National Emergency Number"},
        {"name": "District Disaster Control Room", "phone": "1077", "description": "District Collectorate Toll Free"},
        {"name": "Women Helpline", "phone": "1091", "description": "24/7 Women in Distress"},
        {"name": "Child Helpline", "phone": "1098", "description": "24/7 Child Protection"}
    ]
    
    return {
        "closest_facilities": closest_facilities,
        "district_helplines": district_helplines
    }
