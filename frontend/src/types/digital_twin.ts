export type FleetType = 'autonomo' | 'manual';
export type EquipmentType = 'camion' | 'shovel' | 'cargador';
export type RiskLevel = 'bajo' | 'medio' | 'alto' | 'critico';

export interface SHAPFactor {
  feature_name: string;
  weight_percentage: number;
  impact_direction: 'positive' | 'negative';
  description: string;
}

export interface EquipmentTwinData {
  code: string;
  name: string;
  equipment_type: EquipmentType;
  fleet_type: FleetType;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading_deg: number;
  risk_score: number; // 0.0 to 1.0
  risk_level: RiskLevel;
  prediction_horizon_sec: number; // Lead time (target >= 5s)
  shap_factors: SHAPFactor[];
  perception_summary?: string;
  behavior_score?: number;
  recommended_action: string;
}

export interface RiskAlertData {
  id: string;
  equipment_id: string;
  target_equipment_id?: string;
  risk_score: number;
  risk_level: RiskLevel;
  prediction_horizon_sec: number;
  shap_factors_json: string;
  scenario_type: string;
  is_active: boolean;
  avoided_successfully?: boolean;
  created_at: string;
}

export interface SafetyKPIs {
  potential_incidents_avoided: number;
  total_alerts_issued: number;
  false_positive_rate_pct: number;
  avg_early_warning_time_sec: number;
  operator_trust_index_pct: number;
}

export interface PDSComparison {
  digital_twin_xai: {
    avg_lead_time_sec: number;
    auc_roc: number;
    f1_score: number;
    precision: number;
    recall: number;
    features_used: string;
  };
  standard_pds: {
    avg_lead_time_sec: number;
    auc_roc: number;
    f1_score: number;
    precision: number;
    recall: number;
    features_used: string;
  };
}

export interface OperatorConsentData {
  user_id: string;
  consent_given: boolean;
  consent_date?: string;
  anonymize_in_reports: boolean;
}
