"""EcoShield AI — SQLAlchemy ORM Models"""
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime,
    ForeignKey, Text, Enum as SAEnum, JSON
)
from sqlalchemy.orm import relationship
import enum
from app.database.db import Base


class SensorStatus(str, enum.Enum):
    NORMAL = "normal"
    WARNING = "warning"
    HIGH_RISK = "high_risk"
    CRITICAL = "critical"
    OFFLINE = "offline"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class AlertLevel(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    HIGH = "high"
    CRITICAL = "critical"


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    AUTHORITY = "authority"
    OPERATOR = "operator"
    VIEWER = "viewer"


class HazardType(str, enum.Enum):
    FLOOD = "flood"
    FOREST_FIRE = "forest_fire"
    AIR_POLLUTION = "air_pollution"
    EXTREME_HEAT = "extreme_heat"
    DROUGHT = "drought"
    CYCLONE = "cyclone"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.VIEWER)
    full_name = Column(String(128))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    state = Column(String(64))
    district = Column(String(64))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, nullable=True)
    risk_zone = Column(String(32), nullable=True)
    sensors = relationship("Sensor", back_populates="location_ref")


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(128))
    sensor_types = Column(JSON)  # list of sensor type strings
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(128))
    state = Column(String(64))
    status = Column(SAEnum(SensorStatus), default=SensorStatus.NORMAL)
    battery = Column(Float, default=100.0)
    signal_strength = Column(Integer, default=90)
    firmware_version = Column(String(32), default="1.0.0")
    is_simulated = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    location_ref = relationship("Location", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(32), ForeignKey("sensors.sensor_id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Weather
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)

    # Flood
    water_level = Column(Float, nullable=True)
    water_flow = Column(Float, nullable=True)
    river_level = Column(Float, nullable=True)

    # Fire
    smoke = Column(Float, nullable=True)
    flame_detected = Column(Boolean, nullable=True)

    # Air quality
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    co2 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    voc = Column(Float, nullable=True)

    # Soil
    soil_moisture = Column(Float, nullable=True)
    soil_temperature = Column(Float, nullable=True)

    sensor = relationship("Sensor", back_populates="readings")


class Hazard(Base):
    __tablename__ = "hazards"

    id = Column(Integer, primary_key=True, index=True)
    hazard_type = Column(SAEnum(HazardType), nullable=False)
    location_name = Column(String(128))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(SAEnum(RiskLevel), nullable=False)
    ai_confidence = Column(Float, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
    affected_radius_km = Column(Float, default=5.0)
    detection_reasons = Column(JSON)
    recommended_action = Column(Text)
    sensor_id = Column(String(32), nullable=True)
    status = Column(String(32), default="active")
    is_active = Column(Boolean, default=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(64), unique=True, index=True)
    hazard_id = Column(Integer, ForeignKey("hazards.id"), nullable=True)
    level = Column(SAEnum(AlertLevel), nullable=False)
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    location_name = Column(String(128))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    risk_score = Column(Float, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    affected_area = Column(String(256))
    recommended_action = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True)
    hazard = relationship("Hazard")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(32), nullable=False)
    hazard_type = Column(String(32), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(16), nullable=False)
    ai_confidence = Column(Float, nullable=False)
    prediction_time = Column(DateTime, default=datetime.utcnow, index=True)
    features_used = Column(JSON)
    detection_reasons = Column(JSON)


class SystemEvent(Base):
    __tablename__ = "system_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(64), nullable=False)
    severity = Column(String(16), default="info")
    message = Column(Text)
    sensor_id = Column(String(32), nullable=True)
    event_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
