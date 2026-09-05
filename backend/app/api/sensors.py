"""EcoShield AI — Sensor Endpoints & Telemetry Ingestion"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.db import get_db
from app.models.models import Sensor, SensorStatus
from app.schemas.schemas import SensorCreate, SensorReadingCreate
from app.services.sensor_service import SensorService

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])


@router.get("", response_model=List[Dict[str, Any]])
async def get_all_sensors(db: AsyncSession = Depends(get_db)):
    """Retrieve all active sensors across the network with their latest readings and status."""
    return await SensorService.get_all_sensors(db)


@router.get("/{sensor_id}", response_model=Dict[str, Any])
async def get_sensor_details(sensor_id: str, db: AsyncSession = Depends(get_db)):
    """Get detailed telemetry, health, and recent historical readings for a specific sensor node."""
    sensor = await SensorService.get_sensor_by_id(db, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail=f"Sensor node '{sensor_id}' not found")
    return sensor


@router.post("/data")
async def ingest_sensor_telemetry(reading: SensorReadingCreate, db: AsyncSession = Depends(get_db)):
    """
    Ingest environmental sensor telemetry.
    Executes AI Risk Engine analysis, detects anomalies, updates sensor status,
    triggers alerts if thresholds are exceeded, and broadcasts via WebSockets.
    """
    result = await SensorService.ingest_reading(db, reading)
    return result


@router.post("", status_code=status.HTTP_201_CREATED)
async def register_sensor(sensor_in: SensorCreate, db: AsyncSession = Depends(get_db)):
    """Register a new physical or virtual IoT sensor node."""
    stmt = select(Sensor).where(Sensor.sensor_id == sensor_in.sensor_id)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Sensor ID '{sensor_in.sensor_id}' already registered")

    new_sensor = Sensor(
        sensor_id=sensor_in.sensor_id,
        name=sensor_in.name,
        sensor_types=sensor_in.sensor_types,
        latitude=sensor_in.latitude,
        longitude=sensor_in.longitude,
        location_name=sensor_in.location_name,
        state=sensor_in.state,
        status=SensorStatus.NORMAL,
        battery=sensor_in.battery,
        signal_strength=sensor_in.signal_strength,
        firmware_version=sensor_in.firmware_version,
        is_simulated=sensor_in.is_simulated
    )
    db.add(new_sensor)
    await db.commit()
    await db.refresh(new_sensor)
    return {"message": "Sensor registered successfully", "sensor_id": new_sensor.sensor_id}
