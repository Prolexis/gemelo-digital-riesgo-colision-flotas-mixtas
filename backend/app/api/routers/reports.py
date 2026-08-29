from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.models import Equipment, MaintenanceOrder
from app.services.pdf_service import (
    build_maintenance_report_docx,
    build_maintenance_report_pdf,
    build_maintenance_report_xlsx,
)

router = APIRouter(prefix="/reports", tags=["Reportes"])


async def _get_equipment_and_orders(equipment_id: str, db: AsyncSession):
    equipment = await db.get(Equipment, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    result = await db.execute(
        select(MaintenanceOrder)
        .where(MaintenanceOrder.equipment_id == equipment_id)
        .order_by(MaintenanceOrder.created_at.desc())
    )
    return equipment, result.scalars().all()


@router.get("/equipment/{equipment_id}/pdf")
async def report_equipment_pdf(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    equipment, orders = await _get_equipment_and_orders(equipment_id, db)
    pdf_bytes = build_maintenance_report_pdf(equipment, orders)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_{equipment.code}.pdf"'
        },
    )


@router.get("/equipment/{equipment_id}/docx")
async def report_equipment_docx(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    equipment, orders = await _get_equipment_and_orders(equipment_id, db)
    docx_bytes = build_maintenance_report_docx(equipment, orders)
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_{equipment.code}.docx"'
        },
    )


@router.get("/equipment/{equipment_id}/xlsx")
async def report_equipment_xlsx(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    equipment, orders = await _get_equipment_and_orders(equipment_id, db)
    xlsx_bytes = build_maintenance_report_xlsx(equipment, orders)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_{equipment.code}.xlsx"'
        },
    )
