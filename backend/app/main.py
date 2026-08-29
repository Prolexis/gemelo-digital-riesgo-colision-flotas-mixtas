from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.redis_client import redis_manager
from app.db.database import engine, Base
import app.models.models  # load models for create_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Crear tablas si no existen y conectar a Redis
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Advertencia inicializando tablas DB: {e}")
    
    await redis_manager.connect()
    yield
    # Shutdown: Desconectar Redis
    await redis_manager.disconnect()


app = FastAPI(
    title="Gemelo Digital 3D Explicable - Predicción de Riesgo en Minas",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Salud"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.ENV, "version": "2.0.0-XAI"}
