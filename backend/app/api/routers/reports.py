from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.models import Equipment, MaintenanceOrder, RiskAlert
from app.services.pdf_service import (
    build_maintenance_report_docx,
    build_maintenance_report_pdf,
    build_maintenance_report_xlsx,
    build_risk_incidents_report_docx,
    build_risk_incidents_report_pdf,
    build_risk_incidents_report_xlsx,
)

router = APIRouter(prefix="/reports", tags=["Reportes Multiformato"])


@router.get("/risk-twin/pdf")
async def report_risk_twin_pdf(
    anonymize: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Genera un reporte PDF con gráficos de cuasi-colisiones, Lead Time y desglose SHAP."""
    try:
        res = await db.execute(select(RiskAlert).order_by(RiskAlert.created_at.desc()).limit(50))
        alerts = res.scalars().all()
    except Exception as e:
        print(f"Aviso DB en reporte PDF: {e}")
        alerts = []
    
    pdf_bytes = build_risk_incidents_report_pdf(alerts, anonymize_operators=anonymize)
    filename = f"reporte_cuasi_colisiones_{'anonimizado' if anonymize else 'completo'}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        },
    )


@router.get("/risk-twin/xlsx")
async def report_risk_twin_xlsx(
    anonymize: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Genera una planilla Excel (.xlsx) con telemetría de fatiga, alertas y factores SHAP."""
    try:
        res = await db.execute(select(RiskAlert).order_by(RiskAlert.created_at.desc()).limit(50))
        alerts = res.scalars().all()
    except Exception as e:
        print(f"Aviso DB en reporte XLSX: {e}")
        alerts = []
    
    xlsx_bytes = build_risk_incidents_report_xlsx(alerts, anonymize_operators=anonymize)
    filename = f"reporte_cuasi_colisiones_{'anonimizado' if anonymize else 'completo'}.xlsx"
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        },
    )


@router.get("/risk-twin/docx")
async def report_risk_twin_docx(
    anonymize: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Genera un documento Word (.docx) editable para el comité de investigación de incidentes."""
    try:
        res = await db.execute(select(RiskAlert).order_by(RiskAlert.created_at.desc()).limit(50))
        alerts = res.scalars().all()
    except Exception as e:
        print(f"Aviso DB en reporte DOCX: {e}")
        alerts = []
    
    docx_bytes = build_risk_incidents_report_docx(alerts, anonymize_operators=anonymize)
    filename = f"reporte_cuasi_colisiones_{'anonimizado' if anonymize else 'completo'}.docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        },
    )


@router.get("/equipment/{equipment_id}/pdf")
async def report_equipment_pdf(
    equipment_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        equipment = await db.get(Equipment, equipment_id)
    except Exception:
        equipment = None

    if not equipment:
        equipment = Equipment(code=equipment_id, name=f"Equipo {equipment_id}", model="CAT 797F")
    
    orders = []
    pdf_bytes = build_maintenance_report_pdf(equipment, orders)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_{equipment.code}.pdf"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        },
    )


@router.get("/equipment/{equipment_id}/xlsx")
async def report_equipment_xlsx(
    equipment_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        equipment = await db.get(Equipment, equipment_id)
    except Exception:
        equipment = None

    if not equipment:
        equipment = Equipment(code=equipment_id, name=f"Equipo {equipment_id}", model="CAT 797F")
    
    orders = []
    xlsx_bytes = build_maintenance_report_xlsx(equipment, orders)
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_{equipment.code}.xlsx"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        },
    )


@router.get("/equipment/{equipment_id}/docx")
async def report_equipment_docx(
    equipment_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        equipment = await db.get(Equipment, equipment_id)
    except Exception:
        equipment = None

    if not equipment:
        equipment = Equipment(code=equipment_id, name=f"Equipo {equipment_id}", model="CAT 797F")
    
    orders = []
    docx_bytes = build_maintenance_report_docx(equipment, orders)
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_{equipment.code}.docx"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        },
    )
