import asyncio
import json
import random
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSocket Telemetry Streaming"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """Endpoint WebSocket para streaming 1Hz de telemetría GNSS/LiDAR 3D y alertas de riesgo."""
    await manager.connect(websocket)
    try:
        while True:
            # Emit 1Hz simulated live telemetry package
            payload = {
                "type": "TELEMETRY_UPDATE",
                "timestamp": asyncio.get_event_loop().time(),
                "fleet": [
                    {
                        "code": "CA-01",
                        "fleet_type": "manual",
                        "speed_kmh": round(38.0 + random.uniform(-2, 2), 1),
                        "prediction_horizon_sec": 4.8,
                        "risk_score": 0.85,
                        "risk_level": "critico",
                        "audio_warning": True
                    },
                    {
                        "code": "CA-02",
                        "fleet_type": "autonomo",
                        "speed_kmh": round(42.0 + random.uniform(-1, 1), 1),
                        "prediction_horizon_sec": 6.4,
                        "risk_score": 0.68,
                        "risk_level": "alto",
                        "audio_warning": False
                    },
                    {
                        "code": "PA-01",
                        "fleet_type": "manual",
                        "speed_kmh": 0.0,
                        "prediction_horizon_sec": 8.5,
                        "risk_score": 0.12,
                        "risk_level": "bajo",
                        "audio_warning": False
                    }
                ]
            }
            await websocket.send_json(payload)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
