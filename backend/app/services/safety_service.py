from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from geoalchemy2.types import Geography
from typing import List
from app.models import EmergencyFacility, FacilityType, CCTVCamera, RoadHazard, HazardStatus
from app.services.emergency_service import _row_to_dict

def compute_route_safety_context(db: Session, route_coordinates: List[List[float]], corridor_radius_meters: float = 500.0) -> dict:
    if not route_coordinates or len(route_coordinates) < 2:
        return {
            "corridor_radius_meters": corridor_radius_meters,
            "police_stations_count": 0,
            "hospitals_count": 0,
            "fire_stations_count": 0,
            "cctv_count": 0,
            "road_hazards_count": 0,
            "facilities_within_corridor": [],
            "hazards": [],
            "context_description": "Route does not have enough points to compute safety context."
        }

    # Construct WKT for LineString: LINESTRING(lon lat, lon lat, ...)
    points_str = ", ".join(f"{coord[0]} {coord[1]}" for coord in route_coordinates)
    route_wkt = f"LINESTRING({points_str})"
    
    route_geom = func.ST_GeomFromText(route_wkt, 4326).cast(Geography)
    fac_geom = EmergencyFacility.geom.cast(Geography)
    
    distance_col = func.ST_Distance(fac_geom, route_geom).label("distance_meters")
    
    rows = db.query(
        EmergencyFacility,
        func.ST_Y(EmergencyFacility.geom).label('latitude'),
        func.ST_X(EmergencyFacility.geom).label('longitude'),
        distance_col
    ).filter(
        func.ST_DWithin(fac_geom, route_geom, corridor_radius_meters)
    ).order_by(distance_col).all()

    facilities_within_corridor = []
    police_count = 0
    hospitals_count = 0
    fire_stations_count = 0

    for row in rows:
        fac_dict = _row_to_dict(row)
        distance_m = fac_dict.get("distance_meters", 0.0)
        
        facilities_within_corridor.append({
            "facility": fac_dict,
            "distance_km": round(distance_m / 1000.0, 2)
        })
        
        fac_type = fac_dict.get("facility_type")
        if fac_type == FacilityType.POLICE:
            police_count += 1
        elif fac_type == FacilityType.HOSPITAL:
            hospitals_count += 1
        elif fac_type == FacilityType.FIRE_STATION:
            fire_stations_count += 1

    # CCTV Query
    cctv_geom = CCTVCamera.geom.cast(Geography)
    cctv_dist_col = func.ST_Distance(cctv_geom, route_geom).label("distance_meters")
    cctv_rows = db.query(
        CCTVCamera,
        func.ST_Y(CCTVCamera.geom).label('latitude'),
        func.ST_X(CCTVCamera.geom).label('longitude'),
        cctv_dist_col
    ).filter(
        func.ST_DWithin(cctv_geom, route_geom, corridor_radius_meters)
    ).order_by(cctv_dist_col).all()
    
    cctv_count = len(cctv_rows)
    for c_row in cctv_rows:
        cctv_obj = c_row.CCTVCamera
        facilities_within_corridor.append({
            "facility": {
                "id": cctv_obj.id,
                "name": "Public CCTV",
                "facility_type": "CCTV",
                "latitude": c_row.latitude,
                "longitude": c_row.longitude
            },
            "distance_km": round(c_row.distance_meters / 1000.0, 2)
        })

    # Hazards Query
    hazard_geom = RoadHazard.geom.cast(Geography)
    hazard_dist_col = func.ST_Distance(hazard_geom, route_geom).label("distance_meters")
    hazard_rows = db.query(
        RoadHazard,
        func.ST_Y(RoadHazard.geom).label('latitude'),
        func.ST_X(RoadHazard.geom).label('longitude'),
        hazard_dist_col
    ).filter(
        func.ST_DWithin(hazard_geom, route_geom, corridor_radius_meters),
        RoadHazard.status == HazardStatus.VERIFIED
    ).order_by(hazard_dist_col).all()
    
    hazards_list = []
    for h_row in hazard_rows:
        hazard_obj = h_row.RoadHazard
        hazards_list.append({
            "id": hazard_obj.id,
            "hazard_type": hazard_obj.hazard_type,
            "description": hazard_obj.description,
            "status": hazard_obj.status,
            "latitude": h_row.latitude,
            "longitude": h_row.longitude,
            "distance_meters": h_row.distance_meters
        })

    parts = []
    if police_count > 0:
        parts.append(f"{police_count} police station(s)")
    if hospitals_count > 0:
        parts.append(f"{hospitals_count} hospital(s)")
    if fire_stations_count > 0:
        parts.append(f"{fire_stations_count} fire station(s)")
    if cctv_count > 0:
        parts.append(f"{cctv_count} CCTV camera(s)")
    if len(hazards_list) > 0:
        parts.append(f"and {len(hazards_list)} active road hazard(s)")

    if parts:
        context_description = f"Mapped infrastructure within {int(corridor_radius_meters)}m: " + ", ".join(parts) + "."
    else:
        context_description = f"No emergency facilities or hazards mapped within {int(corridor_radius_meters)}m of this route."

    return {
        "corridor_radius_meters": corridor_radius_meters,
        "police_stations_count": police_count,
        "hospitals_count": hospitals_count,
        "fire_stations_count": fire_stations_count,
        "cctv_count": cctv_count,
        "road_hazards_count": len(hazards_list),
        "facilities_within_corridor": facilities_within_corridor,
        "hazards": hazards_list,
        "context_description": context_description
    }
