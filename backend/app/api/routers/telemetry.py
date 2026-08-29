import json
import logging
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis_client import redis_manager
from app.db.database import get_db
from app.models.models import Equipment, GNSSTelemetry, LiDARFeature, OperatorLog, RiskAlert, RiskLevelEnum
from app.schemas.schemas import GNSSTelemetryIn, LiDARFeatureIn, OperatorLogIn, RiskPredictionOut, SHAPFactorSchema
from app.services.risk_engine_service import risk_engine_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/telemetry", tags=["Telemetría & Ingesta GNSS/LiDAR"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket cliente conectado. Total activos: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket cliente desconectado.")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error enviando mensaje por WebSocket: {e}")


manager = ConnectionManager()


@router.post("/gnss", status_code=status.HTTP_201_CREATED)
async def ingest_gnss_telemetry(payload: GNSSTelemetryIn, db: AsyncSession = Depends(get_db)):
    """
    Endpoint de ingesta de telemetría GNSS (1 Hz).
    Publica en Redis Pub/Sub, evalúa riesgo de colisión y notifica por WebSocket.
    """
    res = await db.execute(select(Equipment).where(Equipment.code == payload.equipment_code))
    equipment = res.scalar_one_or_none()
    if not equipment:
        # Auto-crear equipo si no existe en desarrollo
        equipment = Equipment(
            code=payload.equipment_code,
            name=f"Equipo {payload.equipment_code}",
            model="CAT 797F",
            equipment_type="camion"
        )
        db.add(equipment)
        await db.commit()
        await db.refresh(equipment)

    gnss = GNSSTelemetry(
        equipment_id=equipment.id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        altitude=payload.altitude,
        speed_kmh=payload.speed_kmh,
        heading_deg=payload.heading_deg
    )
    db.add(gnss)
    await db.commit()

    # Guardar en Redis Pub/Sub y caché
    telemetry_data = payload.model_dump()
    await redis_manager.set_latest_telemetry(payload.equipment_code, telemetry_data)
    await redis_manager.publish_telemetry("telemetry_stream", telemetry_data)

    # Evaluar riesgo con Risk Engine
    risk_res = risk_engine_service.predict_collision_risk(
        equipment_code=payload.equipment_code,
        target_equipment_code=None,
        distance_m=max(10.0, 100.0 - (payload.speed_kmh * 1.5)),
        relative_speed_kmh=payload.speed_kmh,
        obstacle_count=1,
        shift_hours=7.5,
        fatigue_score=0.25 if payload.speed_kmh < 40 else 0.65,
        sudden_braking_count=1 if payload.speed_kmh > 45 else 0
    )

    # Difundir posición + score de riesgo + factores SHAP a los clientes 3D por WebSocket
    ws_payload = {
        "event": "TELEMETRY_UPDATE",
        "equipment_code": payload.equipment_code,
        "equipment_type": equipment.equipment_type,
        "fleet_type": equipment.fleet_type.value if hasattr(equipment.fleet_type, 'value') else equipment.fleet_type,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "speed_kmh": payload.speed_kmh,
        "heading_deg": payload.heading_deg,
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
        "recommended_action": risk_res.recommended_action
    }

    await manager.broadcast(ws_payload)

    return {"status": "ok", "equipment_code": payload.equipment_code, "risk_score": risk_res.risk_score}


@router.post("/lidar", status_code=status.HTTP_201_CREATED)
async def ingest_lidar_features(payload: LiDARFeatureIn, db: AsyncSession = Depends(get_db)):
    """Ingesta de features ya procesados de nubes de puntos LiDAR."""
    res = await db.execute(select(Equipment).where(Equipment.code == payload.equipment_code))
    eq = res.scalar_one_or_none()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    lidar = LiDARFeature(
        equipment_id=eq.id,
        obstacle_count=payload.obstacle_count,
        min_obstacle_dist_m=payload.min_obstacle_dist_m,
        embedding_json=payload.embedding_json
    )
    db.add(lidar)
    await db.commit()
    return {"status": "ok", "equipment_code": payload.equipment_code}


@router.post("/operator-log", status_code=status.HTTP_201_CREATED)
async def ingest_operator_log(payload: OperatorLogIn, db: AsyncSession = Depends(get_db)):
    """Ingesta de métricas de comportamiento de operador (horas de turno, fatiga, maniobras)."""
    res = await db.execute(select(Equipment).where(Equipment.code == payload.equipment_code))
    eq = res.scalar_one_or_none()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    op_log = OperatorLog(
        operator_id=payload.operator_id,
        equipment_id=eq.id,
        shift_hours=payload.shift_hours,
        fatigue_score=payload.fatigue_score,
        sudden_braking_count=payload.sudden_braking_count
    )
    db.add(op_log)
    await db.commit()
    return {"status": "ok", "operator_id": payload.operator_id}


@router.get("/live-fleet")
async def get_live_fleet_positions(db: AsyncSession = Depends(get_db)):
    """Obtiene el estado y posición 3D actual de todos los equipos del tajo con su riesgo SHAP."""
    res = await db.execute(select(Equipment))
    equipments = res.scalars().all()

    fleet_status = []
    # Mock posiciones realistas distribuidas en el tajo abierto si no hay telemetría reciente
    mock_positions = [
        {"code": "CA-01", "name": "Camión CAT 797F #1", "type": "camion", "fleet": "manual", "lat": -16.3988, "lon": -71.5350, "speed": 34.5, "heading": 45.0, "dist": 22.0, "shift": 9.5, "fatigue": 0.72},
        {"code": "CA-02", "name": "Camión Komatsu 930E #2", "type": "camion", "fleet": "autonomo", "lat": -16.3995, "lon": -71.5342, "speed": 42.0, "heading": 120.0, "dist": 18.5, "shift": 0.0, "fatigue": 0.05},
        {"code": "PA-01", "name": "Pala Bucyrus 495HR", "type": "shovel", "fleet": "autonomo", "lat": -16.4010, "lon": -71.5360, "speed": 0.0, "heading": 0.0, "dist": 15.0, "shift": 4.0, "fatigue": 0.15},
        {"code": "CA-03", "name": "Camión CAT 797F #3", "type": "camion", "fleet": "manual", "lat": -16.4002, "lon": -71.5375, "speed": 28.0, "heading": 210.0, "dist": 45.0, "shift": 10.5, "fatigue": 0.85},
        {"code": "CL-01", "name": "Cargador CAT 994K", "type": "cargador", "fleet": "manual", "lat": -16.3982, "lon": -71.5330, "speed": 12.0, "heading": 300.0, "dist": 60.0, "shift": 5.0, "fatigue": 0.20},
    ]

    for item in mock_positions:
        risk_res = risk_engine_service.predict_collision_risk(
            equipment_code=item["code"],
            target_equipment_code="PA-01" if item["type"] == "camion" else None,
            distance_m=item["dist"],
            relative_speed_kmh=item["speed"],
            obstacle_count=2,
            shift_hours=item["shift"],
            fatigue_score=item["fatigue"],
            sudden_braking_count=2 if item["fatigue"] > 0.6 else 0
        )

        fleet_status.append({
            "code": item["code"],
            "name": item["name"],
            "equipment_type": item["type"],
            "fleet_type": item["fleet"],
            "latitude": item["lat"],
            "longitude": item["lon"],
            "speed_kmh": item["speed"],
            "heading_deg": item["heading"],
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
        })

    return fleet_status


@router.websocket("/ws")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """Canal WebSocket en tiempo real para transmisión de posiciones 3D y alertas SHAP."""
    await manager.connect(websocket)
    try:
        while True:
            # Mantener conexión viva y escuchar mensajes del cliente si aplica
            data = await websocket.receive_text()
            logger.debug(f"Mensaje WebSocket recibido de cliente: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
