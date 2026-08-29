'use client';

import React, { useState } from 'react';
import { EquipmentTwinData, SHAPFactor } from '@/types/digital_twin';
import { X, ShieldAlert, Cpu, Activity, UserCheck, AlertTriangle, Eye, Clock, Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import { api } from '@/lib/api';

interface SHAPExplanationDrawerProps {
  equipment: EquipmentTwinData | null;
  onClose: () => void;
}

export default function SHAPExplanationDrawer({
  equipment,
  onClose,
}: SHAPExplanationDrawerProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!equipment) return null;

  const handleDownloadReport = async (format: 'pdf' | 'xlsx' | 'docx') => {
    setDownloadingFormat(format);
    try {
      const endpoint = `/reports/equipment/${equipment.code}/${format}`;
      const res = await api.get(endpoint, { responseType: 'blob' });

      if (res.data.type === 'application/json') {
        const text = await res.data.text();
        const json = JSON.parse(text);
        throw new Error(json.detail || 'Error en el servidor');
      }

      const mimeTypes = {
        pdf: 'application/pdf',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };

      const blob = new Blob([res.data], { type: mimeTypes[format] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${equipment.code}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('Error descargando reporte del equipo:', e);
      alert(`Error descargando reporte ${format.toUpperCase()} para ${equipment.code}.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

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
    <div className="fixed inset-y-0 right-0 w-full max-w-lg z-50 glass-panel border-l border-cyan-500/30 shadow-2xl overflow-y-auto flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${colors.bg} ${colors.border} shadow-lg`}>
            <ShieldAlert className={`w-6 h-6 ${colors.text} animate-pulse`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-wide">{equipment.code}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-bold uppercase border border-slate-700">
                {equipment.fleet_type}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{equipment.name} • {equipment.equipment_type.toUpperCase()}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1">
        {/* Risk Score & Lead Time Prediction Box */}
        <div className={`p-5 rounded-2xl border ${colors.bg} ${colors.border} space-y-3 shadow-xl`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Riesgo de Colisión Predicho
            </span>
            <span className={`px-3 py-1 text-xs font-black rounded-xl uppercase tracking-wider ${colors.badge} shadow-md`}>
              {equipment.risk_level}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono tracking-tight">
                {(equipment.risk_score * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-semibold">Score Inferencia</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 gradient-text-cyan text-sm font-black font-mono">
                <Clock className="w-4 h-4 text-cyan-400" /> {equipment.prediction_horizon_sec}s
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Lead Time (≥5s target)</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                equipment.risk_level === 'critico' ? 'bg-gradient-to-r from-red-600 to-orange-500 shadow-lg shadow-red-500/50' :
                equipment.risk_level === 'alto' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                equipment.risk_level === 'medio' ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${equipment.risk_score * 100}%` }}
            />
          </div>
        </div>

        {/* Quick Report Download Actions */}
        <div className="glass-card p-4 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <Download className="w-4 h-4 text-cyan-400" /> Exportar Reporte de Equipo
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-800 px-2 py-0.5 rounded">PDF / Excel / Word</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDownloadReport('pdf')}
              disabled={downloadingFormat === 'pdf'}
              className="py-2.5 px-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <FileText className="w-4 h-4" />
              {downloadingFormat === 'pdf' ? 'PDF...' : 'PDF'}
            </button>

            <button
              onClick={() => handleDownloadReport('xlsx')}
              disabled={downloadingFormat === 'xlsx'}
              className="py-2.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {downloadingFormat === 'xlsx' ? 'Excel...' : 'Excel'}
            </button>

            <button
              onClick={() => handleDownloadReport('docx')}
              disabled={downloadingFormat === 'docx'}
              className="py-2.5 px-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <FileCode className="w-4 h-4" />
              {downloadingFormat === 'docx' ? 'Word...' : 'Word'}
            </button>
          </div>
        </div>

        {/* SHAP Explanation Breakdown Section */}
        <div className="glass-card p-5 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-black text-white tracking-wide">Explicabilidad XAI (Atribución TreeSHAP)</h3>
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-md font-mono font-bold">
              POR QUÉ ES ALTO
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Contribución porcentual de cada variable del operador, vehículo y entorno en el score de riesgo predicho:
          </p>

          <div className="space-y-3.5 pt-1">
            {equipment.shap_factors.map((factor, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-200">{factor.feature_name}</span>
                  <span className="font-mono text-cyan-400 font-black">
                    +{factor.weight_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, factor.weight_percentage * 2.2)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono leading-tight">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Perception & Behavior Layers Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
              <Eye className="w-4 h-4 text-indigo-400" /> Perception LiDAR
            </div>
            <p className="text-xs text-slate-400 leading-snug font-medium">
              {equipment.perception_summary || 'Feature LiDAR PointNet++ activo.'}
            </p>
          </div>

          <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
              <Activity className="w-4 h-4 text-amber-400" /> Behavior LSTM
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Score Maniobra Operador: <span className="font-mono font-bold text-white">{((equipment.behavior_score || 0.3) * 100).toFixed(0)}%</span>
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="glass-card p-4 rounded-2xl space-y-2 border-amber-500/30">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Acción de Seguridad Recomendada
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            {equipment.recommended_action}
          </p>
        </div>
      </div>
    </div>
  );
}

