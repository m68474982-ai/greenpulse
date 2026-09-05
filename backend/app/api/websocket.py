"""EcoShield AI — WebSocket Real-Time Event Broadcaster"""
import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("ecoshield.websocket")


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast JSON message to all active WebSocket clients."""
        if not self.active_connections:
            return

        # Prepare JSON payload
        payload = json.dumps(message, default=str)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message to client: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            if dead in self.active_connections:
                self.active_connections.remove(dead)

    async def broadcast_sensor_update(self, sensor_id: str, reading: Dict[str, Any], status: str, risk: Dict[str, Any]):
        await self.broadcast({
            "event": "sensor_update",
            "sensor_id": sensor_id,
            "reading": reading,
            "status": status,
            "risk": risk
        })

    async def broadcast_hazard_detected(self, hazard: Dict[str, Any]):
        await self.broadcast({
            "event": "hazard_detected",
            "hazard": hazard
        })

    async def broadcast_alert(self, alert: Dict[str, Any]):
        await self.broadcast({
            "event": "new_alert",
            "alert": alert
        })

    async def broadcast_emergency(self, emergency_info: Dict[str, Any]):
        await self.broadcast({
            "event": "emergency_triggered",
            "data": emergency_info
        })


ws_manager = ConnectionManager()
