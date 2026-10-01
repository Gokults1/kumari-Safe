from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from geoalchemy2.types import Geography
from typing import Optional
from app.models import EmergencyFacility, FacilityType
from app.schemas import EmergencyFacilityCreate
from app.data.police_staff_directory import POLICE_STAFF_DIRECTORY, DISTRICT_OFFICERS

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

import math
from app.data.kanniyakumari_verified_seeds import VERIFIED_FACILITIES

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def _fallback_facilities_within_radius(lat: float, lon: float, radius_meters: float, facility_type: Optional[FacilityType]):
    results = []
    for idx, f in enumerate(VERIFIED_FACILITIES):
        f_type = f.get("facility_type")
        if facility_type:
            target_type = facility_type.value if hasattr(facility_type, "value") else str(facility_type)
            curr_type = f_type.value if hasattr(f_type, "value") else str(f_type)
            if target_type != curr_type:
                continue
        d_km = _haversine_km(lat, lon, f["lat"], f["lon"])
        d_m = d_km * 1000.0
        if d_m <= radius_meters:
            results.append({
                "id": idx + 1,
                "name": f["name"],
                "facility_type": f_type.value if hasattr(f_type, "value") else str(f_type),
                "phone": f.get("phone"),
                "address": f.get("address"),
                "source": "Kanniyakumari District Administration",
                "source_url": "https://kanniyakumari.nic.in/",
                "last_verified": "2025-01-01T00:00:00",
                "data_type": "OFFICIAL",
                "latitude": f["lat"],
                "longitude": f["lon"],
                "distance_meters": round(d_m, 1)
            })
    results.sort(key=lambda x: x["distance_meters"])
    return results

def _fallback_facilities(facility_type: Optional[FacilityType], limit: int, offset: int):
    results = []
    for idx, f in enumerate(VERIFIED_FACILITIES):
        f_type = f.get("facility_type")
        if facility_type:
            target_type = facility_type.value if hasattr(facility_type, "value") else str(facility_type)
            curr_type = f_type.value if hasattr(f_type, "value") else str(f_type)
            if target_type != curr_type:
                continue
        results.append({
            "id": idx + 1,
            "name": f["name"],
            "facility_type": f_type.value if hasattr(f_type, "value") else str(f_type),
            "phone": f.get("phone"),
            "address": f.get("address"),
            "source": "Kanniyakumari District Administration",
            "source_url": "https://kanniyakumari.nic.in/",
            "last_verified": "2025-01-01T00:00:00",
            "data_type": "OFFICIAL",
            "latitude": f["lat"],
            "longitude": f["lon"]
        })
    return results[offset:offset+limit]

def get_facilities(db: Session, facility_type: Optional[FacilityType], limit: int, offset: int):
    if db is None:
        return _fallback_facilities(facility_type, limit, offset)
    try:
        query = get_base_query(db)
        if facility_type:
            query = query.filter(EmergencyFacility.facility_type == facility_type)
        rows = query.offset(offset).limit(limit).all()
        return [_row_to_dict(row) for row in rows]
    except Exception:
        return _fallback_facilities(facility_type, limit, offset)

def get_facilities_within_radius(db: Session, lat: float, lon: float, radius_meters: float, facility_type: Optional[FacilityType]):
    if db is None:
        return _fallback_facilities_within_radius(lat, lon, radius_meters, facility_type)
    try:
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
    except Exception:
        return _fallback_facilities_within_radius(lat, lon, radius_meters, facility_type)


def _get_staff_for_station(station_name: str) -> list:
    """Look up the police staff directory for a given station name."""
    for key, value in POLICE_STAFF_DIRECTORY.items():
        if key.lower() in station_name.lower() or station_name.lower() in key.lower():
            return value.get("staff", [])
    return []


# Hardcoded fallback data — so emergency NEVER shows empty
FALLBACK_POLICE = {
    "name": "Kottar Police Station",
    "facility_type": "POLICE",
    "phone": "04652-220517",
    "latitude": 8.1705,
    "longitude": 77.4428,
    "distance_meters": 0,
    "id": 0,
    "source": "Kanniyakumari District Administration",
    "source_url": "https://kanniyakumari.nic.in/",
    "last_verified": "2025-01-01T00:00:00",
    "data_type": "OFFICIAL",
    "staff_directory": POLICE_STAFF_DIRECTORY.get("Kottar Police Station", {}).get("staff", []),
}

FALLBACK_HOSPITAL = {
    "name": "Kanyakumari Govt Medical College Hospital (Asaripallam)",
    "facility_type": "HOSPITAL",
    "phone": "04652-232261",
    "latitude": 8.1691,
    "longitude": 77.4042,
    "distance_meters": 0,
    "id": 0,
    "source": "Kanniyakumari District Administration",
    "source_url": "https://kanniyakumari.nic.in/",
    "last_verified": "2025-01-01T00:00:00",
    "data_type": "OFFICIAL",
    "staff_directory": [],
}

FALLBACK_FIRE = {
    "name": "Nagercoil Fire Station",
    "facility_type": "FIRE_STATION",
    "phone": "101",
    "latitude": 8.1818,
    "longitude": 77.4334,
    "distance_meters": 0,
    "id": 0,
    "source": "Kanniyakumari District Administration",
    "source_url": "https://kanniyakumari.nic.in/",
    "last_verified": "2025-01-01T00:00:00",
    "data_type": "OFFICIAL",
    "staff_directory": [],
}


import math
from app.data.kanniyakumari_verified_seeds import VERIFIED_FACILITIES

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def get_emergency_assistance_context(db: Session, lat: float, lon: float) -> dict:
    closest_facilities = {}
    all_police_stations = []

    try:
        if db is None:
            raise RuntimeError("No database session provided")

        target_point = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326).cast(Geography)
        geom_geog = EmergencyFacility.geom.cast(Geography)
        distance_col = func.ST_Distance(geom_geog, target_point).label('distance_meters')
        
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
                
                # Attach staff directory for police stations
                if f_type == FacilityType.POLICE:
                    fac_dict['staff_directory'] = _get_staff_for_station(fac_dict.get('name', ''))
                else:
                    fac_dict['staff_directory'] = []
                    
                distance_m = fac_dict.get('distance_meters', 0.0)
                closest_facilities[f_type] = {
                    "facility": fac_dict,
                    "distance_km": round(distance_m / 1000.0, 2)
                }
            else:
                closest_facilities[f_type] = None

        # Fetch all nearby police stations
        police_rows = db.query(
            EmergencyFacility,
            func.ST_Y(EmergencyFacility.geom).label('latitude'),
            func.ST_X(EmergencyFacility.geom).label('longitude'),
            distance_col
        ).filter(
            EmergencyFacility.facility_type == FacilityType.POLICE,
            func.ST_DWithin(geom_geog, target_point, 15000)
        ).order_by(distance_col).all()
        
        for prow in police_rows:
            pdict = _row_to_dict(prow)
            pdict['staff_directory'] = _get_staff_for_station(pdict.get('name', ''))
            all_police_stations.append(pdict)

    except Exception:
        # In-memory verified fallback when database is offline or unreachable
        closest_facilities = {}
        for f_type in [FacilityType.POLICE, FacilityType.HOSPITAL, FacilityType.FIRE_STATION]:
            matching = [f for f in VERIFIED_FACILITIES if f.get("facility_type") == f_type]
            if matching:
                sorted_facs = sorted(matching, key=lambda f: _haversine_km(lat, lon, f["lat"], f["lon"]))
                best = sorted_facs[0]
                dist_km = round(_haversine_km(lat, lon, best["lat"], best["lon"]), 2)
                fac_dict = {
                    "id": 1,
                    "name": best["name"],
                    "facility_type": f_type.value if hasattr(f_type, "value") else str(f_type),
                    "phone": best.get("phone", "100"),
                    "latitude": best["lat"],
                    "longitude": best["lon"],
                    "distance_meters": dist_km * 1000,
                    "staff_directory": _get_staff_for_station(best["name"]) if f_type == FacilityType.POLICE else []
                }
                closest_facilities[f_type] = {
                    "facility": fac_dict,
                    "distance_km": dist_km
                }
            else:
                closest_facilities[f_type] = None

        # Populate all verified police stations with distance
        for idx, f in enumerate(VERIFIED_FACILITIES):
            if f.get("facility_type") == FacilityType.POLICE:
                dist_km = round(_haversine_km(lat, lon, f["lat"], f["lon"]), 2)
                all_police_stations.append({
                    "id": idx + 1,
                    "name": f["name"],
                    "facility_type": "POLICE",
                    "phone": f.get("phone", "100"),
                    "latitude": f["lat"],
                    "longitude": f["lon"],
                    "distance_meters": dist_km * 1000,
                    "distance_km": dist_km,
                    "staff_directory": _get_staff_for_station(f["name"])
                })
        all_police_stations.sort(key=lambda s: s.get("distance_km", 999))
    
    # If DB returned nothing or few stations, supplement with all stations from our directory
    existing_names = {p.get('name', '').lower() for p in all_police_stations}
    for sname, sinfo in POLICE_STAFF_DIRECTORY.items():
        if not any(sname.lower() in en or en in sname.lower() for en in existing_names):
            all_police_stations.append({
                "name": sname,
                "phone": sinfo.get("station_phone", "100"),
                "facility_type": "POLICE",
                "latitude": 8.1833,
                "longitude": 77.4119,
                "distance_meters": 0,
                "staff_directory": sinfo.get("staff", []),
                "id": 0,
                "source": "Kanniyakumari District Administration",
                "source_url": "https://kanniyakumari.nic.in/",
                "last_verified": "2025-01-01T00:00:00",
                "data_type": "OFFICIAL",
            })

    district_helplines = [
        {"name": "Emergency / Police", "phone": "112", "description": "National Emergency Number"},
        {"name": "Police Control Room", "phone": "100", "description": "All India Police Helpline"},
        {"name": "District SP Office", "phone": "04652-230500", "description": "Superintendent of Police, Kanniyakumari"},
        {"name": "District Disaster Control Room", "phone": "1077", "description": "District Collectorate Toll Free"},
        {"name": "Women Helpline", "phone": "1091", "description": "24/7 Women in Distress"},
        {"name": "Child Helpline", "phone": "1098", "description": "24/7 Child Protection"},
        {"name": "Ambulance", "phone": "108", "description": "Govt Ambulance Service"},
        {"name": "Fire & Rescue", "phone": "101", "description": "Fire Station Emergency"},
        {"name": "Coastal Security", "phone": "1093", "description": "Indian Coast Guard"},
        {"name": "Railway Police (RPF)", "phone": "1800-111-322", "description": "Railway Protection Force (Toll Free)"},
    ]
    
    # District officers
    district_officers_list = [
        {"name": d["name"], "phone": d["phone"], "description": d["designation"]}
        for d in DISTRICT_OFFICERS
    ]
    
    return {
        "closest_facilities": closest_facilities,
        "all_police_stations": all_police_stations,
        "district_helplines": district_helplines,
        "district_officers": district_officers_list,
    }
