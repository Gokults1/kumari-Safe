import math
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import TransitHub, DataSourceType
from app.schemas import MultimodalConnectivityResponse, TransitHubResponse
from app.data.transit_seeds import TRANSIT_HUBS

def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def _in_memory_nearest_hub(lon: float, lat: float) -> TransitHubResponse | None:
    if not TRANSIT_HUBS:
        return None
    sorted_hubs = sorted(TRANSIT_HUBS, key=lambda h: _haversine_meters(lat, lon, h["lat"], h["lon"]))
    best = sorted_hubs[0]
    dist_m = _haversine_meters(lat, lon, best["lat"], best["lon"])
    return TransitHubResponse(
        id=1,
        name=best["name"],
        hub_type=best["hub_type"],
        latitude=best["lat"],
        longitude=best["lon"],
        distance_meters=dist_m,
        source="Kanniyakumari District Administration",
        source_url="https://kanniyakumari.nic.in/",
        last_verified=datetime.datetime.utcnow(),
        data_type=DataSourceType.OFFICIAL
    )

def get_nearest_hub(db: Session, lon: float, lat: float) -> TransitHubResponse | None:
    try:
        if db is None:
            return _in_memory_nearest_hub(lon, lat)

        # Use PostGIS ST_Distance with use_spheroid=true for meters
        point_wkt = f"SRID=4326;POINT({lon} {lat})"
        
        query = (
            db.query(
                TransitHub,
                func.ST_Distance(
                    TransitHub.geom, 
                    func.ST_GeomFromEWKT(point_wkt),
                    True # use spheroid for meters calculation
                ).label("distance_meters")
            )
            .order_by(func.ST_Distance(TransitHub.geom, func.ST_GeomFromEWKT(point_wkt), True))
            .limit(1)
        )
        
        result = query.first()
        if not result:
            return _in_memory_nearest_hub(lon, lat)
            
        hub, distance = result
        
        # Extract lat/lon from the geom
        lat_val = db.query(func.ST_Y(hub.geom)).scalar()
        lon_val = db.query(func.ST_X(hub.geom)).scalar()

        return TransitHubResponse(
            id=hub.id,
            name=hub.name,
            hub_type=hub.hub_type,
            latitude=lat_val,
            longitude=lon_val,
            distance_meters=distance,
            source=hub.source,
            source_url=hub.source_url,
            last_verified=hub.last_verified,
            data_type=hub.data_type
        )
    except Exception:
        return _in_memory_nearest_hub(lon, lat)


def get_multimodal_connectivity(
    db: Session,
    origin_lon: float,
    origin_lat: float,
    dest_lon: float,
    dest_lat: float
) -> MultimodalConnectivityResponse:
    first_mile_hub = get_nearest_hub(db, origin_lon, origin_lat)
    last_mile_hub = get_nearest_hub(db, dest_lon, dest_lat)

    return MultimodalConnectivityResponse(
        first_mile_hub=first_mile_hub,
        first_mile_distance_meters=first_mile_hub.distance_meters if first_mile_hub else None,
        last_mile_hub=last_mile_hub,
        last_mile_distance_meters=last_mile_hub.distance_meters if last_mile_hub else None
    )
