"""EcoShield AI — Environmental Hazard Intelligence Router"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.database.db import get_db
from app.models.models import Hazard, HazardType, RiskLevel
from app.schemas.schemas import HazardResponse

router = APIRouter(prefix="/api/hazards", tags=["Hazards"])


@router.get("", response_model=List[HazardResponse])
async def get_active_hazards(
    hazard_type: Optional[HazardType] = None,
    risk_level: Optional[RiskLevel] = None,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve active environmental hazard zones detected by the AI Risk Engine across India."""
    stmt = select(Hazard).order_by(desc(Hazard.risk_score), desc(Hazard.updated_at))
    if active_only:
        stmt = stmt.where(Hazard.is_active == True)
    if hazard_type:
        stmt = stmt.where(Hazard.hazard_type == hazard_type)
    if risk_level:
        stmt = stmt.where(Hazard.risk_level == risk_level)

    result = await db.execute(stmt)
    hazards = result.scalars().all()
    return list(hazards)


@router.get("/{hazard_id}", response_model=HazardResponse)
async def get_hazard_by_id(hazard_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch detailed AI diagnostics, affected radius, and recommendations for a specific hazard."""
    stmt = select(Hazard).where(Hazard.id == hazard_id)
    result = await db.execute(stmt)
    hazard = result.scalar_one_or_none()
    if not hazard:
        raise HTTPException(status_code=404, detail=f"Hazard #{hazard_id} not found")
    return hazard
