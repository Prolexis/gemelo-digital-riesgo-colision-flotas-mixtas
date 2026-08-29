export type EquipmentStatus = "optimo" | "alerta" | "critico";

export interface Equipment {
  id: string;
  code: string;
  name: string;
  model: string;
  equipment_type: string;
  hour_meter: number;
  status: EquipmentStatus;
  last_intervention_at: string | null;
  created_at: string;
}

export interface MaintenanceOrder {
  id: string;
  equipment_id: string;
  maintenance_type: "preventivo" | "correctivo" | "predictivo";
  description: string;
  labor_hours: number;
  performed_by: string | null;
  created_at: string;
}
