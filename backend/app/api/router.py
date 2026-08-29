from fastapi import APIRouter

from app.api.routers import ai, alerts, auth, equipment, ethics, maintenance, reports, scenarios, telemetry

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(equipment.router)
api_router.include_router(maintenance.router)
api_router.include_router(reports.router)
api_router.include_router(ai.router)

# Nuevos routers del Gemelo Digital 3D Explicable & Predicción de Riesgo
api_router.include_router(telemetry.router)
api_router.include_router(alerts.router)
api_router.include_router(ethics.router)
api_router.include_router(scenarios.router)
