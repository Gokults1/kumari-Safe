from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import TransitHub
from app.schemas import MultimodalConnectivityResponse, TransitHubResponse

def get_nearest_hub(db: Session, lon: float, lat: float) -> TransitHubResponse | None:
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
        return None
        
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
