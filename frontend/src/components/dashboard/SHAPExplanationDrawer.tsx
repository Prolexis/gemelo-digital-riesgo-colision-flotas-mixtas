'use client';

import React from 'react';
import { EquipmentTwinData, SHAPFactor } from '@/types/digital_twin';
import { X, ShieldAlert, Cpu, Activity, UserCheck, AlertTriangle, Eye, Clock } from 'lucide-react';

interface SHAPExplanationDrawerProps {
  equipment: EquipmentTwinData | null;
  onClose: () => void;
}

export default function SHAPExplanationDrawer({
  equipment,
  onClose,
}: SHAPExplanationDrawerProps) {
  if (!equipment) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critico':
        return { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-400', badge: 'bg-red-500 text-white' };
      case 'alto':
        return { bg: 'bg-orange-500/10', border: 'border-orange-500', text: 'text-orange-400', badge: 'bg-orange-500 text-white' };
      case 'medio':
        return { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400', badge: 'bg-yellow-500 text-slate-950' };
      case 'bajo':
      default:
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500 text-white' };
    }
  };

  const colors = getRiskColor(equipment.risk_level);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg z-50 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl overflow-y-auto flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${colors.bg} ${colors.border}`}>
            <ShieldAlert className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">{equipment.code}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                {equipment.fleet_type}
              </span>
            </div>
            <p className="text-xs text-slate-400">{equipment.name} • {equipment.equipment_type.toUpperCase()}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1">
        {/* Risk Score & Lead Time Prediction Box */}
        <div className={`p-5 rounded-xl border ${colors.bg} ${colors.border} space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Riesgo de Colisión Predicho
            </span>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${colors.badge}`}>
              {equipment.risk_level}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono">
                {(equipment.risk_score * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">Score de Inferencia</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-cyan-400 text-sm font-bold font-mono">
                <Clock className="w-4 h-4" /> {equipment.prediction_horizon_sec}s
              </div>
              <span className="text-[10px] text-slate-400">Lead Time Anticipado (≥5s target)</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                equipment.risk_level === 'critico' ? 'bg-red-500' :
                equipment.risk_level === 'alto' ? 'bg-orange-500' :
                equipment.risk_level === 'medio' ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${equipment.risk_score * 100}%` }}
            />
          </div>
        </div>

        {/* SHAP Explanation Breakdown Section */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Explicabilidad XAI (Atribución SHAP)</h3>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              POR QUÉ ES ALTO
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Contribución porcentual de cada variable del operador, vehículo y entorno en el score de riesgo predicho:
          </p>

          <div className="space-y-3 pt-1">
            {equipment.shap_factors.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{factor.feature_name}</span>
                  <span className="font-mono font-bold text-cyan-300">
                    +{factor.weight_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, factor.weight_percentage * 2.2)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Perception & Behavior Layers Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <Eye className="w-4 h-4 text-indigo-400" /> Perception LiDAR
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              {equipment.perception_summary || 'Feature LiDAR PointNet++ activo.'}
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <Activity className="w-4 h-4 text-amber-400" /> Behavior LSTM
            </div>
            <p className="text-xs text-slate-300">
              Score Maniobra Operador: <span className="font-mono font-bold text-white">{((equipment.behavior_score || 0.3) * 100).toFixed(0)}%</span>
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Acción de Seguridad Recomendada
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
            {equipment.recommended_action}
          </p>
        </div>
      </div>
    </div>
  );
}
