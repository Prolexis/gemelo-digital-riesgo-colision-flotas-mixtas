import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.models import AuditLog, OperatorConsent, User
from app.schemas.schemas import OperatorConsentIn, OperatorConsentOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ethics", tags=["Ética, Privacidad & Consentimiento Informado"])


@router.post("/consent", response_model=OperatorConsentOut)
async def register_operator_consent(payload: OperatorConsentIn, db: AsyncSession = Depends(get_db)):
    """Registra o actualiza el consentimiento informado del operador para el monitoreo de fatiga y comportamiento."""
    res = await db.execute(select(User).where(User.id == payload.user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario operador no encontrado")

    res_consent = await db.execute(select(OperatorConsent).where(OperatorConsent.user_id == payload.user_id))
    consent = res_consent.scalar_one_or_none()

    if not consent:
        consent = OperatorConsent(
            user_id=payload.user_id,
            consent_given=payload.consent_given,
            anonymize_in_reports=payload.anonymize_in_reports
        )
        db.add(consent)
    else:
        consent.consent_given = payload.consent_given
        consent.anonymize_in_reports = payload.anonymize_in_reports

    # Registrar Auditoría Ética
    audit = AuditLog(
        user_id=payload.user_id,
        action="UPDATE_INFORMED_CONSENT",
        resource="OperatorConsent",
        details_json=json.dumps({"consent_given": payload.consent_given, "anonymize": payload.anonymize_in_reports})
    )
    db.add(audit)

    await db.commit()
    await db.refresh(consent)
    return consent


@router.get("/consent/{user_id}", response_model=OperatorConsentOut)
async def get_operator_consent(user_id: str, db: AsyncSession = Depends(get_db)):
    """Obtiene el consentimiento de un operador."""
    res = await db.execute(select(OperatorConsent).where(OperatorConsent.user_id == user_id))
    consent = res.scalar_one_or_none()
    if not consent:
        # Devuelve estado por defecto si no ha firmado aún
        return OperatorConsentOut(
            id="default",
            user_id=user_id,
            consent_given=False,
            consent_date=None,
            anonymize_in_reports=True
        )
    return consent


@router.get("/audit-log")
async def list_audit_logs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Lista el registro de auditoría ética de acciones sobre datos de operadores."""
    res = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
    logs = res.scalars().all()
    return logs
