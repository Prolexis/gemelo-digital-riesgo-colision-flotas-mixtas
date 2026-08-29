from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.models import EquipmentStatus, FleetTypeEnum, MaintenanceType, RiskLevelEnum, RoleEnum


# ---------- Auth / Users ----------
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.LECTURA


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: EmailStr
    role: RoleEnum
    is_active: bool
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[UserOut] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[RoleEnum] = None


# ---------- Equipment ----------
class EquipmentCreate(BaseModel):
    code: str
    name: str
    model: str
    equipment_type: str
    fleet_type: FleetTypeEnum = FleetTypeEnum.MANUAL
    hour_meter: float = 0.0
    status: EquipmentStatus = EquipmentStatus.OPTIMO


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    hour_meter: Optional[float] = None
    status: Optional[EquipmentStatus] = None
    fleet_type: Optional[FleetTypeEnum] = None


class EquipmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    model: str
    equipment_type: str
    fleet_type: FleetTypeEnum
    hour_meter: float
    status: EquipmentStatus
    last_intervention_at: Optional[datetime] = None
    created_at: datetime


# ---------- Maintenance Orders ----------
class MaintenanceOrderCreate(BaseModel):
    equipment_id: str
    maintenance_type: MaintenanceType
    description: str
    parts_used: Optional[str] = None
    labor_hours: float = 0.0
    performed_by: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class MaintenanceOrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    equipment_id: str
    maintenance_type: MaintenanceType
    description: str
    parts_used: Optional[str]
    labor_hours: float
    performed_by: Optional[str]
    scheduled_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime


# ---------- Telemetry & LiDAR ----------
class GNSSTelemetryIn(BaseModel):
    equipment_code: str
    latitude: float
    longitude: float
    altitude: float = 0.0
    speed_kmh: float = 0.0
    heading_deg: float = 0.0


class LiDARFeatureIn(BaseModel):
    equipment_code: str
    obstacle_count: int = 0
    min_obstacle_dist_m: float = 100.0
    embedding_json: Optional[str] = None


class OperatorLogIn(BaseModel):
    operator_id: str
    equipment_code: str
    shift_hours: float = 0.0
    fatigue_score: float = 0.0
    sudden_braking_count: int = 0


# ---------- Risk & XAI (SHAP) ----------
class SHAPFactorSchema(BaseModel):
    feature_name: str
    weight_percentage: float
    impact_direction: str
    description: str


class RiskPredictionRequest(BaseModel):
    equipment_code: str
    target_equipment_code: Optional[str] = None
    distance_m: float = 50.0
    relative_speed_kmh: float = 25.0
    obstacle_count: int = 1
    shift_hours: float = 8.0
    fatigue_score: float = 0.3
    sudden_braking_count: int = 1
    visibility_index: float = 0.9


class RiskPredictionOut(BaseModel):
    equipment_code: str
    target_equipment_code: Optional[str]
    risk_score: float
    risk_level: RiskLevelEnum
    prediction_horizon_sec: float
    shap_factors: List[SHAPFactorSchema]
    perception_embedding_summary: str
    behavior_score: float
    recommended_action: str


class RiskAlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    equipment_id: str
    target_equipment_id: Optional[str]
    risk_score: float
    risk_level: RiskLevelEnum
    prediction_horizon_sec: float
    shap_factors_json: str
    scenario_type: str
    is_active: bool
    avoided_successfully: Optional[bool]
    created_at: datetime


# ---------- Ethics & Consent ----------
class OperatorConsentIn(BaseModel):
    user_id: str
    consent_given: bool
    anonymize_in_reports: bool = True


class OperatorConsentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    consent_given: bool
    consent_date: Optional[datetime]
    anonymize_in_reports: bool


# ---------- Risk Scenario ----------
class RiskScenarioIn(BaseModel):
    name: str
    description: str
    risk_threshold: float = 0.75
    parameters_json: str = "{}"


class RiskScenarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    risk_threshold: float
    parameters_json: str
    is_enabled: bool
    created_at: datetime
