import pytest
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models import CCTVCamera, CameraType, RoadHazard, HazardType, HazardStatus, DataSourceType
from app.services.safety_service import compute_route_safety_context

def test_safety_context_cctv_and_hazards(db: Session):
    # Insert a CCTV on route
    cctv = CCTVCamera(
        geom="SRID=4326;POINT(77.535 8.085)",
        camera_type=CameraType.TRAFFIC,
        location_name="Route intersection",
        source="Traffic Police",
        last_verified=datetime.now(timezone.utc),
        data_type=DataSourceType.OFFICIAL
    )
    
    # Insert a hazard on route
    hazard_on = RoadHazard(
        geom="SRID=4326;POINT(77.535 8.085)",
        hazard_type=HazardType.POTHOLE,
        description="Large pothole",
        status=HazardStatus.VERIFIED,
        source="User Report",
        last_verified=datetime.now(timezone.utc),
        data_type=DataSourceType.USER_REPORTED
    )
    
    # Insert a hazard far away
    hazard_off = RoadHazard(
        geom="SRID=4326;POINT(77.500 8.000)", # Far away
        hazard_type=HazardType.WATERLOGGED,
        description="Flooded street",
        status=HazardStatus.REPORTED,
        source="User Report",
        last_verified=datetime.now(timezone.utc),
        data_type=DataSourceType.USER_REPORTED
    )
    
    db.add_all([cctv, hazard_on, hazard_off])
    db.commit()

    # Define route close to 77.535, 8.085
    route_coords = [[77.530, 8.080], [77.540, 8.090]]
    
    summary = compute_route_safety_context(db, route_coords, corridor_radius_meters=1000.0)
    
    assert summary["cctv_count"] == 1
    assert summary["road_hazards_count"] == 1
    assert len(summary["hazards"]) == 1
    assert summary["hazards"][0]["description"] == "Large pothole"
    assert summary["hazards"][0]["hazard_type"] == HazardType.POTHOLE
    assert "1 CCTV camera(s)" in summary["context_description"]
    assert "1 active road hazard(s)" in summary["context_description"]
