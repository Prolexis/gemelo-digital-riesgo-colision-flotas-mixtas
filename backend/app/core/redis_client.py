"""
Cliente y Administrador de Cola de Mensajes Redis Pub/Sub para Telemetría de Alta Frecuencia.
"""

import json
import logging
from typing import Any, Dict, Optional

try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except Exception:
    REDIS_AVAILABLE = False
    aioredis = None
from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisManager:
    def __init__(self):
        self.redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")
        self.client: Optional[aioredis.Redis] = None

    async def connect(self):
        if not REDIS_AVAILABLE:
            logger.warning("Librería redis no disponible. Operando en modo fallback.")
            self.client = None
            return
        try:
            self.client = aioredis.from_url(self.redis_url, decode_responses=True)
            await self.client.ping()
            logger.info("Conexión a Redis Pub/Sub establecida correctamente.")
        except Exception as e:
            logger.warning(f"No se pudo conectar a Redis en {self.redis_url}: {e}. Operando en fallback en memoria.")
            self.client = None

    async def disconnect(self):
        if self.client:
            await self.client.close()

    async def publish_telemetry(self, channel: str, data: Dict[str, Any]):
        if self.client:
            try:
                await self.client.publish(channel, json.dumps(data))
            except Exception as e:
                logger.error(f"Error publicando en canal de Redis {channel}: {e}")

    async def get_latest_telemetry(self, equipment_code: str) -> Optional[Dict[str, Any]]:
        if self.client:
            try:
                val = await self.client.get(f"telemetry:{equipment_code}")
                return json.loads(val) if val else None
            except Exception:
                return None
        return None

    async def set_latest_telemetry(self, equipment_code: str, data: Dict[str, Any]):
        if self.client:
            try:
                await self.client.set(f"telemetry:{equipment_code}", json.dumps(data), ex=3600)
            except Exception as e:
                logger.error(f"Error guardando caché de telemetría para {equipment_code}: {e}")


redis_manager = RedisManager()
