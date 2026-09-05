"""EcoShield AI — Pydantic Schemas for API Validation & Serialization"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.models import SensorStatus, RiskLevel, AlertLevel, UserRole, HazardType


# ---------------- USER & AUTH SCHEMAS ----------------
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.VIEWER


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


# ---------------- SENSOR SCHEMAS ----------------
class SensorBase(BaseModel):
    sensor_id: str
    name: str
    sensor_types: List[str]
    latitude: float
    longitude: float
    location_name: str
    state: str
    battery: float = 100.0
    signal_strength: int = 90
    firmware_version: str = "1.0.0"
    is_simulated: bool = True


class SensorCreate(SensorBase):
    pass


class SensorUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[SensorStatus] = None
    battery: Optional[float] = None
    signal_strength: Optional[int] = None
    is_active: Optional[bool] = None


class SensorReadingBase(BaseModel):
    sensor_id: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    pressure: Optional[float] = None
    water_level: Optional[float] = None
    water_flow: Optional[float] = None
    river_level: Optional[float] = None
    smoke: Optional[float] = None
    flame_detected: Optional[bool] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co: Optional[float] = None
    co2: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    voc: Optional[float] = None
    soil_moisture: Optional[float] = None
    soil_temperature: Optional[float] = None


class SensorReadingCreate(SensorReadingBase):
    timestamp: Optional[datetime] = None


class SensorReadingResponse(SensorReadingBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class SensorResponse(SensorBase):
    id: int
    status: SensorStatus
    is_active: bool
    created_at: datetime
    last_seen: datetime
    latest_reading: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ---------------- HAZARD SCHEMAS ----------------
class HazardBase(BaseModel):
    hazard_type: HazardType
    location_name: str
    latitude: float
    longitude: float
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    ai_confidence: float = Field(..., ge=0, le=100)
    affected_radius_km: float = 5.0
    detection_reasons: List[str] = []
    recommended_action: str
    sensor_id: Optional[str] = None


class HazardCreate(HazardBase):
    pass


class HazardResponse(HazardBase):
    id: int
    detected_at: datetime
    updated_at: datetime
    status: str
    is_active: bool

    class Config:
        from_attributes = True


# ---------------- ALERT SCHEMAS ----------------
class AlertBase(BaseModel):
    level: AlertLevel
    title: str
    message: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    risk_score: Optional[float] = None
    ai_confidence: Optional[float] = None
    affected_area: Optional[str] = None
    recommended_action: Optional[str] = None


class AlertCreate(AlertBase):
    hazard_id: Optional[int] = None


class AlertResponse(AlertBase):
    id: int
    alert_id: str
    hazard_id: Optional[int] = None
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class AlertAcknowledgeRequest(BaseModel):
    acknowledged_by: str = "Control Room Officer"


class AlertResolveRequest(BaseModel):
    resolution_notes: Optional[str] = None


# ---------------- AI & PREDICTION SCHEMAS ----------------
class AIInsightItem(BaseModel):
    id: str
    title: str
    description: str
    hazard_type: str
    location: str
    risk_score: float
    risk_level: str
    ai_confidence: float
    trend: str  # "increasing", "stable", "decreasing"
    prediction_timeframe: str
    recommended_actions: List[str]
    detected_anomalies: List[str]
    timestamp: datetime


class AIAnalysisResult(BaseModel):
    hazard_type: HazardType
    risk_score: float
    risk_level: RiskLevel
    ai_confidence: float
    detection_reasons: List[str]
    recommended_action: str
    anomaly_detected: bool
    sensor_status: SensorStatus


# ---------------- ANALYTICS SCHEMAS ----------------
class MetricPoint(BaseModel):
    timestamp: str
    value: float


class AnalyticsSeries(BaseModel):
    metric_name: str
    unit: str
    data: List[MetricPoint]


class SensorHealthMetric(BaseModel):
    sensor_id: str
    name: str
    location: str
    battery: float
    signal: int
    status: str
    uptime_percentage: float


class HazardFrequencyItem(BaseModel):
    hazard_type: str
    count: int
    critical_count: int


class AnalyticsSummary(BaseModel):
    water_level_trend: List[Dict[str, Any]]
    temperature_trend: List[Dict[str, Any]]
    pm25_trend: List[Dict[str, Any]]
    rainfall_trend: List[Dict[str, Any]]
    hazard_frequency: List[HazardFrequencyItem]
    alerts_by_severity: Dict[str, int]
    risk_distribution: Dict[str, int]
    sensor_health_list: List[SensorHealthMetric]


# ---------------- SYSTEM STATUS SCHEMAS ----------------
class SystemStatusResponse(BaseModel):
    status: str = "ONLINE"
    connected_sensors: int
    total_sensors: int
    active_incidents: int
    critical_alerts: int
    high_risk_zones: int
    alerts_today: int
    ai_confidence_average: float
    network_health_percentage: float
    last_data_update: datetime
    is_demo_mode: bool
    active_scenario: Optional[str] = None


class EmergencyTriggerRequest(BaseModel):
    location: str
    hazard_type: str
    risk_score: float = 95.0
    broadcast_radius_km: float = 25.0
    action_note: str = "Mass evacuation and emergency agency mobilization triggered."
    initiated_by: str = "National Disaster Management Authority (NDMA)"


class SimulationScenarioRequest(BaseModel):
    scenario: str  # "flood", "forest_fire", "air_pollution", "extreme_heat", "normal"
    target_sensor_id: Optional[str] = None
    intensity: float = 1.0  # 0.5 to 2.0
