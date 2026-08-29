-- ============================================================================
-- GEMELO DIGITAL 3D EXPLICABLE: ESQUEMA POSTGIS & BASE DE DATOS MINERA 3D
-- Soporte para tipos geoespaciales PointZ/LineStringZ, Índices GiST y Particionamiento
-- ============================================================================

-- 1. Habilitar extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Equipos y Unidades Mineras
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    model VARCHAR(100) NOT NULL,
    equipment_type VARCHAR(50) NOT NULL, -- camion, shovel, cargador
    fleet_type VARCHAR(50) DEFAULT 'manual', -- autonomo, manual
    hour_meter DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'optimo',
    last_intervention_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla Geoespacial de Telemetría GNSS 3D Submétrica (1 Hz) - Particionada
CREATE TABLE IF NOT EXISTS gnss_telemetry_3d (
    id UUID DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude_m DOUBLE PRECISION DEFAULT 3350.0, -- Cota de Banco (3100m a 3600m)
    speed_kmh DOUBLE PRECISION DEFAULT 0.0,
    heading_deg DOUBLE PRECISION DEFAULT 0.0,
    geom Geometry(PointZ, 4326), -- Punto 3D PostGIS
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- Partición Inicial 2026
CREATE TABLE IF NOT EXISTS gnss_telemetry_3d_2026 PARTITION OF gnss_telemetry_3d
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

-- Índice Espacial GiST para consultas de proximidad 3D en tiempo real
CREATE INDEX IF NOT EXISTS idx_gnss_geom_gist ON gnss_telemetry_3d USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_gnss_recorded_at ON gnss_telemetry_3d (recorded_at DESC);

-- 4. Tabla de Trayectorias Predichas (LineStringZ PostGIS 3D)
CREATE TABLE IF NOT EXISTS predicted_trajectories_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    horizon_sec DOUBLE PRECISION DEFAULT 6.4, -- Lead Time anticipado H1
    trajectory_line Geometry(LineStringZ, 4326), -- Trayectoria 3D predicha
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_traj_gist ON predicted_trajectories_3d USING GIST (trajectory_line);

-- 5. Tabla de Alertas de Cuasi-Colisión y Atribución SHAP XAI
CREATE TABLE IF NOT EXISTS risk_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    target_equipment_id UUID REFERENCES equipment(id),
    risk_score DOUBLE PRECISION NOT NULL, -- 0.0 a 1.0
    risk_level VARCHAR(50) DEFAULT 'bajo', -- bajo, medio, alto, critico
    prediction_horizon_sec DOUBLE PRECISION DEFAULT 6.4, -- Lead time
    shap_factors_json TEXT NOT NULL,
    scenario_type VARCHAR(100) DEFAULT 'Cruce en Curva Ciega',
    is_active BOOLEAN DEFAULT TRUE,
    avoided_successfully BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Registro de Auditoría e Histórico Ético (Audit Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
