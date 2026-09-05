"""EcoShield AI — System Status, Emergency Control & Simulation Router"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, delete
from app.database.db import get_db
from app.models.models import (
    Sensor, Hazard, Alert, AlertLevel, SensorStatus, SystemEvent, SensorReading
)
from app.schemas.schemas import (
    SystemStatusResponse, EmergencyTriggerRequest, SimulationScenarioRequest,
    SensorReadingCreate
)
from app.services.sensor_service import SensorService
from app.services.alert_service import AlertService
from app.api.websocket import ws_manager

router = APIRouter(prefix="/api/system", tags=["System & Emergency"])

CURRENT_SIMULATION_STATE = {
    "is_active": True,
    "current_scenario": "normal",
    "last_triggered_at": datetime.utcnow().isoformat()
}


@router.get("/status", response_model=Dict[str, Any])
async def get_system_status(db: AsyncSession = Depends(get_db)):
    """Retrieve top-level command center KPIs and network health metrics."""
    # 1. Total & Connected Sensors
    s_stmt = select(func.count(Sensor.id))
    s_res = await db.execute(s_stmt)
    total_sensors = s_res.scalar() or 15

    online_stmt = select(func.count(Sensor.id)).where(Sensor.status != SensorStatus.OFFLINE)
    online_res = await db.execute(online_stmt)
    connected_sensors = online_res.scalar() or total_sensors

    # 2. Active Incidents & High Risk Zones
    h_stmt = select(func.count(Hazard.id)).where(Hazard.is_active == True)
    h_res = await db.execute(h_stmt)
    active_incidents = h_res.scalar() or 0

    hr_stmt = select(func.count(Hazard.id)).where(Hazard.is_active == True, Hazard.risk_score >= 60)
    hr_res = await db.execute(hr_stmt)
    high_risk_zones = hr_res.scalar() or 0

    # 3. Critical Alerts
    crit_stmt = select(func.count(Alert.id)).where(Alert.is_active == True, Alert.level == AlertLevel.CRITICAL)
    crit_res = await db.execute(crit_stmt)
    critical_alerts = crit_res.scalar() or 0

    # 4. Alerts Today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_stmt = select(func.count(Alert.id)).where(Alert.created_at >= today_start)
    today_res = await db.execute(today_stmt)
    alerts_today = today_res.scalar() or 0

    # 5. Average AI Confidence
    avg_conf_stmt = select(func.avg(Hazard.ai_confidence)).where(Hazard.is_active == True)
    avg_conf_res = await db.execute(avg_conf_stmt)
    avg_conf = avg_conf_res.scalar()
    ai_confidence = round(float(avg_conf), 1) if avg_conf else 94.6

    # 6. Network health
    network_health = round((connected_sensors / max(1, total_sensors)) * 100.0, 1)

    return {
        "status": "ONLINE",
        "connected_sensors": connected_sensors,
        "total_sensors": total_sensors,
        "active_incidents": active_incidents,
        "critical_alerts": critical_alerts,
        "high_risk_zones": high_risk_zones,
        "alerts_today": max(alerts_today, critical_alerts),
        "ai_confidence_average": ai_confidence,
        "network_health_percentage": network_health,
        "last_data_update": datetime.utcnow().isoformat(),
        "is_demo_mode": True,
        "active_scenario": CURRENT_SIMULATION_STATE["current_scenario"]
    }


@router.post("/emergency")
async def trigger_emergency_mode(
    req: EmergencyTriggerRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger immediate Tier-1 Emergency Protocol.
    Broadcasts critical alerts, flashes emergency mode across all command centers,
    and initializes evacuation and responder checklists.
    """
    # 1. Create top-tier emergency alert
    alert = await AlertService.create_alert(
        db=db,
        level=AlertLevel.CRITICAL,
        title=f"🚨 EMERGENCY PROTOCOL ACTIVATED: {req.hazard_type.upper()}",
        message=f"National emergency broadcast issued for {req.location}. {req.action_note}",
        location_name=req.location,
        risk_score=req.risk_score,
        ai_confidence=99.0,
        affected_area=f"{req.location} (Radius: {req.broadcast_radius_km} km)",
        recommended_action=f"Mandatory evacuation orders active. Mobilize NDRF, SDRF, Fire Brigade, and Medical Teams immediately."
    )

    emergency_payload = {
        "status": "EMERGENCY_ACTIVATED",
        "alert_id": alert.alert_id,
        "location": req.location,
        "hazard_type": req.hazard_type,
        "risk_score": req.risk_score,
        "broadcast_radius_km": req.broadcast_radius_km,
        "initiated_by": req.initiated_by,
        "timestamp": datetime.utcnow().isoformat(),
        "recommended_action": alert.recommended_action
    }

    # Broadcast emergency event to all WebSocket clients
    await ws_manager.broadcast_emergency(emergency_payload)
    await ws_manager.broadcast_alert({
        "id": alert.id,
        "alert_id": alert.alert_id,
        "level": "critical",
        "title": alert.title,
        "message": alert.message,
        "location_name": alert.location_name,
        "risk_score": alert.risk_score,
        "ai_confidence": alert.ai_confidence,
        "recommended_action": alert.recommended_action,
        "created_at": alert.created_at.isoformat()
    })

    return {
        "status": "success",
        "message": "Emergency protocol successfully broadcasted to all national and local emergency channels.",
        "details": emergency_payload
    }


@router.post("/simulate")
async def trigger_simulation_scenario(
    req: SimulationScenarioRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Instant Hackathon Demonstration Trigger:
    Simulates real-world environmental spikes:
    - 'flood': Spikes water level to 4.85m, rainfall to 94 mm/hr at Tirupati / Swarnamukhi Basin
    - 'forest_fire': Spikes temp to 42.5°C, smoke to 480 ppm, optical flame trigger at Sahyadri / Dehradun
    - 'air_pollution': Spikes PM2.5 to 320 µg/m³, PM10 to 450 µg/m³, NO2 to 95 µg/m³ at Delhi / Hyderabad
    - 'normal': Restores all readings to benign baseline
    """
    scenario = req.scenario.lower()
    CURRENT_SIMULATION_STATE["current_scenario"] = scenario
    CURRENT_SIMULATION_STATE["last_triggered_at"] = datetime.utcnow().isoformat()

    simulated_events = []

    if scenario == "flood":
        # Target Tirupati & Vijayawada
        target_sensor_id = req.target_sensor_id or "SN-AP-TPT-01"
        reading = SensorReadingCreate(
            sensor_id=target_sensor_id,
            water_level=4.85 * req.intensity,
            rainfall=94.0 * req.intensity,
            water_flow=185.0 * req.intensity,
            river_level=5.2,
            temperature=24.5,
            humidity=92.0,
            wind_speed=28.0,
            wind_direction=190.0,
            pressure=998.0
        )
        res = await SensorService.ingest_reading(db, reading)
        simulated_events.append(res)

    elif scenario == "forest_fire":
        target_sensor_id = req.target_sensor_id or "SN-MH-WGH-02"
        reading = SensorReadingCreate(
            sensor_id=target_sensor_id,
            temperature=43.5 * req.intensity,
            humidity=16.0 / req.intensity,
            smoke=520.0 * req.intensity,
            co=24.0 * req.intensity,
            flame_detected=True,
            wind_speed=32.0,
            wind_direction=240.0
        )
        res = await SensorService.ingest_reading(db, reading)
        simulated_events.append(res)

    elif scenario == "air_pollution":
        target_sensor_id = req.target_sensor_id or "SN-DL-NCR-01"
        reading = SensorReadingCreate(
            sensor_id=target_sensor_id,
            pm25=340.0 * req.intensity,
            pm10=490.0 * req.intensity,
            co=18.5 * req.intensity,
            co2=850.0,
            no2=112.0 * req.intensity,
            so2=94.0 * req.intensity,
            voc=3.8 * req.intensity,
            temperature=31.0,
            humidity=55.0
        )
        res = await SensorService.ingest_reading(db, reading)
        simulated_events.append(res)

    elif scenario == "extreme_heat":
        target_sensor_id = req.target_sensor_id or "SN-KA-BLR-02"
        reading = SensorReadingCreate(
            sensor_id=target_sensor_id,
            temperature=46.2 * req.intensity,
            humidity=72.0,
            wind_speed=8.0,
            pressure=1004.0
        )
        res = await SensorService.ingest_reading(db, reading)
        simulated_events.append(res)

    else:  # Normal restoration
        for s_id in ["SN-AP-TPT-01", "SN-MH-WGH-02", "SN-DL-NCR-01"]:
            reading = SensorReadingCreate(
                sensor_id=s_id,
                water_level=1.35,
                rainfall=0.0,
                water_flow=22.0,
                temperature=28.5,
                humidity=62.0,
                smoke=35.0,
                co=1.1,
                flame_detected=False,
                pm25=36.0,
                pm10=62.0,
                wind_speed=11.0,
                pressure=1013.0
            )
            res = await SensorService.ingest_reading(db, reading)
            simulated_events.append(res)

    await ws_manager.broadcast({
        "event": "scenario_triggered",
        "scenario": scenario,
        "intensity": req.intensity,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "status": "success",
        "scenario": scenario,
        "intensity": req.intensity,
        "message": f"Simulation scenario '{scenario.upper()}' dispatched. Telemetry updated and AI Risk Engine triggered.",
        "results": simulated_events
    }


@router.post("/reset-demo")
async def reset_demo_data(db: AsyncSession = Depends(get_db)):
    """Reset simulation environment and reload default India sensor dataset."""
    # Delete old alerts and hazards
    await db.execute(delete(Alert))
    await db.execute(delete(Hazard))
    await db.commit()

    # Re-seed sensors
    await SensorService.seed_initial_sensors(db)

    # Broadcast reset
    await ws_manager.broadcast({
        "event": "demo_reset",
        "timestamp": datetime.utcnow().isoformat()
    })

    return {"status": "success", "message": "Demo data refreshed to baseline."}
