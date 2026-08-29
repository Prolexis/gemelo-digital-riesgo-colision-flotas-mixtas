from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.models import MaintenanceOrder
from app.services.gemini_service import (
    GeminiServiceError,
    generate_maintenance_insight,
    generate_maintenance_insight_structured,
)

router = APIRouter(prefix="/ai", tags=["Inteligencia Artificial"])


async def _get_history(equipment_id: str, db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(MaintenanceOrder).where(MaintenanceOrder.equipment_id == equipment_id)
    )
    orders = result.scalars().all()
    return [
        {
            "type": o.maintenance_type.value,
            "description": o.description,
            "labor_hours": o.labor_hours,
            "date": o.created_at,
        }
        for o in orders
    ]


@router.post("/maintenance-insight")
async def maintenance_insight(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    history = await _get_history(equipment_id, db)
    try:
        text = generate_maintenance_insight(history)
    except GeminiServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return {"insight": text}


@router.post("/maintenance-insight/structured")
async def maintenance_insight_structured(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    history = await _get_history(equipment_id, db)
    try:
        data = generate_maintenance_insight_structured(history)
    except GeminiServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return data
