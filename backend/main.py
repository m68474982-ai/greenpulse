"""
EcoShield AI — Environmental Intelligence Command Center
Main FastAPI Application Entry Point
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import create_tables, AsyncSessionLocal
from app.services.sensor_service import SensorService
from app.api.auth import router as auth_router, seed_default_users
from app.api.sensors import router as sensors_router
from app.api.hazards import router as hazards_router
from app.api.alerts import router as alerts_router
from app.api.analytics import router as analytics_router
from app.api.ai import router as ai_router
from app.api.system import router as system_router
from app.api.websocket import ws_manager
from app.mqtt.mqtt_bridge import start_mqtt_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ecoshield.main")

# Background simulation task handle
simulation_task = None
mqtt_task = None


async def run_background_simulation():
    """
    Background simulation worker:
    Periodically injects gentle stochastic micro-fluctuations into all sensors
    so that real-time charts and indicators actively pulse.
    """
    import random
    from app.schemas.schemas import SensorReadingCreate

    logger.info("⚡ Background Sensor Simulator started.")
    try:
        while True:
            await asyncio.sleep(4)  # Pulse every 4 seconds
            async with AsyncSessionLocal() as db:
                sensors = await SensorService.get_all_sensors(db)
                if sensors:
                    # Pick 2 random sensors each cycle to update
                    selected = random.sample(sensors, min(3, len(sensors)))
                    for s in selected:
                        latest = s.get("latest_reading") or {}
                        types = s.get("sensor_types", [])

                        # Calculate slight stochastic drift
                        cur_temp = latest.get("temperature", 28.5)
                        cur_pm25 = latest.get("pm25", 35.0)
                        cur_wl = latest.get("water_level", 1.4)
                        cur_rain = latest.get("rainfall", 0.0)
                        cur_smoke = latest.get("smoke", 40.0)

                        reading = SensorReadingCreate(
                            sensor_id=s["sensor_id"],
                            temperature=round(cur_temp + random.uniform(-0.3, 0.3), 1) if "temperature" in types or "weather" in types else None,
                            humidity=round(65.0 + random.uniform(-2, 2), 1) if "weather" in types else None,
                            water_level=round(max(0.5, cur_wl + random.uniform(-0.02, 0.03)), 2) if "water_level" in types else None,
                            rainfall=round(max(0.0, cur_rain + random.uniform(-0.5, 0.5)), 1) if "rainfall" in types else None,
                            pm25=round(max(10.0, cur_pm25 + random.uniform(-1.5, 1.5)), 1) if "pm25" in types else None,
                            pm10=round(max(20.0, cur_pm25 * 1.8), 1) if "pm10" in types else None,
                            smoke=round(max(10.0, cur_smoke + random.uniform(-2, 2)), 1) if "smoke" in types else None,
                            wind_speed=round(12.0 + random.uniform(-1, 1), 1)
                        )
                        await SensorService.ingest_reading(db, reading)
    except asyncio.CancelledError:
        logger.info("Background Sensor Simulator stopped.")
    except Exception as e:
        logger.error(f"Simulator error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global simulation_task, mqtt_task
    logger.info("🚀 Starting EcoShield AI Command Center Backend...")

    # 1. Initialize database tables
    await create_tables()

    # 2. Seed initial data
    async with AsyncSessionLocal() as session:
        await seed_default_users(session)
        await SensorService.seed_initial_sensors(session)

    # 3. Start background live pulse simulator
    simulation_task = asyncio.create_task(run_background_simulation())

    # 4. Start MQTT listener in background (tolerant if broker absent)
    mqtt_task = asyncio.create_task(start_mqtt_client())

    yield

    # Clean shutdown
    if simulation_task:
        simulation_task.cancel()
    if mqtt_task:
        mqtt_task.cancel()
    logger.info("🛑 EcoShield AI Backend stopped.")


app = FastAPI(
    title="EcoShield AI — Environmental Intelligence API",
    description="Full-stack environmental hazard early-warning network and AI risk command center for India.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(sensors_router)
app.include_router(hazards_router)
app.include_router(alerts_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(system_router)


# Real-Time WebSocket Endpoint
@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and receive any client ping/commands
            data = await websocket.receive_text()
            # Echo heartbeat
            await websocket.send_text('{"event": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        ws_manager.disconnect(websocket)


@app.get("/")
async def root():
    return {
        "platform": "EcoShield AI",
        "tagline": "Intelligent Environmental Early-Warning Network",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "websocket_endpoint": "/ws/live"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
