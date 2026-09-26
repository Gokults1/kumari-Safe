import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.sql import func
from app.database import Base
from geoalchemy2 import Geometry

class FacilityType(enum.Enum):
    POLICE = "POLICE"
    HOSPITAL = "HOSPITAL"
    FIRE_STATION = "FIRE_STATION"
    DISASTER_CONTROL_ROOM = "DISASTER_CONTROL_ROOM"
    OTHER_EMERGENCY = "OTHER_EMERGENCY"

class DataSourceType(enum.Enum):
    OFFICIAL = "OFFICIAL"
    OPEN_DATA = "OPEN_DATA"
    THIRD_PARTY_API = "THIRD_PARTY_API"
    CALCULATED = "CALCULATED"
    USER_REPORTED = "USER_REPORTED"
    ESTIMATED = "ESTIMATED"

class CameraType(enum.Enum):
    TRAFFIC = "TRAFFIC"
    PUBLIC_SURVEILLANCE = "PUBLIC_SURVEILLANCE"
    GOVERNMENT = "GOVERNMENT"

class HazardType(enum.Enum):
    POTHOLE = "POTHOLE"
    ROAD_DAMAGE = "ROAD_DAMAGE"
    UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION"
    UNPAVED_SURFACE = "UNPAVED_SURFACE"
    WATERLOGGED = "WATERLOGGED"

class HazardStatus(enum.Enum):
    REPORTED = "REPORTED"
    VERIFIED = "VERIFIED"
    RESOLVED = "RESOLVED"

class TransitHubType(enum.Enum):
    BUS_TERMINAL = "BUS_TERMINAL"
    RAILWAY_STATION = "RAILWAY_STATION"

class EmergencyFacility(Base):
    __tablename__ = "emergency_facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    facility_type = Column(Enum(FacilityType), nullable=False, index=True)
    geom = Column(Geometry('POINT', srid=4326, spatial_index=True), nullable=False)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    
    # Provenance fields
    source = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    last_verified = Column(DateTime, nullable=False)
    data_type = Column(Enum(DataSourceType), nullable=False, default=DataSourceType.OFFICIAL)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CCTVCamera(Base):
    __tablename__ = "cctv_cameras"

    id = Column(Integer, primary_key=True, index=True)
    geom = Column(Geometry('POINT', srid=4326, spatial_index=True), nullable=False)
    camera_type = Column(Enum(CameraType), nullable=False, index=True)
    location_name = Column(String, nullable=False)
    
    # Provenance fields
    source = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    last_verified = Column(DateTime, nullable=False)
    data_type = Column(Enum(DataSourceType), nullable=False, default=DataSourceType.OFFICIAL)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class RoadHazard(Base):
    __tablename__ = "road_hazards"

    id = Column(Integer, primary_key=True, index=True)
    geom = Column(Geometry('POINT', srid=4326, spatial_index=True), nullable=False)
    hazard_type = Column(Enum(HazardType), nullable=False, index=True)
    description = Column(String, nullable=False)
    status = Column(Enum(HazardStatus), nullable=False, default=HazardStatus.REPORTED, index=True)
    
    # Provenance fields
    source = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    last_verified = Column(DateTime, nullable=False)
    data_type = Column(Enum(DataSourceType), nullable=False, default=DataSourceType.USER_REPORTED)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class TransitHub(Base):
    __tablename__ = "transit_hubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hub_type = Column(Enum(TransitHubType), nullable=False, index=True)
    geom = Column(Geometry('POINT', srid=4326, spatial_index=True), nullable=False)
    
    # Provenance fields
    source = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    last_verified = Column(DateTime, nullable=False)
    data_type = Column(Enum(DataSourceType), nullable=False, default=DataSourceType.OFFICIAL)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
