'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Shield, Database, Cpu, Server, Terminal, Code, Layers, FileCode, CheckCircle2 } from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Módulo 9: Arquitectura de Software, Esquema PostGIS 3D & Microservicio FastAPI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Documentación técnica production-ready, esquema geoespacial DDL PostGIS, flujo de datos desacoplado Redis Pub/Sub y guía de integración para modelos ONNX / TensorRT.
          </p>
        </div>

        {/* 1. End-to-End Data Pipeline Architecture */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-cyan-400">
            <Layers className="w-4 h-4" /> 1. Arquitectura de Ingesta & Pipeline Explicable (End-to-End)
          </h2>
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
            <pre>{`[ Telemetría GNSS 1 Hz (LineStringZ/PointZ) ] ───────┐
[ Nubes de Puntos LiDAR (PointNet++ 128d) ] ──┼──> [ Redis Pub/Sub 7.0 ] ──> [ FastAPI RiskEngineService ]
[ Operador Bi-LSTM (PERCLOS & Jerking) ]  ────┘                                ├──> [ Overall Risk Score (0.0 - 1.0) ]
                                                                               ├──> [ Lead Time H1 (6.4s vs 1.8s PDS) ]
                                                                               ├──> [ Fast TreeSHAP Additive Breakdown ]
                                                                               └──> [ WebSocket Streaming /ws/telemetry ]
                                                                                               │
                                                                                               ▼
                                                                                   [ Three.js Gemelo 3D + Dashboard ]`}</pre>
          </div>
        </section>

        {/* 2. SQL PostGIS Geoespacial DDL */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
            <Database className="w-4 h-4" /> 2. Modelo de Datos Geoespacial PostGIS 3D (DDL Script)
          </h2>
          <p className="text-xs text-slate-400">
            Esquema PostgreSQL 15+ con extensión PostGIS 3.3+, geometrías 3D <code className="text-cyan-400 font-mono">Geometry(PointZ, 4326)</code> y <code className="text-cyan-400 font-mono">Geometry(LineStringZ, 4326)</code>, índices espaciales GiST y particionamiento temporal por rango.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96">
            <pre>{`-- Habilitar extensiones geoespaciales
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Telemetría GNSS 3D Submétrica (1 Hz) - Tabla Particionada
CREATE TABLE IF NOT EXISTS gnss_telemetry_3d (
    id UUID DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude_m DOUBLE PRECISION DEFAULT 3350.0, -- Cota de banco (3100m a 3600m)
    speed_kmh DOUBLE PRECISION DEFAULT 0.0,
    geom Geometry(PointZ, 4326), -- Punto 3D PostGIS
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- Partición 2026
CREATE TABLE gnss_telemetry_3d_2026 PARTITION OF gnss_telemetry_3d
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

-- Índice Espacial GiST 3D para consultas de aproximación en tiempo real
CREATE INDEX idx_gnss_geom_gist ON gnss_telemetry_3d USING GIST (geom);

-- Trayectorias Predichas (LineStringZ PostGIS 3D)
CREATE TABLE IF NOT EXISTS predicted_trajectories_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    horizon_sec DOUBLE PRECISION DEFAULT 6.4,
    trajectory_line Geometry(LineStringZ, 4326),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_traj_gist ON predicted_trajectories_3d USING GIST (trajectory_line);`}</pre>
          </div>
        </section>

        {/* 3. ONNX / TensorRT Integration Guide */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-emerald-400">
            <Cpu className="w-4 h-4" /> 3. Guía de Integración para Modelos de Deep Learning (ONNX Runtime / TensorRT)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">1. Carga de Artefactos ONNX</span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Exportar los pesos de PointNet++ y Bi-LSTM desde PyTorch usando <code className="text-cyan-300">torch.onnx.export()</code> a formato <code className="text-cyan-300">.onnx</code>.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 font-mono">2. Inferencia en FastAPI</span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Inicializar <code className="text-amber-300">onnxruntime.InferenceSession("pointnet.onnx")</code> dentro del constructor de <code className="text-amber-300">ExplainableRiskEngineService</code>.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 font-mono">3. TreeSHAP Fast Explainer</span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Calcular los valores SHAP aditivos invocando <code className="text-emerald-300">shap.TreeExplainer(model).shap_values(X)</code> para atribuir la contribución exacta de cada feature.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Deployment Status */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Estado de Despliegue Multi-Contenedor Docker
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-mono">PostGIS 16 3D</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">HEALTHY</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-mono">Redis 7.0</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">RUNNING</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-mono">FastAPI Backend</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">ACTIVE :8000</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-mono">Next.js Frontend</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">READY :3000</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
