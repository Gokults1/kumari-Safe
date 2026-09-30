from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.models import FacilityType, DataSourceType, HazardType, HazardStatus, TransitHubType
from enum import Enum

class RoutePreference(str, Enum):
    FASTEST = "FASTEST"
    SAFEST = "SAFEST"
    BALANCED = "BALANCED"

class HealthCheck(BaseModel):
    status: str
    message: str

class PoliceStaff(BaseModel):
    name: str
    rank: str
    phone: str

class EmergencyFacilityBase(BaseModel):
    name: str
    facility_type: FacilityType
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    phone: Optional[str] = None
    address: Optional[str] = None
    source: str
    source_url: Optional[str] = None
    last_verified: datetime
    data_type: DataSourceType = DataSourceType.OFFICIAL
    staff_directory: Optional[list[PoliceStaff]] = None

class EmergencyFacilityCreate(EmergencyFacilityBase):
    pass

class EmergencyFacilityResponse(EmergencyFacilityBase):
    id: int
    distance_meters: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class NearestFacilitySummary(BaseModel):
    facility: EmergencyFacilityResponse
    distance_km: float

class HelplineContact(BaseModel):
    name: str
    phone: str
    description: Optional[str] = None

class EmergencyAssistResponse(BaseModel):
    closest_facilities: dict[FacilityType, Optional[NearestFacilitySummary]]
    district_helplines: list[HelplineContact]

class RoadHazardSummary(BaseModel):
    id: int
    hazard_type: HazardType
    description: str
    status: HazardStatus
    latitude: float
    longitude: float
    distance_meters: float

    model_config = {
        "from_attributes": True
    }

class RouteSafetySummary(BaseModel):
    corridor_radius_meters: float
    police_stations_count: int
    hospitals_count: int
    fire_stations_count: int
    cctv_count: int = 0
    road_hazards_count: int = 0
    facilities_within_corridor: list[dict]
    hazards: list[dict] = []
    context_description: str

class RouteRequest(BaseModel):
    origin_lat: float = Field(..., ge=-90, le=90)
    origin_lon: float = Field(..., ge=-180, le=180)
    dest_lat: float = Field(..., ge=-90, le=90)
    dest_lon: float = Field(..., ge=-180, le=180)
    profile: str = Field(default="walking", pattern="^(driving|walking|cycling|transit)$")
    include_safety_context: bool = True
    corridor_radius_meters: float = 500.0
    preference: RoutePreference = RoutePreference.BALANCED


class RouteResponse(BaseModel):
    profile: str
    distance_meters: float
    distance_km: float
    duration_seconds: float
    duration_minutes: float
    coordinates: list[list[float]] # [ [lon, lat], ... ]
    safety_context: Optional[RouteSafetySummary] = None

class NavigationStep(BaseModel):
    instruction: str
    maneuver_type: str
    modifier: Optional[str] = None
    street_name: Optional[str] = None
    distance_meters: float
    duration_seconds: float
    location: list[float]

class CandidateRoute(BaseModel):
    route_id: str
    label: str
    distance_meters: float
    distance_km: float
    duration_seconds: float
    duration_minutes: float
    coordinates: list[list[float]]
    steps: list[NavigationStep]
    safety_context: Optional[RouteSafetySummary] = None
    score: float = 0.0

class MultiRouteResponse(BaseModel):
    origin: list[float]
    destination: list[float]
    routes: list[CandidateRoute]
    recommended_route_id: Optional[str] = None
    recommendation_reason: Optional[str] = None

class RouteTrackingRequest(BaseModel):
    current_location: list[float]
    heading_degrees: Optional[float] = None
    speed_mps: Optional[float] = None
    active_route_coordinates: list[list[float]]
    steps: list[NavigationStep]
    current_step_index: int = 0

class RouteTrackingResponse(BaseModel):
    is_off_route: bool
    distance_to_route_meters: float
    current_step_index: int
    current_instruction: str
    distance_to_next_maneuver_meters: float
    has_arrived: bool
    reroute_needed: bool

class HazardReportCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    hazard_type: HazardType
    description: str

class HazardReportResponse(BaseModel):
    id: int
    hazard_type: HazardType
    description: str
    status: HazardStatus
    source: str
    source_url: Optional[str] = None
    last_verified: Optional[datetime] = None
    data_type: DataSourceType
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class TransitHubResponse(BaseModel):
    id: int
    name: str
    hub_type: TransitHubType
    latitude: float
    longitude: float
    distance_meters: float
    source: str
    source_url: Optional[str] = None
    last_verified: datetime
    data_type: DataSourceType

    model_config = {
        "from_attributes": True
    }

class MultimodalConnectivityResponse(BaseModel):
    first_mile_hub: Optional[TransitHubResponse] = None
    first_mile_distance_meters: Optional[float] = None
    last_mile_hub: Optional[TransitHubResponse] = None
    last_mile_distance_meters: Optional[float] = None

class WeatherMetrics(BaseModel):
    temperature_celsius: float
    precipitation_mm: float
    wind_speed_kmh: float
    condition_text: str

class WeatherAdvisoryResponse(BaseModel):
    metrics: WeatherMetrics
    advisory_message: str
    is_adverse: bool
