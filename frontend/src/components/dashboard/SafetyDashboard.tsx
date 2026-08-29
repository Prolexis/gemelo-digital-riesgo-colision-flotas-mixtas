'use client';

import React from 'react';
import { SafetyKPIs, PDSComparison, EquipmentTwinData } from '@/types/digital_twin';
import { ShieldCheck, Clock, AlertTriangle, UserCheck, TrendingUp, Cpu, CheckCircle2 } from 'lucide-react';

interface SafetyDashboardProps {
  kpis: SafetyKPIs | null;
  comparison: PDSComparison | null;
  fleet: EquipmentTwinData[];
  onSelectEquipment: (eq: EquipmentTwinData) => void;
}

export default function SafetyDashboard({
  kpis,
  comparison,
  fleet,
  onSelectEquipment,
}: SafetyDashboardProps) {
  const mockKpis: SafetyKPIs = kpis || {
    potential_incidents_avoided: 42,
    total_alerts_issued: 48,
    false_positive_rate_pct: 4.1,
    avg_early_warning_time_sec: 6.8,
    operator_trust_index_pct: 91.5,
  };

  const mockComp: PDSComparison = comparison || {
    digital_twin_xai: {
      avg_lead_time_sec: 6.8,
      auc_roc: 0.942,
      f1_score: 0.915,
      precision: 0.930,
      recall: 0.901,
      features_used: 'GNSS 1Hz + LiDAR PointNet++ + Operator Fatigue LSTM + XAI SHAP',
    },
    standard_pds: {
      avg_lead_time_sec: 1.8,
      auc_roc: 0.720,
      f1_score: 0.680,
      precision: 0.710,
      recall: 0.650,
      features_used: 'Solo Proximidad GNSS Reactiva',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Key Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cuasi-Colisiones Evitadas</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{mockKpis.potential_incidents_avoided}</span>
            <span className="text-xs text-emerald-400 font-semibold">+12% este mes</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Incidentes predichos a tiempo</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lead Time Promedio</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{mockKpis.avg_early_warning_time_sec}s</span>
            <span className="text-xs text-cyan-400 font-semibold">vs 1.8s PDS</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Anticipación previa al evento (≥5s target)</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Falsos Positivos</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{mockKpis.false_positive_rate_pct}%</span>
            <span className="text-xs text-amber-400 font-semibold">-3.2% reducción</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tasa mínima de fatiga de alerta</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confianza del Operador</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{mockKpis.operator_trust_index_pct}%</span>
            <span className="text-xs text-purple-400 font-semibold">Métrica Usabilidad</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Aceptación post-turno por XAI explicable</p>
        </div>
      </div>

      {/* Digital Twin vs Standard PDS Comparison Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Evaluación Comparativa: Gemelo Digital 3D XAI vs. Sistema PDS Estándar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demostración experimental de las hipótesis de investigación (H1: Lead time ≥5s, H2: Reducción de falsas alarmas)
            </p>
          </div>
          <span className="text-xs bg-cyan-950 border border-cyan-800 text-cyan-400 px-3 py-1 rounded-full font-mono font-semibold">
            VALIDACIÓN EXPERIMENTAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="p-3">Métrica / Enfoque</th>
                <th className="p-3 text-cyan-400">Gemelo Digital 3D Explicable (Propuesto)</th>
                <th className="p-3 text-slate-400">Sistema PDS Estándar (Basal)</th>
                <th className="p-3 text-emerald-400">Mejora %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="p-3 font-sans font-medium text-slate-200">Tiempo de Alerta (Lead Time)</td>
                <td className="p-3 font-bold text-cyan-400">{mockComp.digital_twin_xai.avg_lead_time_sec} segundos</td>
                <td className="p-3 text-slate-400">{mockComp.standard_pds.avg_lead_time_sec} segundos</td>
                <td className="p-3 font-bold text-emerald-400">+277% más anticipación</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-200">Rendimiento AUC-ROC</td>
                <td className="p-3 font-bold text-cyan-400">{mockComp.digital_twin_xai.auc_roc}</td>
                <td className="p-3 text-slate-400">{mockComp.standard_pds.auc_roc}</td>
                <td className="p-3 font-bold text-emerald-400">+30.8% precisión global</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-200">Puntaje F1-Score</td>
                <td className="p-3 font-bold text-cyan-400">{mockComp.digital_twin_xai.f1_score}</td>
                <td className="p-3 text-slate-400">{mockComp.standard_pds.f1_score}</td>
                <td className="p-3 font-bold text-emerald-400">+34.5% balance P/R</td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-medium text-slate-200">Capas de Datos Integradas</td>
                <td className="p-3 font-sans text-xs text-cyan-300 leading-normal">{mockComp.digital_twin_xai.features_used}</td>
                <td className="p-3 font-sans text-xs text-slate-400 leading-normal">{mockComp.standard_pds.features_used}</td>
                <td className="p-3 font-sans text-xs text-emerald-400">Explicabilidad SHAP en tiempo real</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Live Risk Matrix List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Estado de Flota Mixta y Nivel de Riesgo en Vivo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fleet.map((eq) => (
            <div
              key={eq.code}
              onClick={() => onSelectEquipment(eq)}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {eq.code}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-mono">
                    {eq.fleet_type}
                  </span>
                  <span className="text-xs text-slate-400 font-sans">{eq.name}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span>Vel: {eq.speed_kmh} km/h</span>
                  <span>Lead time: {eq.prediction_horizon_sec}s</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-lg font-extrabold font-mono text-white">
                  {(eq.risk_score * 100).toFixed(0)}%
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    eq.risk_level === 'critico'
                      ? 'bg-red-500 text-white'
                      : eq.risk_level === 'alto'
                      ? 'bg-orange-500 text-white'
                      : eq.risk_level === 'medio'
                      ? 'bg-yellow-500 text-slate-950'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {eq.risk_level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
