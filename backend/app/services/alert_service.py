"""EcoShield AI — Alert & Emergency Dispatch Service"""
from datetime import datetime
from typing import List, Optional, Dict, Any
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, update
from app.models.models import Alert, AlertLevel, Hazard, SystemEvent
from app.schemas.schemas import AlertCreate, AlertResponse


class AlertService:
    @staticmethod
    async def create_alert(
        db: AsyncSession,
        level: AlertLevel,
        title: str,
        message: str,
        hazard_id: Optional[int] = None,
        location_name: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        risk_score: Optional[float] = None,
        ai_confidence: Optional[float] = None,
        affected_area: Optional[str] = None,
        recommended_action: Optional[str] = None
    ) -> Alert:
        alert_id = f"ALT-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        alert = Alert(
            alert_id=alert_id,
            hazard_id=hazard_id,
            level=level,
            title=title,
            message=message,
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            risk_score=risk_score,
            ai_confidence=ai_confidence,
            affected_area=affected_area or "5 km buffer radius",
            recommended_action=recommended_action,
            created_at=datetime.utcnow(),
            is_active=True
        )
        db.add(alert)

        # Log system event
        event = SystemEvent(
            event_type="alert_created",
            severity=level.value,
            message=f"Alert {alert_id} generated: {title}",
            event_metadata={"alert_id": alert_id, "risk_score": risk_score}
        )
        db.add(event)
        await db.commit()
        await db.refresh(alert)
        return alert

    @staticmethod
    async def get_alerts(
        db: AsyncSession,
        level: Optional[AlertLevel] = None,
        is_active: Optional[bool] = None,
        limit: int = 50
    ) -> List[Alert]:
        stmt = select(Alert).order_by(desc(Alert.created_at)).limit(limit)
        if level:
            stmt = stmt.where(Alert.level == level)
        if is_active is not None:
            stmt = stmt.where(Alert.is_active == is_active)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def acknowledge_alert(
        db: AsyncSession,
        alert_id: str,
        acknowledged_by: str = "Disaster Management Officer"
    ) -> Optional[Alert]:
        stmt = select(Alert).where(Alert.alert_id == alert_id)
        result = await db.execute(stmt)
        alert = result.scalar_one_or_none()
        if not alert:
            return None
        alert.acknowledged_at = datetime.utcnow()
        alert.acknowledged_by = acknowledged_by
        await db.commit()
        await db.refresh(alert)
        return alert

    @staticmethod
    async def resolve_alert(
        db: AsyncSession,
        alert_id: str,
        resolution_notes: Optional[str] = None
    ) -> Optional[Alert]:
        stmt = select(Alert).where(Alert.alert_id == alert_id)
        result = await db.execute(stmt)
        alert = result.scalar_one_or_none()
        if not alert:
            return None
        alert.resolved_at = datetime.utcnow()
        alert.is_active = False
        if resolution_notes:
            alert.message += f"\n[RESOLVED]: {resolution_notes}"
        await db.commit()
        await db.refresh(alert)
        return alert
