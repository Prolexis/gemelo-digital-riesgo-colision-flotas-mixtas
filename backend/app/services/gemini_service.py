"""Servicio de integración con la API de Gemini.

Implementa el Paso 3 del prompt agéntico: usa el historial de mantenimiento de un
equipo para generar, vía Gemini, un diagnóstico de causas raíz y recomendaciones.
"""

import json
import logging

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger("gemini_service")


class GeminiServiceError(Exception):
    pass


def _get_client() -> genai.Client:
    if not settings.GEMINI_API_KEY:
        raise GeminiServiceError("GEMINI_API_KEY no está configurada en el entorno")
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_maintenance_insight(equipment_history: list[dict]) -> str:
    """Devuelve un diagnóstico textual generado por Gemini."""
    prompt = (
        "Eres un ingeniero senior de mantenimiento de equipos mineros. "
        "Analiza el siguiente historial de mantenimiento (JSON) y entrega un "
        "diagnóstico breve de posibles causas raíz y recomendaciones concretas:\n\n"
        f"{json.dumps(equipment_history, ensure_ascii=False, default=str)}"
    )
    try:
        client = _get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text or ""
    except Exception as exc:  # noqa: BLE001
        logger.exception("Error llamando a la API de Gemini")
        raise GeminiServiceError(str(exc)) from exc


def generate_maintenance_insight_structured(equipment_history: list[dict]) -> dict:
    """Igual que la anterior, pero fuerza salida JSON estricta para el dashboard."""
    prompt = (
        "Analiza este historial de mantenimiento y responde ÚNICAMENTE con un JSON "
        "con las claves: root_causes (lista de strings), recommendations "
        "(lista de strings), risk_level (uno de: bajo, medio, alto).\n\n"
        f"{json.dumps(equipment_history, ensure_ascii=False, default=str)}"
    )
    try:
        client = _get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        return json.loads(response.text)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Error llamando a la API de Gemini (modo estructurado)")
        raise GeminiServiceError(str(exc)) from exc
