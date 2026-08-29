import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class RoleEnum(str, enum.Enum):
    ADMIN = "administrador"
    SUPERVISOR = "supervisor_seguridad"
    TECNICO = "tecnico_campo"
    OPERATOR = "operador"
    ANALYST = "analista_datos"
    LECTURA = "solo_lectura"


class FleetTypeEnum(str, enum.Enum):
    AUTONOMOUS = "autonomo"
    MANUAL = "manual"


class EquipmentStatus(str, enum.Enum):
    OPTIMO = "optimo"
    ALERTA = "alerta"
    CRITICO = "critico"


class RiskLevelEnum(str, enum.Enum):
    LOW = "bajo"
    MEDIUM = "medio"
    HIGH = "alto"
    CRITICAL = "critico"


class MaintenanceType(str, enum.Enum):
    PREVENTIVO = "preventivo"
    CORRECTIVO = "correctivo"
    PREDICTIVO = "predictivo"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), default=RoleEnum.LECTURA)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    consent: Mapped[Optional["OperatorConsent"]] = relationship(back_populates="user", uselist=False)
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="user")


class Equipment(Base):
    __tablename__ = "equipment"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    equipment_type: Mapped[str] = mapped_column(String(50), nullable=False)  # camion, shovel, cargador
    fleet_type: Mapped[FleetTypeEnum] = mapped_column(Enum(FleetTypeEnum), default=FleetTypeEnum.MANUAL)
    hour_meter: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[EquipmentStatus] = mapped_column(Enum(EquipmentStatus), default=EquipmentStatus.OPTIMO)
    last_intervention_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    maintenance_orders: Mapped[list["MaintenanceOrder"]] = relationship(back_populates="equipment", cascade="all, delete-orphan")
    telemetry: Mapped[list["EquipmentTelemetry"]] = relationship(back_populates="equipment", cascade="all, delete-orphan")
    gnss_logs: Mapped[list["GNSSTelemetry"]] = relationship(back_populates="equipment", cascade="all, delete-orphan")
    lidar_logs: Mapped[list["LiDARFeature"]] = relationship(back_populates="equipment", cascade="all, delete-orphan")
    alerts: Mapped[list["RiskAlert"]] = relationship(foreign_keys="RiskAlert.equipment_id", back_populates="equipment")


class MaintenanceOrder(Base):
    __tablename__ = "maintenance_orders"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    equipment_id: Mapped[str] = mapped_column(ForeignKey("equipment.id"), nullable=False)
    maintenance_type: Mapped[MaintenanceType] = mapped_column(Enum(MaintenanceType), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    parts_used: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    labor_hours: Mapped[float] = mapped_column(Float, default=0.0)
    performed_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    equipment: Mapped["Equipment"] = relationship(back_populates="maintenance_orders")


class EquipmentTelemetry(Base):
    __tablename__ = "equipment_telemetry"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    equipment_id: Mapped[str] = mapped_column(ForeignKey("equipment.id"), nullable=False)
    source: Mapped[str] = mapped_column(String(30), nullable=False)  # gnss | lidar | sensor
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    equipment: Mapped["Equipment"] = relationship(back_populates="telemetry")


class GNSSTelemetry(Base):
    __tablename__ = "gnss_telemetry"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    equipment_id: Mapped[str] = mapped_column(ForeignKey("equipment.id"), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    altitude: Mapped[float] = mapped_column(Float, default=0.0)
    speed_kmh: Mapped[float] = mapped_column(Float, default=0.0)
    heading_deg: Mapped[float] = mapped_column(Float, default=0.0)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    equipment: Mapped["Equipment"] = relationship(back_populates="gnss_logs")


class LiDARFeature(Base):
    __tablename__ = "lidar_features"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    equipment_id: Mapped[str] = mapped_column(ForeignKey("equipment.id"), nullable=False)
    obstacle_count: Mapped[int] = mapped_column(Integer, default=0)
    min_obstacle_dist_m: Mapped[float] = mapped_column(Float, default=100.0)
    embedding_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    equipment: Mapped["Equipment"] = relationship(back_populates="lidar_logs")


class OperatorLog(Base):
    __tablename__ = "operator_logs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    operator_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    equipment_id: Mapped[str] = mapped_column(ForeignKey("equipment.id"), nullable=False)
    shift_hours: Mapped[float] = mapped_column(Float, default=0.0)
    fatigue_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0 to 1
    sudden_braking_count: Mapped[int] = mapped_column(Integer, default=0)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class OperatorConsent(Base):
    __tablename__ = "operator_consents"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    anonymize_in_reports: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="consent")


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    equipment_id: Mapped[str] = mapped_column(ForeignKey("equipment.id"), nullable=False)
    target_equipment_id: Mapped[Optional[str]] = mapped_column(ForeignKey("equipment.id"), nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 to 1.0
    risk_level: Mapped[RiskLevelEnum] = mapped_column(Enum(RiskLevelEnum), default=RiskLevelEnum.LOW)
    prediction_horizon_sec: Mapped[float] = mapped_column(Float, default=5.0)  # e.g., 6.5 seconds early warning
    shap_factors_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON explanation breakdown
    scenario_type: Mapped[str] = mapped_column(String(100), default="Standard Proximity")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    avoided_successfully: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    equipment: Mapped["Equipment"] = relationship(foreign_keys=[equipment_id], back_populates="alerts")


class RiskScenario(Base):
    __tablename__ = "risk_scenarios"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    risk_threshold: Mapped[float] = mapped_column(Float, default=0.75)
    parameters_json: Mapped[str] = mapped_column(Text, nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    details_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[Optional["User"]] = relationship(back_populates="audit_logs")
