import json
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.schemas import RiskPredictionRequest, RiskPredictionOut
from app.services.risk_engine_service import risk_engine_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scenarios", tags=["Escenarios de Prueba & Simulación de Colisión"])


PREDEFINED_SCENARIOS = [
    {
        "id": "scenario-1",
        "name": "Cruce en Curva Ciega",
        "description": "Camión de extracción manual en aproximación a 45 km/h hacia camión autónomo en curva con visibilidad reducida.",
        "risk_threshold": 0.80,
        "parameters": {"distance_m": 22.0, "speed_kmh": 45.0, "visibility": 0.5, "shift_hours": 9.5, "fatigue": 0.70}
    },
    {
        "id": "scenario-2",
        "name": "Pala + Camión Manual en Proximidad Crítica",
        "description": "Aproximación peligrosa durante maniobra de acople de carguío entre Pala Bucyrus y Camión CAT 797F.",
        "risk_threshold": 0.75,
        "parameters": {"distance_m": 12.0, "speed_kmh": 18.0, "visibility": 0.9, "shift_hours": 7.0, "fatigue": 0.30}
    },
    {
        "id": "scenario-3",
        "name": "Operador en Sobreturno (>10 Horas)",
        "description": "Operador con micro-sueños y fatiga acumulada en turno nocturno con niebla densa.",
        "risk_threshold": 0.85,
        "parameters": {"distance_m": 35.0, "speed_kmh": 38.0, "visibility": 0.3, "shift_hours": 11.5, "fatigue": 0.90}
    },
    {
        "id": "scenario-4",
        "name": "Operación Normal Sin Riesgo",
        "description": "Flotas autónomas respetando distancia mínima de seguridad de 60m a velocidad regulada.",
        "risk_threshold": 0.35,
        "parameters": {"distance_m": 75.0, "speed_kmh": 25.0, "visibility": 1.0, "shift_hours": 3.0, "fatigue": 0.10}
    }
]


@router.get("/")
async def list_scenarios():
    """Obtiene los escenarios predefinidos para pruebas de evaluación experimental."""
    return PREDEFINED_SCENARIOS


@router.post("/simulate")
async def simulate_scenario(scenario_id: str):
    """Ejecuta la simulación de un escenario de riesgo y calcula la predicción XAI con SHAP."""
    matched = next((s for s in PREDEFINED_SCENARIOS if s["id"] == scenario_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Escenario no encontrado")

    params = matched["parameters"]
    risk_res = risk_engine_service.predict_collision_risk(
        equipment_code="SIM-CA-01",
        target_equipment_code="SIM-PA-01",
        distance_m=params["distance_m"],
        relative_speed_kmh=params["speed_kmh"],
        obstacle_count=2,
        shift_hours=params["shift_hours"],
        fatigue_score=params["fatigue"],
        sudden_braking_count=3 if params["fatigue"] > 0.6 else 0,
        visibility_index=params["visibility"]
    )

    return {
        "scenario": matched,
        "prediction_result": {
            "risk_score": risk_res.risk_score,
            "risk_level": risk_res.risk_level,
            "prediction_horizon_sec": risk_res.prediction_horizon_sec,
            "shap_factors": [
                {
                    "feature_name": f.feature_name,
                    "weight_percentage": f.weight_percentage,
                    "impact_direction": f.impact_direction,
                    "description": f.description
                } for f in risk_res.shap_factors
            ],
            "perception_summary": risk_res.perception_embedding_summary,
            "behavior_score": risk_res.behavior_score,
            "recommended_action": risk_res.recommended_action
        }
    }
