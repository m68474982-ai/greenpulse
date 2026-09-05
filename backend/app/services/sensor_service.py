"""
EcoShield AI — Sensor Service
Orchestrates sensor telemetry ingestion, AI risk evaluation, hazard tracking,
alert triggers, seed generation across India, and WebSocket broadcasts.
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from app.models.models import (
    Sensor, SensorReading, Hazard, Alert, SensorStatus,
    RiskLevel, AlertLevel, HazardType, Location, SystemEvent
)
from app.schemas.schemas import (
    SensorCreate, SensorReadingCreate, SensorReadingBase, AIAnalysisResult
)
from app.ai.risk_engine import AIRiskEngine
from app.services.alert_service import AlertService
from app.api.websocket import ws_manager


# Realistic India Environmental Sensor Deployments
DEFAULT_INDIA_SENSORS = [
    {
        "sensor_id": "SN-AP-TPT-01",
        "name": "Tirupati Valley Hydrological Station",
        "sensor_types": ["water_level", "rainfall", "water_flow", "weather"],
        "latitude": 13.6288,
        "longitude": 79.4192,
        "location_name": "Tirupati Region, Swarnamukhi Basin",
        "state": "Andhra Pradesh",
        "battery": 94.0,
        "signal_strength": 92,
        "firmware_version": "2.1.0-esp32"
    },
    {
        "sensor_id": "SN-AP-VJA-02",
        "name": "Krishna River Barrage Node",
        "sensor_types": ["water_level", "river_level", "water_flow"],
        "latitude": 16.5062,
        "longitude": 80.6480,
        "location_name": "Vijayawada Prakasam Barrage",
        "state": "Andhra Pradesh",
        "battery": 88.0,
        "signal_strength": 85,
        "firmware_version": "2.1.0-esp32"
    },
    {
        "sensor_id": "SN-TS-HYD-01",
        "name": "Hussain Sagar Urban Flood & Air Monitor",
        "sensor_types": ["pm25", "pm10", "no2", "water_level", "weather"],
        "latitude": 17.4239,
        "longitude": 78.4738,
        "location_name": "Hyderabad Lake Front",
        "state": "Telangana",
        "battery": 96.0,
        "signal_strength": 95,
        "firmware_version": "2.2.0-esp32"
    },
    {
        "sensor_id": "SN-KL-WYD-01",
        "name": "Wayanad Highland Landslide & Rain Sentinel",
        "sensor_types": ["rainfall", "soil_moisture", "soil_temperature", "weather"],
        "latitude": 11.6854,
        "longitude": 76.1320,
        "location_name": "Meppadi, Wayanad",
        "state": "Kerala",
        "battery": 91.0,
        "signal_strength": 82,
        "firmware_version": "2.0.4-esp32"
    },
    {
        "sensor_id": "SN-KL-MNR-02",
        "name": "Munnar Western Ghats Flash-Flood Watch",
        "sensor_types": ["rainfall", "water_level", "weather"],
        "latitude": 10.0889,
        "longitude": 77.0595,
        "location_name": "Munnar Catchment, Idukki",
        "state": "Kerala",
        "battery": 85.0,
        "signal_strength": 78,
        "firmware_version": "2.0.4-esp32"
    },
    {
        "sensor_id": "SN-MH-MUM-01",
        "name": "Mithi River Coastal Flood Node",
        "sensor_types": ["water_level", "rainfall", "pm25", "pm10"],
        "latitude": 19.0760,
        "longitude": 72.8777,
        "location_name": "BKC Mithi River, Mumbai",
        "state": "Maharashtra",
        "battery": 98.0,
        "signal_strength": 94,
        "firmware_version": "2.2.0-esp32"
    },
    {
        "sensor_id": "SN-MH-WGH-02",
        "name": "Sahyadri Forest Fire IR Sentinel",
        "sensor_types": ["temperature", "humidity", "smoke", "co", "flame_detected"],
        "latitude": 18.5204,
        "longitude": 73.8567,
        "location_name": "Tamhini Ghat Reserve, Pune",
        "state": "Maharashtra",
        "battery": 89.0,
        "signal_strength": 80,
        "firmware_version": "2.1.0-esp32"
    },
    {
        "sensor_id": "SN-OD-PUR-01",
        "name": "Bay of Bengal Coastal Surge Sentinel",
        "sensor_types": ["wind_speed", "wind_direction", "rainfall", "pressure", "water_level"],
        "latitude": 19.8135,
        "longitude": 85.8312,
        "location_name": "Puri Coastal Zone",
        "state": "Odisha",
        "battery": 93.0,
        "signal_strength": 88,
        "firmware_version": "2.1.0-esp32"
    },
    {
        "sensor_id": "SN-AS-KAZ-01",
        "name": "Kaziranga National Park Flood & Fire Station",
        "sensor_types": ["water_level", "rainfall", "temperature", "smoke"],
        "latitude": 26.5775,
        "longitude": 93.1711,
        "location_name": "Brahmaputra Floodplains, Kaziranga",
        "state": "Assam",
        "battery": 87.0,
        "signal_strength": 76,
        "firmware_version": "2.0.4-esp32"
    },
    {
        "sensor_id": "SN-AS-GHY-02",
        "name": "Guwahati Brahmaputra River Gauge",
        "sensor_types": ["water_level", "river_level", "rainfall"],
        "latitude": 26.1445,
        "longitude": 91.7362,
        "location_name": "Pandu Port, Guwahati",
        "state": "Assam",
        "battery": 95.0,
        "signal_strength": 90,
        "firmware_version": "2.2.0-esp32"
    },
    {
        "sensor_id": "SN-TN-CHN-01",
        "name": "Adyar Estuary Flood & Air Sentinel",
        "sensor_types": ["water_level", "rainfall", "pm25", "pm10", "no2"],
        "latitude": 13.0827,
        "longitude": 80.2707,
        "location_name": "Adyar Basin, Chennai",
        "state": "Tamil Nadu",
        "battery": 92.0,
        "signal_strength": 92,
        "firmware_version": "2.2.0-esp32"
    },
    {
        "sensor_id": "SN-KA-CRG-01",
        "name": "Coorg Catchment Rainfall & Soil Node",
        "sensor_types": ["rainfall", "soil_moisture", "water_level", "weather"],
        "latitude": 12.3375,
        "longitude": 75.8069,
        "location_name": "Madikeri Valley, Coorg",
        "state": "Karnataka",
        "battery": 86.0,
        "signal_strength": 81,
        "firmware_version": "2.0.4-esp32"
    },
    {
        "sensor_id": "SN-KA-BLR-02",
        "name": "Bengaluru Urban Heat & Smog Station",
        "sensor_types": ["pm25", "pm10", "temperature", "humidity", "co2"],
        "latitude": 12.9716,
        "longitude": 77.5946,
        "location_name": "Electronic City, Bengaluru",
        "state": "Karnataka",
        "battery": 97.0,
        "signal_strength": 96,
        "firmware_version": "2.2.0-esp32"
    },
    {
        "sensor_id": "SN-UK-DDN-01",
        "name": "Dehradun Himalayan Wildfire Lookout",
        "sensor_types": ["temperature", "humidity", "smoke", "co", "flame_detected"],
        "latitude": 30.3165,
        "longitude": 78.0322,
        "location_name": "Rajaji Foothills, Dehradun",
        "state": "Uttarakhand",
        "battery": 90.0,
        "signal_strength": 84,
        "firmware_version": "2.1.0-esp32"
    },
    {
        "sensor_id": "SN-DL-NCR-01",
        "name": "Delhi Central Air & Smog Array",
        "sensor_types": ["pm25", "pm10", "co", "no2", "so2", "voc", "temperature", "humidity"],
        "latitude": 28.6139,
        "longitude": 77.2090,
        "location_name": "Anand Vihar / Connaught Place, Delhi",
        "state": "Delhi",
        "battery": 99.0,
        "signal_strength": 98,
        "firmware_version": "2.2.0-esp32"
    }
]


class SensorService:
    @staticmethod
    async def seed_initial_sensors(db: AsyncSession):
        """Seed default sensors across India if database is empty."""
        stmt = select(func.count(Sensor.id))
        result = await db.execute(stmt)
        count = result.scalar()
        if count and count > 0:
            return

        print("🌱 Seeding initial sensors across Indian environmental zones...")
        for data in DEFAULT_INDIA_SENSORS:
            sensor = Sensor(
                sensor_id=data["sensor_id"],
                name=data["name"],
                sensor_types=data["sensor_types"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                location_name=data["location_name"],
                state=data["state"],
                status=SensorStatus.NORMAL,
                battery=data["battery"],
                signal_strength=data["signal_strength"],
                firmware_version=data["firmware_version"],
                is_simulated=True,
                is_active=True,
                created_at=datetime.utcnow() - timedelta(days=7),
                last_seen=datetime.utcnow()
            )
            db.add(sensor)

            # Generate initial baseline readings for the past 2 hours
            now = datetime.utcnow()
            for m in range(20, -1, -2):
                t = now - timedelta(minutes=m)
                reading = SensorReading(
                    sensor_id=data["sensor_id"],
                    timestamp=t,
                    temperature=28.0 + random.uniform(-2, 3),
                    humidity=65.0 + random.uniform(-5, 5),
                    rainfall=0.0 if "rainfall" not in data["sensor_types"] else random.uniform(0, 5),
                    water_level=1.2 + random.uniform(-0.1, 0.2) if "water_level" in data["sensor_types"] else None,
                    water_flow=25.0 + random.uniform(-2, 2) if "water_flow" in data["sensor_types"] else None,
                    pm25=38.0 + random.uniform(-5, 10) if "pm25" in data["sensor_types"] else None,
                    pm10=65.0 + random.uniform(-8, 12) if "pm10" in data["sensor_types"] else None,
                    smoke=45.0 + random.uniform(-5, 5) if "smoke" in data["sensor_types"] else None,
                    co=1.2 + random.uniform(-0.2, 0.2) if "co" in data["sensor_types"] else None,
                    flame_detected=False,
                    wind_speed=12.0 + random.uniform(-2, 4),
                    wind_direction=180.0 + random.uniform(-20, 20),
                    pressure=1012.0 + random.uniform(-1, 1),
                    soil_moisture=42.0 + random.uniform(-3, 3) if "soil_moisture" in data["sensor_types"] else None,
                    soil_temperature=24.0 + random.uniform(-1, 1) if "soil_temperature" in data["sensor_types"] else None
                )
                db.add(reading)

        await db.commit()
        print("✅ Sensor network seed complete.")

    @staticmethod
    async def get_all_sensors(db: AsyncSession) -> List[Dict[str, Any]]:
        stmt = select(Sensor).where(Sensor.is_active == True)
        result = await db.execute(stmt)
        sensors = result.scalars().all()

        output = []
        for s in sensors:
            # Fetch latest reading
            r_stmt = select(SensorReading).where(SensorReading.sensor_id == s.sensor_id).order_by(desc(SensorReading.timestamp)).limit(1)
            r_res = await db.execute(r_stmt)
            latest_r = r_res.scalar_one_or_none()

            latest_dict = None
            if latest_r:
                latest_dict = {
                    "timestamp": latest_r.timestamp.isoformat(),
                    "temperature": latest_r.temperature,
                    "humidity": latest_r.humidity,
                    "rainfall": latest_r.rainfall,
                    "water_level": latest_r.water_level,
                    "water_flow": latest_r.water_flow,
                    "river_level": latest_r.river_level,
                    "smoke": latest_r.smoke,
                    "flame_detected": latest_r.flame_detected,
                    "pm25": latest_r.pm25,
                    "pm10": latest_r.pm10,
                    "co": latest_r.co,
                    "co2": latest_r.co2,
                    "no2": latest_r.no2,
                    "so2": latest_r.so2,
                    "voc": latest_r.voc,
                    "wind_speed": latest_r.wind_speed,
                    "wind_direction": latest_r.wind_direction,
                    "pressure": latest_r.pressure,
                    "soil_moisture": latest_r.soil_moisture,
                    "soil_temperature": latest_r.soil_temperature,
                }

            s_dict = {
                "id": s.id,
                "sensor_id": s.sensor_id,
                "name": s.name,
                "sensor_types": s.sensor_types or [],
                "latitude": s.latitude,
                "longitude": s.longitude,
                "location_name": s.location_name,
                "state": s.state,
                "status": s.status.value,
                "battery": s.battery,
                "signal_strength": s.signal_strength,
                "firmware_version": s.firmware_version,
                "is_simulated": s.is_simulated,
                "is_active": s.is_active,
                "created_at": s.created_at.isoformat(),
                "last_seen": s.last_seen.isoformat(),
                "latest_reading": latest_dict
            }
            output.append(s_dict)
        return output

    @staticmethod
    async def get_sensor_by_id(db: AsyncSession, sensor_id: str) -> Optional[Dict[str, Any]]:
        stmt = select(Sensor).where(Sensor.sensor_id == sensor_id)
        result = await db.execute(stmt)
        s = result.scalar_one_or_none()
        if not s:
            return None

        # Fetch latest 50 readings
        r_stmt = select(SensorReading).where(SensorReading.sensor_id == sensor_id).order_by(desc(SensorReading.timestamp)).limit(50)
        r_res = await db.execute(r_stmt)
        readings = r_res.scalars().all()

        readings_list = []
        for r in readings:
            readings_list.append({
                "id": r.id,
                "timestamp": r.timestamp.isoformat(),
                "temperature": r.temperature,
                "humidity": r.humidity,
                "rainfall": r.rainfall,
                "water_level": r.water_level,
                "water_flow": r.water_flow,
                "pm25": r.pm25,
                "pm10": r.pm10,
                "smoke": r.smoke,
                "co": r.co,
                "wind_speed": r.wind_speed,
                "soil_moisture": r.soil_moisture
            })

        return {
            "id": s.id,
            "sensor_id": s.sensor_id,
            "name": s.name,
            "sensor_types": s.sensor_types or [],
            "latitude": s.latitude,
            "longitude": s.longitude,
            "location_name": s.location_name,
            "state": s.state,
            "status": s.status.value,
            "battery": s.battery,
            "signal_strength": s.signal_strength,
            "firmware_version": s.firmware_version,
            "is_simulated": s.is_simulated,
            "is_active": s.is_active,
            "created_at": s.created_at.isoformat(),
            "last_seen": s.last_seen.isoformat(),
            "recent_readings": readings_list,
            "latest_reading": readings_list[0] if readings_list else None
        }

    @staticmethod
    async def ingest_reading(
        db: AsyncSession,
        reading_data: SensorReadingCreate
    ) -> Dict[str, Any]:
        """
        Main telemetry ingestion pipeline:
        1. Find sensor
        2. Fetch baseline history for anomaly detection
        3. Run AI Risk Engine
        4. Update Sensor status & last seen
        5. Persist reading
        6. Create/Update Hazard record if risk is detected
        7. Trigger Alert if threshold breached
        8. Broadcast via WebSockets
        """
        stmt = select(Sensor).where(Sensor.sensor_id == reading_data.sensor_id)
        result = await db.execute(stmt)
        sensor = result.scalar_one_or_none()

        if not sensor:
            # Auto-register sensor if new
            sensor = Sensor(
                sensor_id=reading_data.sensor_id,
                name=f"Sensor Node {reading_data.sensor_id}",
                sensor_types=["general"],
                latitude=13.0827,
                longitude=80.2707,
                location_name="Field IoT Node",
                state="India",
                status=SensorStatus.NORMAL,
                battery=100.0,
                signal_strength=90,
                is_simulated=True
            )
            db.add(sensor)
            await db.commit()
            await db.refresh(sensor)

        # Baseline lookup
        b_stmt = select(SensorReading).where(SensorReading.sensor_id == sensor.sensor_id).order_by(desc(SensorReading.timestamp)).limit(5)
        b_res = await db.execute(b_stmt)
        past_readings = b_res.scalars().all()
        baseline = {}
        if past_readings:
            wl_vals = [r.water_level for r in past_readings if r.water_level is not None]
            if wl_vals:
                baseline["water_level"] = sum(wl_vals) / len(wl_vals)

        # 3. AI Risk Analysis
        analysis: AIAnalysisResult = AIRiskEngine.analyze_sensor_reading(
            reading=reading_data,
            battery=sensor.battery,
            signal_strength=sensor.signal_strength,
            historical_baseline=baseline
        )

        # 4. Update Sensor
        sensor.status = analysis.sensor_status
        sensor.last_seen = datetime.utcnow()

        # 5. Persist Reading
        new_reading = SensorReading(
            sensor_id=reading_data.sensor_id,
            timestamp=reading_data.timestamp or datetime.utcnow(),
            temperature=reading_data.temperature,
            humidity=reading_data.humidity,
            rainfall=reading_data.rainfall,
            wind_speed=reading_data.wind_speed,
            wind_direction=reading_data.wind_direction,
            pressure=reading_data.pressure,
            water_level=reading_data.water_level,
            water_flow=reading_data.water_flow,
            river_level=reading_data.river_level,
            smoke=reading_data.smoke,
            flame_detected=reading_data.flame_detected,
            pm25=reading_data.pm25,
            pm10=reading_data.pm10,
            co=reading_data.co,
            co2=reading_data.co2,
            no2=reading_data.no2,
            so2=reading_data.so2,
            voc=reading_data.voc,
            soil_moisture=reading_data.soil_moisture,
            soil_temperature=reading_data.soil_temperature
        )
        db.add(new_reading)

        # 6. Hazard record tracking
        created_hazard = None
        if analysis.risk_score >= 30.0:
            # Check existing active hazard for this sensor
            h_stmt = select(Hazard).where(
                Hazard.sensor_id == sensor.sensor_id,
                Hazard.is_active == True
            )
            h_res = await db.execute(h_stmt)
            existing_hazard = h_res.scalar_one_or_none()

            if existing_hazard:
                existing_hazard.risk_score = analysis.risk_score
                existing_hazard.risk_level = analysis.risk_level
                existing_hazard.ai_confidence = analysis.ai_confidence
                existing_hazard.detection_reasons = analysis.detection_reasons
                existing_hazard.recommended_action = analysis.recommended_action
                existing_hazard.updated_at = datetime.utcnow()
                created_hazard = existing_hazard
            else:
                new_hazard = Hazard(
                    hazard_type=analysis.hazard_type,
                    location_name=sensor.location_name,
                    latitude=sensor.latitude,
                    longitude=sensor.longitude,
                    risk_score=analysis.risk_score,
                    risk_level=analysis.risk_level,
                    ai_confidence=analysis.ai_confidence,
                    detected_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                    affected_radius_km=10.0 if analysis.risk_score > 80 else 5.0,
                    detection_reasons=analysis.detection_reasons,
                    recommended_action=analysis.recommended_action,
                    sensor_id=sensor.sensor_id,
                    status="active",
                    is_active=True
                )
                db.add(new_hazard)
                created_hazard = new_hazard

        # 7. Alert trigger (Only for HIGH or CRITICAL risk)
        if analysis.risk_score >= 60.0:
            # Prevent rapid duplicate alert flooding within 5 mins
            recent_time = datetime.utcnow() - timedelta(minutes=5)
            a_stmt = select(Alert).where(
                Alert.location_name == sensor.location_name,
                Alert.created_at >= recent_time
            )
            a_res = await db.execute(a_stmt)
            recent_alert = a_res.scalar_one_or_none()

            if not recent_alert:
                alert_level = AlertLevel.CRITICAL if analysis.risk_score >= 80.0 else AlertLevel.HIGH
                title_map = {
                    HazardType.FLOOD: "🚨 CRITICAL FLOOD RISK IN MONITORED BASIN",
                    HazardType.FOREST_FIRE: "🔥 SEVERE WILDFIRE / THERMAL ANOMALY DETECTED",
                    HazardType.AIR_POLLUTION: "⚠️ TOXIC SMOG / HAZARDOUS AQI THRESHOLD BREACH",
                    HazardType.EXTREME_HEAT: "☀️ EXTREME HEATWAVE EMERGENCY WARNING",
                }
                alert_title = title_map.get(analysis.hazard_type, f"EMERGENCY HAZARD: {analysis.hazard_type.value.upper()}")
                
                alert_msg = f"{', '.join(analysis.detection_reasons)}. AI Risk Score: {analysis.risk_score}/100. AI Confidence: {analysis.ai_confidence}%."

                alert_obj = await AlertService.create_alert(
                    db=db,
                    level=alert_level,
                    title=alert_title,
                    message=alert_msg,
                    hazard_id=created_hazard.id if created_hazard else None,
                    location_name=sensor.location_name,
                    latitude=sensor.latitude,
                    longitude=sensor.longitude,
                    risk_score=analysis.risk_score,
                    ai_confidence=analysis.ai_confidence,
                    affected_area=f"{sensor.location_name} (Radius: 10 km)",
                    recommended_action=analysis.recommended_action
                )
                
                # Broadcast alert immediately
                await ws_manager.broadcast_alert({
                    "id": alert_obj.id,
                    "alert_id": alert_obj.alert_id,
                    "level": alert_obj.level.value,
                    "title": alert_obj.title,
                    "message": alert_obj.message,
                    "location_name": alert_obj.location_name,
                    "risk_score": alert_obj.risk_score,
                    "ai_confidence": alert_obj.ai_confidence,
                    "recommended_action": alert_obj.recommended_action,
                    "created_at": alert_obj.created_at.isoformat()
                })

        await db.commit()

        # 8. Broadcast Sensor Reading via WebSocket
        reading_dict = {
            "timestamp": new_reading.timestamp.isoformat(),
            "temperature": new_reading.temperature,
            "humidity": new_reading.humidity,
            "rainfall": new_reading.rainfall,
            "water_level": new_reading.water_level,
            "water_flow": new_reading.water_flow,
            "pm25": new_reading.pm25,
            "pm10": new_reading.pm10,
            "smoke": new_reading.smoke,
            "co": new_reading.co,
            "wind_speed": new_reading.wind_speed,
            "soil_moisture": new_reading.soil_moisture
        }

        risk_dict = {
            "hazard_type": analysis.hazard_type.value,
            "risk_score": analysis.risk_score,
            "risk_level": analysis.risk_level.value,
            "ai_confidence": analysis.ai_confidence,
            "detection_reasons": analysis.detection_reasons,
            "recommended_action": analysis.recommended_action
        }

        await ws_manager.broadcast_sensor_update(
            sensor_id=sensor.sensor_id,
            reading=reading_dict,
            status=sensor.status.value,
            risk=risk_dict
        )

        return {
            "status": "success",
            "sensor_id": sensor.sensor_id,
            "sensor_status": sensor.status.value,
            "analysis": analysis.dict()
        }
