"""EcoShield AI — Alert Management & Emergency Protocol Router"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from app.models.models import AlertLevel
from app.schemas.schemas import (
    AlertCreate, AlertResponse, AlertAcknowledgeRequest, AlertResolveRequest
)
from app.services.alert_service import AlertService
from app.api.websocket import ws_manager

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertResponse])
async def get_alerts(
    level: Optional[AlertLevel] = None,
    is_active: Optional[bool] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve environmental early-warning alerts with optional severity and status filters."""
    return await AlertService.get_alerts(db, level=level, is_active=is_active, limit=limit)


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_custom_alert(alert_in: AlertCreate, db: AsyncSession = Depends(get_db)):
    """Dispatch an official authority alert across command centers and field channels."""
    alert = await AlertService.create_alert(
        db=db,
        level=alert_in.level,
        title=alert_in.title,
        message=alert_in.message,
        hazard_id=alert_in.hazard_id,
        location_name=alert_in.location_name,
        latitude=alert_in.latitude,
        longitude=alert_in.longitude,
        risk_score=alert_in.risk_score,
        ai_confidence=alert_in.ai_confidence,
        affected_area=alert_in.affected_area,
        recommended_action=alert_in.recommended_action
    )
    
    # Broadcast via WebSocket
    await ws_manager.broadcast_alert({
        "id": alert.id,
        "alert_id": alert.alert_id,
        "level": alert.level.value,
        "title": alert.title,
        "message": alert.message,
        "location_name": alert.location_name,
        "risk_score": alert.risk_score,
        "ai_confidence": alert.ai_confidence,
        "recommended_action": alert.recommended_action,
        "created_at": alert.created_at.isoformat()
    })
    return alert


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: str,
    req: AlertAcknowledgeRequest = AlertAcknowledgeRequest(),
    db: AsyncSession = Depends(get_db)
):
    """Mark an active alert as acknowledged by the disaster management duty officer."""
    alert = await AlertService.acknowledge_alert(db, alert_id, acknowledged_by=req.acknowledged_by)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    
    await ws_manager.broadcast({
        "event": "alert_acknowledged",
        "alert_id": alert_id,
        "acknowledged_by": req.acknowledged_by,
        "acknowledged_at": alert.acknowledged_at.isoformat()
    })
    return alert


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: str,
    req: AlertResolveRequest = AlertResolveRequest(),
    db: AsyncSession = Depends(get_db)
):
    """Mark an alert incident as resolved once environmental conditions normalize."""
    alert = await AlertService.resolve_alert(db, alert_id, resolution_notes=req.resolution_notes)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    
    await ws_manager.broadcast({
        "event": "alert_resolved",
        "alert_id": alert_id,
        "resolved_at": alert.resolved_at.isoformat()
    })
    return alert
