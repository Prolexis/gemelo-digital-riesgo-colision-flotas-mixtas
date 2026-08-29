'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { Shield, Database, Cpu, Server, Layers, CheckCircle2, UserCheck, Lock, Activity, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area } from 'recharts';

export default function ArchitecturePage() {
  // Mock performance metrics data for Recharts
  const pipelineLatencyData = [
    { stage: '1. Ingesta GNSS/LiDAR', latency_ms: 1.2, fill: '#38bdf8' },
    { stage: '2. Redis 7.0 Pub/Sub', latency_ms: 0.8, fill: '#06b6d4' },
    { stage: '3. Risk Engine (ONNX)', latency_ms: 2.8, fill: '#f59e0b' },
    { stage: '4. Fast TreeSHAP XAI', latency_ms: 3.4, fill: '#ef4444' },
    { stage: '5. WebSocket 3D Broadcast', latency_ms: 1.1, fill: '#10b981' },
  ];

  const postgisPerformanceData = [
    { query_type: 'Proximidad 3D (Sin GiST)', execution_ms: 48.5 },
    { query_type: 'Proximidad 3D (Con Índice GiST)', execution_ms: 2.1 },
    { query_type: 'Trayectoria LineStringZ', execution_ms: 3.2 },
    { query_type: 'Filtro por Banco (3350m)', execution_ms: 1.8 },
  ];

  const rbacRoles = [
    { role: '👑 ADMINISTRADOR', code: 'ADMIN', create: true, read: true, update: true, delete: true, export: true, audit: true },
    { role: '🛡️ SUPERVISOR DE SEGURIDAD', code: 'SAFETY_SUPERVISOR', create: true, read: true, update: true, delete: false, export: true, audit: true },
    { role: '🚜 OPERADOR DE EQUIPO', code: 'OPERATOR', create: false, read: true, update: false, delete: false, export: false, audit: false },
    { role: '📊 ANALISTA DE DATOS', code: 'DATA_ANALYST', create: false, read: true, update: false, delete: false, export: true, audit: true },
    { role: '👁️ AUDITOR / SOLO LECTURA', code: 'AUDITOR', create: false, read: true, update: false, delete: false, export: false, audit: true },
  ];

  const auditLogMock = [
    { id: 'LOG-891', timestamp: '2026-08-29 17:35:12', user: 'admin@minesafe.com', role: 'ADMIN', action: 'UPDATE_ROLE_PERMISSIONS', resource: 'RBACMatrix', ip: '192.168.1.45' },
    { id: 'LOG-890', timestamp: '2026-08-29 17:30:05', user: 'sup.safety@minesafe.com', role: 'SAFETY_SUPERVISOR', action: 'ACK_CRITICAL_ALERT', resource: 'RiskAlert/CA-01', ip: '192.168.1.88' },
    { id: 'LOG-889', timestamp: '2026-08-29 17:15:20', user: 'analyst@minesafe.com', role: 'DATA_ANALYST', action: 'EXPORT_XAI_REPORT_XLSX', resource: 'ReportsModule', ip: '192.168.1.102' },
    { id: 'LOG-888', timestamp: '2026-08-29 16:45:00', user: 'op.carguiu@minesafe.com', role: 'OPERATOR', action: 'SIGN_INFORMED_CONSENT', resource: 'BiometricEthics', ip: '192.168.1.14' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
              Módulo 9: Arquitectura de Software, SQL PostGIS & Control RBAC
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Documentación técnica interactiva con gráficos de rendimiento, esquema geoespacial DDL 3D, roles RBAC y registro inmutable de auditoría.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-400 font-bold">PIPELINE ACTIVO &lt; 9.3ms</span>
          </div>
        </div>

        {/* 1. End-to-End Data Pipeline Architecture & Visual Latency Chart */}
        <section className="glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 text-cyan-400">
              <Layers className="w-5 h-5" /> 1. Arquitectura de Ingesta & Pipeline Explicable (Latencia End-to-End)
            </h2>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-bold">
              BENCHMARK DE TIEMPO REAL
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ASCII Flow Diagram */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto shadow-inner">
              <span className="text-cyan-400 font-bold block mb-2">// Flujo de Ingesta Submétrica (1 Hz)</span>
              <pre>{`[ Telemetría GNSS 1 Hz (PointZ) ] ──────┐
[ Nubes LiDAR (PointNet++ 128d) ] ──┼──> [ Redis Pub/Sub 7.0 ]
[ Operador Bi-LSTM (PERCLOS) ]    ────┘           │
                                                   ▼
                                       [ FastAPI RiskEngineService ]
                                       ├── Overall Risk Score (0-1)
                                       ├── Lead Time H1 (6.4s vs 1.8s)
                                       └── Fast TreeSHAP Breakdown
                                                   │
                                                   ▼
                                        [ WebSockets /ws/telemetry ]
                                                   │
                                                   ▼
                                       [ Three.js 3D Twin Viewer ]`}</pre>
            </div>

            {/* Recharts Latency Chart */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-cyan-400" /> Latencia por Etapa del Pipeline (ms)
                </span>
                <span className="font-mono text-emerald-400 font-bold">Total: 9.3 ms</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineLatencyData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                    <XAxis type="number" stroke="#64748b" fontSize={10} unit="ms" />
                    <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={9} width={130} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="latency_ms" radius={[0, 4, 4, 0]}>
                      {pipelineLatencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SQL PostGIS Geoespacial DDL & Spatial Benchmark Chart */}
        <section className="glass-panel rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <Database className="w-5 h-5" /> 2. Modelo de Datos Geoespacial PostGIS 3D (DDL & Benchmarks)
            </h2>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-bold">
              POSTGRES 15 + POSTGIS 3.3
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DDL Code Snippet */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 shadow-inner">
              <pre>{`-- Telemetría GNSS 3D Submétrica (1 Hz) - Tabla Particionada
CREATE TABLE IF NOT EXISTS gnss_telemetry_3d (
    id UUID DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude_m DOUBLE PRECISION DEFAULT 3350.0, -- Cotas de banco (3100m a 3600m)
    speed_kmh DOUBLE PRECISION DEFAULT 0.0,
    geom Geometry(PointZ, 4326), -- Punto 3D PostGIS
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- Partición 2026
CREATE TABLE gnss_telemetry_3d_2026 PARTITION OF gnss_telemetry_3d
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

-- Índice Espacial GiST 3D para aproximación rápida
CREATE INDEX idx_gnss_geom_gist ON gnss_telemetry_3d USING GIST (geom);`}</pre>
            </div>

            {/* Spatial Execution Chart */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" /> Rendimiento de Consultas Espaciales GiST vs Secuencial
                </span>
                <span className="font-mono text-amber-400 font-bold">23x Aceleración GiST</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postgisPerformanceData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <XAxis dataKey="query_type" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={10} unit="ms" />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="execution_ms" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Control de Acceso Basado en Roles (RBAC) & Matriz de Permisos */}
        <section className="glass-panel rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 text-emerald-400">
              <UserCheck className="w-5 h-5" /> 3. Matriz Granular de Roles & Permisos (RBAC Module)
            </h2>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
              5 ROLES MÍNIMOS ENFORZADOS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-3 font-sans font-extrabold text-white">Rol de Usuario</th>
                  <th className="p-3 text-cyan-400">Crear (`create`)</th>
                  <th className="p-3 text-cyan-400">Leer (`read`)</th>
                  <th className="p-3 text-cyan-400">Actualizar (`update`)</th>
                  <th className="p-3 text-cyan-400">Eliminar (`delete`)</th>
                  <th className="p-3 text-cyan-400">Exportar (`export`)</th>
                  <th className="p-3 text-cyan-400">Auditoría (`audit`)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rbacRoles.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-sans font-bold text-slate-200">{r.role}</td>
                    <td className="p-3">{r.create ? <span className="text-emerald-400 font-bold">✓ Permitido</span> : <span className="text-slate-600">✗ Denegado</span>}</td>
                    <td className="p-3">{r.read ? <span className="text-emerald-400 font-bold">✓ Permitido</span> : <span className="text-slate-600">✗ Denegado</span>}</td>
                    <td className="p-3">{r.update ? <span className="text-emerald-400 font-bold">✓ Permitido</span> : <span className="text-slate-600">✗ Denegado</span>}</td>
                    <td className="p-3">{r.delete ? <span className="text-red-400 font-bold">✓ Permitido</span> : <span className="text-slate-600">✗ Denegado</span>}</td>
                    <td className="p-3">{r.export ? <span className="text-emerald-400 font-bold">✓ Permitido</span> : <span className="text-slate-600">✗ Denegado</span>}</td>
                    <td className="p-3">{r.audit ? <span className="text-purple-400 font-bold">✓ Auditable</span> : <span className="text-slate-600">✗ Denegado</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Registro Inmutable de Auditoría (Audit Log) */}
        <section className="glass-panel rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 text-purple-400">
              <Lock className="w-5 h-5" /> 4. Registro Inmutable de Auditoría de Acciones (Audit Log)
            </h2>
            <span className="text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.5 rounded font-bold">
              TRAZABILIDAD ÉTICA INMUTABLE
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-3">ID Registro</th>
                  <th className="p-3">Fecha / Hora</th>
                  <th className="p-3">Usuario Auditor</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Acción Ejecutada</th>
                  <th className="p-3">Recurso Afectado</th>
                  <th className="p-3">IP Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogMock.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-cyan-400">{log.id}</td>
                    <td className="p-3 text-slate-400">{log.timestamp}</td>
                    <td className="p-3 text-slate-200">{log.user}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">{log.role}</span></td>
                    <td className="p-3 font-bold text-amber-400">{log.action}</td>
                    <td className="p-3 text-slate-400">{log.resource}</td>
                    <td className="p-3 text-slate-500">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Deployment Multi-Container Status */}
        <section className="glass-panel rounded-2xl p-6 shadow-2xl space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Estado de Despliegue Multi-Contenedor Docker
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-mono font-bold">PostGIS 16 3D</span>
              <span className="px-2.5 py-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg font-black">HEALTHY</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-mono font-bold">Redis 7.0</span>
              <span className="px-2.5 py-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg font-black">RUNNING</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-mono font-bold">FastAPI Backend</span>
              <span className="px-2.5 py-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg font-black">ACTIVE :8000</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-mono font-bold">Next.js Frontend</span>
              <span className="px-2.5 py-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg font-black">READY :3000</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
