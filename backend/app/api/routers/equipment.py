from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_roles
from app.db.database import get_db
from app.models.models import Equipment, RoleEnum
from app.schemas.schemas import EquipmentCreate, EquipmentOut, EquipmentUpdate

router = APIRouter(prefix="/equipment", tags=["Equipos"])


@router.get("", response_model=list[EquipmentOut])
async def list_equipment(
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    result = await db.execute(select(Equipment).order_by(Equipment.created_at.desc()))
    return result.scalars().all()


@router.get("/{equipment_id}", response_model=EquipmentOut)
async def get_equipment(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    equipment = await db.get(Equipment, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipment


@router.post("", response_model=EquipmentOut, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    payload: EquipmentCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_roles(RoleEnum.ADMIN, RoleEnum.SUPERVISOR)),
):
    existing = await db.execute(select(Equipment).where(Equipment.code == payload.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El código de equipo ya existe")

    equipment = Equipment(**payload.model_dump())
    db.add(equipment)
    await db.commit()
    await db.refresh(equipment)
    return equipment


@router.patch("/{equipment_id}", response_model=EquipmentOut)
async def update_equipment(
    equipment_id: str,
    payload: EquipmentUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_roles(RoleEnum.ADMIN, RoleEnum.SUPERVISOR, RoleEnum.TECNICO)),
):
    equipment = await db.get(Equipment, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(equipment, field, value)

    await db.commit()
    await db.refresh(equipment)
    return equipment


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(require_roles(RoleEnum.ADMIN)),
):
    equipment = await db.get(Equipment, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    await db.delete(equipment)
    await db.commit()
