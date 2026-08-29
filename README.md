# Gemelo Digital 3D Explicable para Predicción de Riesgo de Colisión en Minas a Cielo Abierto

Aplicación de **Gemelo Digital 3D Explicable (XAI SHAP)** para la gestión de seguridad y predicción en tiempo real del riesgo de colisión en operaciones mineras de tajo abierto con **flotas mixtas** (camiones autónomos + operados manualmente).

**Stack Tecnológico:**
- **Backend:** FastAPI (Python 3.11+) · SQLAlchemy 2.0 Async · PostGIS (PostgreSQL) · Redis Pub/Sub · Alembic.
- **Frontend:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Three.js / React Three Fiber.
- **XAI & ML:** Servicio de Inferencia Explicable (`risk_engine_service.py`) con atribución SHAP en tiempo real.
- **Contenerización:** Docker Compose (PostGIS + Redis + FastAPI Backend + Next.js Frontend + pgAdmin).

---

## Flujo de Datos del Sistema

```
[ Telemetría GNSS (1Hz) + LiDAR Features + Comportamiento Operador ]
                            │
                            ▼
               [ Ingesta REST / WebSockets ]
                            │
                            ▼
                  [ Redis Pub/Sub Queue ]
                            │
                            ▼
              [ risk_engine_service.py ]
   ├── Capa 1: Percepción (PointNet++ LiDAR Mock)
   ├── Capa 2: Comportamiento (LSTM Fatiga/Maniobras Mock)
   ├── Capa 3: Fusión Multi-modal (Transformer Mock)
   └── Capa 4: Explicabilidad XAI (Atribución SHAP)
                            │
                            ▼
    [ Motor de Alertas (Lead Time >= 5s Target) & PostGIS ]
                            │
                            ▼
       [ Transmisión WebSocket en Tiempo Real ]
                            │
                            ▼
    [ Frontend Next.js: Mapa 3D Tajo + Drawer SHAP + KPIs Dashboard ]
```

---

## Requisitos Previos

- Docker Desktop instalado y corriendo.
- Puertos libres: `3000` (frontend), `8000` (backend), `5432` (PostGIS), `6379` (Redis), `5050` (pgAdmin).

---

## Paso a Paso para Ejecución Local (Docker)

### 1. Configurar variables de entorno

En PowerShell:
```powershell
Copy-Item .env.example .env
```

### 2. Levantar los servicios con Docker Compose

```bash
docker compose up --build
```

### 3. Aplicar las migraciones de Base de Datos (PostGIS)

En otra terminal con los contenedores corriendo:
```bash
docker compose exec backend alembic upgrade head
```

### 4. URLs de Acceso

- **Mapa 3D y Dashboard Gemelo Digital:** [http://localhost:3000](http://localhost:3000)
- **Documentación de la API (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Canal WebSocket de Telemetría:** `ws://localhost:8000/api/v1/telemetry/ws`
- **pgAdmin:** [http://localhost:5050](http://localhost:5050) *(usuario: `admin@admin.com` / clave: `admin`)*

---

## ¿Dónde conectar los modelos de Machine Learning entrenados?

Toda la lógica de inferencia y explicabilidad se encuentra encapsulada en la clase `ExplainableRiskEngineService` dentro de:

```text
backend/app/services/risk_engine_service.py
```

### Pasos para conectar modelos reales entrenados offline:

1. **Colocar los artefactos de pesos (.pt / .onnx / .joblib):**
   Guarda los pesos entrenados de **PointNet++** (percepción LiDAR), **LSTM** (comportamiento de operador) y **Transformer** (fusión multi-modal) en la carpeta `backend/app/models/weights/`.

2. **Cargar pesos en `__init__()`:**
   Descomenta y configura la carga de modelos en la función `_load_models_if_available()`:
   ```python
   self.perception_model = torch.load("app/models/weights/pointnet.pt")
   self.behavior_lstm = torch.load("app/models/weights/behavior_lstm.pt")
   self.fusion_transformer = torch.load("app/models/weights/transformer.pt")
   ```

3. **Reemplazar la inferencia Mock:**
   Reemplaza los métodos `_perception_layer()`, `_behavior_layer()` y la función de atribución SHAP `_generate_shap_explanation()` por invocaciones directas a tu pipeline de PyTorch y `shap.TreeExplainer` / `shap.KernelExplainer`.

---

## Módulos Incluidos

1. **Mapa 3D del Tajo:** Visualización interactiva en Three.js con aura de riesgo por color (Verde, Amarillo, Naranja, Rojo).
2. **Explicabilidad SHAP:** Drawer desplegable al seleccionar un equipo 3D mostrando el desglose % de factores (Fatiga, Velocidad relativa, Proximidad, Niebla, Horas de turno).
3. **Escenarios de Prueba:** Simulación de cruces en curva ciega, proximidad pala-camión y sobreturno.
4. **Ética & Privacidad:** Registro de consentimiento informado del operador y opción de anonimización en exportación de reportes.
5. **Reportes Multiformato:** Generación parametrizable de reportes en PDF, Excel (`.xlsx`) y Word (`.docx`).
