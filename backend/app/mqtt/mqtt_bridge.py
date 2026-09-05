"""
EcoShield AI — MQTT Telemetry Bridge
Subscribes to MQTT broker (Mosquitto/HiveMQ) for physical ESP32 IoT Nodes
Topic Format: ecoshield/sensors/{sensor_id}/telemetry
"""
import asyncio
import json
import logging
import os
from datetime import datetime
from app.database.db import AsyncSessionLocal
from app.schemas.schemas import SensorReadingCreate
from app.services.sensor_service import SensorService

logger = logging.getLogger("ecoshield.mqtt")

MQTT_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))
MQTT_TOPIC = os.getenv("MQTT_TOPIC_PREFIX", "ecoshield/sensors/+/telemetry")


async def process_mqtt_payload(topic: str, payload_str: str):
    """Parse incoming MQTT payload from ESP32 and ingest into database + AI engine."""
    try:
        data = json.loads(payload_str)
        # Extract sensor_id from topic or payload
        sensor_id = data.get("sensor_id")
        if not sensor_id:
            parts = topic.split("/")
            if len(parts) >= 3:
                sensor_id = parts[2]
            else:
                sensor_id = "ESP32-FIELD-NODE"

        reading = SensorReadingCreate(
            sensor_id=sensor_id,
            temperature=data.get("temperature"),
            humidity=data.get("humidity"),
            rainfall=data.get("rainfall"),
            water_level=data.get("water_level"),
            water_flow=data.get("water_flow"),
            smoke=data.get("smoke"),
            flame_detected=data.get("flame_detected", False),
            pm25=data.get("pm25"),
            pm10=data.get("pm10"),
            co=data.get("co"),
            wind_speed=data.get("wind_speed"),
            soil_moisture=data.get("soil_moisture"),
            timestamp=datetime.utcnow()
        )

        async with AsyncSessionLocal() as session:
            await SensorService.ingest_reading(session, reading)
            logger.info(f"MQTT: Ingested reading for {sensor_id}")

    except Exception as e:
        logger.error(f"MQTT processing error: {e}")


async def start_mqtt_client():
    """Background task to maintain connection to MQTT broker if available."""
    try:
        import aiomqtt
        logger.info(f"Connecting to MQTT broker at {MQTT_HOST}:{MQTT_PORT}...")
        async with aiomqtt.Client(hostname=MQTT_HOST, port=MQTT_PORT) as client:
            await client.subscribe("ecoshield/sensors/#")
            logger.info("MQTT Client subscribed to 'ecoshield/sensors/#'")
            async for message in client.messages:
                topic = str(message.topic)
                payload = message.payload.decode()
                await process_mqtt_payload(topic, payload)
    except ImportError:
        logger.warning("aiomqtt library not installed. MQTT listener in passive mode.")
    except Exception as e:
        logger.info(f"MQTT Broker connection skipped ({e}). System operating in HTTP REST / Simulator mode.")
