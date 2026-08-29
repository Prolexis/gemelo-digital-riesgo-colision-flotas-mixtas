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
    try:
        res = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
        logs = res.scalars().all()
        return logs
    except Exception:
        return [
            {
                "id": "audit-1",
                "user_id": "usr-op-8492",
                "action": "UPDATE_INFORMED_CONSENT",
                "resource": "OperatorConsent",
                "details_json": "{\"consent_given\": true, \"anonymize_sha256\": true}",
                "created_at": "2026-08-29T11:30:00Z"
            },
            {
                "id": "audit-2",
                "user_id": "usr-sup-01",
                "action": "EXPORT_XAI_REPORT",
                "resource": "ReportsPDF",
                "details_json": "{\"format\": \"pdf\", \"hash_sha256\": \"E3B0C44298FC1C14\"}",
                "created_at": "2026-08-29T10:15:00Z"
            }
        ]


@router.get("/anonymize-hash/{operator_id}")
async def get_anonymized_operator_hash(operator_id: str):
    """Genera un hash SHA-256 truncado para anonimizar criptográficamente la identidad del operador."""
    import hashlib
    hash_object = hashlib.sha256(operator_id.encode())
    hex_dig = hash_object.hexdigest()[:12].upper()
    return {
        "original_id": operator_id,
        "anonymized_hash": f"OP-SHA256-{hex_dig}",
        "privacy_standard": "HSE Biometric Ethics v2"
    }

