from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_roles
from app.db.database import get_db
from app.models.models import Equipment, MaintenanceOrder, RoleEnum
from app.schemas.schemas import MaintenanceOrderCreate, MaintenanceOrderOut

router = APIRouter(prefix="/maintenance-orders", tags=["Órdenes de Mantenimiento"])


@router.get("", response_model=list[MaintenanceOrderOut])
async def list_orders(
    equipment_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    query = select(MaintenanceOrder).order_by(MaintenanceOrder.created_at.desc())
    if equipment_id:
        query = query.where(MaintenanceOrder.equipment_id == equipment_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=MaintenanceOrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: MaintenanceOrderCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_roles(RoleEnum.ADMIN, RoleEnum.SUPERVISOR, RoleEnum.TECNICO)),
):
    equipment = await db.get(Equipment, payload.equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    order = MaintenanceOrder(**payload.model_dump())
    db.add(order)

    equipment.last_intervention_at = datetime.now(timezone.utc)
    db.add(equipment)

    await db.commit()
    await db.refresh(order)
    return order


@router.patch("/{order_id}/complete", response_model=MaintenanceOrderOut)
async def complete_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_roles(RoleEnum.ADMIN, RoleEnum.SUPERVISOR, RoleEnum.TECNICO)),
):
    order = await db.get(MaintenanceOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    order.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(order)
    return order
