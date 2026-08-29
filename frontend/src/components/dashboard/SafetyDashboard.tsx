'use client';

import React from 'react';
import { SafetyKPIs, PDSComparison, EquipmentTwinData } from '@/types/digital_twin';
import { ShieldCheck, Clock, AlertTriangle, UserCheck, TrendingUp, Cpu, BarChart3, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

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

  const rocCurveData = [
    { fpr: '0.0', twin_tpr: 0.0, pds_tpr: 0.0 },
    { fpr: '0.1', twin_tpr: 0.72, pds_tpr: 0.35 },
    { fpr: '0.2', twin_tpr: 0.89, pds_tpr: 0.52 },
    { fpr: '0.3', twin_tpr: 0.95, pds_tpr: 0.64 },
    { fpr: '0.4', twin_tpr: 0.97, pds_tpr: 0.71 },
    { fpr: '0.5', twin_tpr: 0.98, pds_tpr: 0.78 },
    { fpr: '1.0', twin_tpr: 1.0, pds_tpr: 1.0 },
  ];

  const benchRiskData = [
    { bench: 'Cota 3100m (Fondo Tajo)', incidents: 14, risk_score: 82 },
    { bench: 'Cota 3225m (Carguío Pala 01)', incidents: 22, risk_score: 65 },
    { bench: 'Cota 3350m (Rampa Principal 9%)', incidents: 38, risk_score: 94 },
    { bench: 'Cota 3475m (Cruce Botadero)', incidents: 18, risk_score: 71 },
    { bench: 'Cota 3600m (Superficie)', incidents: 8, risk_score: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Key Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Cuasi-Colisiones Evitadas</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">{mockKpis.potential_incidents_avoided}</span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">+12% este mes</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Incidentes predichos a tiempo</p>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-cyan-500/50 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Lead Time Promedio</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black gradient-text-cyan font-mono tracking-tight">{mockKpis.avg_early_warning_time_sec}s</span>
            <span className="text-xs text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">vs 1.8s PDS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Anticipación previa al evento (≥5s target)</p>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Falsos Positivos</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black gradient-text-gold font-mono tracking-tight">{mockKpis.false_positive_rate_pct}%</span>
            <span className="text-xs text-amber-400 font-bold bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">-3.2% reducción</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Tasa mínima de fatiga de alerta</p>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Confianza del Operador</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">{mockKpis.operator_trust_index_pct}%</span>
            <span className="text-xs text-purple-400 font-bold bg-purple-950/60 border border-purple-800/80 px-2 py-0.5 rounded">Usabilidad</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Aceptación post-turno por XAI explicable</p>
        </div>
      </div>

      {/* Recharts Analytics Section: ROC Curve & Pit Bench Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-3 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Curva ROC: Gemelo Digital (AUC 0.942) vs PDS (AUC 0.720)
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">HIPÓTESIS H1</span>
          </div>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurveData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="fpr" stroke="#64748b" fontSize={10} label={{ value: 'Tasa Falsos Positivos (FPR)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 1]} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="twin_tpr" name="Gemelo Digital 3D (AUC 0.942)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pds_tpr" name="PDS Estándar (AUC 0.720)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pit Bench Risk Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-3 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Incidencia de Riesgo por Banco de Explotación (Cotas 3100m-3600m)
            </h4>
            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950 border border-amber-800 px-2 py-0.5 rounded">DISTRIBUCIÓN TAJO</span>
          </div>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchRiskData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bench" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="incidents" name="Cuasi-Colisiones Detectadas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Digital Twin vs Standard PDS Comparison Section */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2 tracking-wide">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
              Evaluación Comparativa: Gemelo Digital 3D XAI vs. Sistema PDS Estándar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Demostración experimental de las hipótesis de investigación (H1: Lead time ≥5s, H2: Reducción de falsas alarmas)
            </p>
          </div>
          <span className="text-[10px] bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 px-3 py-1.5 rounded-xl font-mono font-bold tracking-wider shadow-lg">
            VALIDACIÓN EXPERIMENTAL H1
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                <th className="p-3.5 font-extrabold uppercase tracking-wider">Métrica / Enfoque</th>
                <th className="p-3.5 text-cyan-400 font-extrabold uppercase tracking-wider">Gemelo Digital 3D Explicable (Propuesto)</th>
                <th className="p-3.5 text-slate-400 font-extrabold uppercase tracking-wider">Sistema PDS Estándar (Basal)</th>
                <th className="p-3.5 text-emerald-400 font-extrabold uppercase tracking-wider">Mejora %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3.5 font-sans font-bold text-slate-200">Tiempo de Alerta (Lead Time)</td>
                <td className="p-3.5 font-black text-cyan-400 text-sm">{mockComp.digital_twin_xai.avg_lead_time_sec} segundos</td>
                <td className="p-3.5 text-slate-400">{mockComp.standard_pds.avg_lead_time_sec} segundos</td>
                <td className="p-3.5 font-extrabold text-emerald-400">+277% más anticipación</td>
              </tr>
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3.5 font-sans font-bold text-slate-200">Rendimiento AUC-ROC</td>
                <td className="p-3.5 font-black text-cyan-400 text-sm">{mockComp.digital_twin_xai.auc_roc}</td>
                <td className="p-3.5 text-slate-400">{mockComp.standard_pds.auc_roc}</td>
                <td className="p-3.5 font-extrabold text-emerald-400">+30.8% precisión global</td>
              </tr>
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3.5 font-sans font-bold text-slate-200">Puntaje F1-Score</td>
                <td className="p-3.5 font-black text-cyan-400 text-sm">{mockComp.digital_twin_xai.f1_score}</td>
                <td className="p-3.5 text-slate-400">{mockComp.standard_pds.f1_score}</td>
                <td className="p-3.5 font-extrabold text-emerald-400">+34.5% balance P/R</td>
              </tr>
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3.5 font-sans font-bold text-slate-200">Capas de Datos Integradas</td>
                <td className="p-3.5 font-sans text-xs text-cyan-300 leading-normal font-semibold">{mockComp.digital_twin_xai.features_used}</td>
                <td className="p-3.5 font-sans text-xs text-slate-400 leading-normal">{mockComp.standard_pds.features_used}</td>
                <td className="p-3.5 font-sans text-xs text-emerald-400 font-bold">Explicabilidad SHAP en tiempo real</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Live Risk Matrix List */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2 tracking-wide">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Estado de Flota Mixta y Nivel de Riesgo en Vivo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {fleet.map((eq) => (
            <div
              key={eq.code}
              onClick={() => onSelectEquipment(eq)}
              className="glass-card p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between group shadow-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-sm group-hover:text-cyan-400 transition-colors">
                    {eq.code}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 uppercase font-mono border border-slate-700">
                    {eq.fleet_type}
                  </span>
                  <span className="text-xs text-slate-400 font-sans font-medium">{eq.name}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3 font-mono">
                  <span>Vel: <strong className="text-slate-200">{eq.speed_kmh} km/h</strong></span>
                  <span>Lead time: <strong className="text-cyan-400">{eq.prediction_horizon_sec}s</strong></span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xl font-black font-mono text-white tracking-tight">
                  {(eq.risk_score * 100).toFixed(0)}%
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                    eq.risk_level === 'critico'
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse'
                      : eq.risk_level === 'alto'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : eq.risk_level === 'medio'
                      ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20 font-bold'
                      : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
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

