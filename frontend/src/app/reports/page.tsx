'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { FileText, Download, FileSpreadsheet, FileCode, CheckCircle2, ShieldCheck, AlertCircle, Lock, BarChart2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function ReportsPage() {
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canExport = hasPermission('export');

  const [anonymize, setAnonymize] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const downloadReport = async (format: 'pdf' | 'xlsx' | 'docx') => {
    if (!canExport) {
      setStatusMessage({
        type: 'error',
        text: `El rol actual (${user?.role || 'solo_lectura'}) no posee permisos granulares para exportar reportes. Contacta al Administrador.`,
      });
      return;
    }

    setDownloading(format);
    setStatusMessage(null);

    try {
      const endpoint = `/reports/risk-twin/${format}?anonymize=${anonymize}`;
      const res = await api.get(endpoint, { responseType: 'blob' });

      // Detect if backend returned a JSON error wrapped as blob
      if (res.data.type === 'application/json') {
        const text = await res.data.text();
        const json = JSON.parse(text);
        throw new Error(json.detail || 'Error desconocido del servidor');
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
      link.setAttribute('download', `reporte_cuasi_colisiones_${anonymize ? 'anonimizado' : 'completo'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: `¡Reporte ${format.toUpperCase()} generado y descargado con éxito!`,
      });
    } catch (e: any) {
      console.error('Error generando reporte:', e);
      const errMsg = e.response?.data?.detail || e.message || `Error descargando reporte ${format.toUpperCase()}.`;
      setStatusMessage({
        type: 'error',
        text: `Error al descargar ${format.toUpperCase()}: ${errMsg}`,
      });
    } finally {
      setDownloading(null);
    }
  };

  const reportFrequencyData = [
    { month: 'May 2026', pdf: 24, xlsx: 18, docx: 12 },
    { month: 'Jun 2026', pdf: 32, xlsx: 28, docx: 15 },
    { month: 'Jul 2026', pdf: 45, xlsx: 35, docx: 22 },
    { month: 'Ago 2026', pdf: 58, xlsx: 48, docx: 30 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400 animate-pulse" />
            Módulo 6: Reportes & Exportación Multiformato (PDF / Excel / Word)
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Generación parametrizable de informes documentados de cuasi-colisiones, tiempos de alerta anticipada (Lead Time H1) y atribución de riesgo SHAP.
          </p>
        </div>

        {!canExport && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center gap-3 text-xs font-semibold shadow-lg">
            <Lock className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span>
              Restricción de Permisos RBAC: Tu rol actual (<strong className="uppercase font-mono">{user?.role}</strong>) no tiene permisos de exportación habilitados. Puedes cambiar a Administrador, Supervisor o Analista en tu Perfil para habilitar la descarga.
            </span>
          </div>
        )}

        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold shadow-lg ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Download Options Panel */}
        <div className="glass-panel border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-black text-white">Parámetros del Reporte de Cuasi-Colisiones</h2>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors">
              <input
                type="checkbox"
                checked={anonymize}
                onChange={(e) => setAnonymize(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 cursor-pointer"
              />
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">Anonimizar Operadores (Hashes SHA-256)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PDF Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-red-500/50 transition-all shadow-xl">
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 w-fit">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white">Reporte PDF Formal</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Documento formal de auditoría de seguridad con membrete corporativo, parámetros de tajo y desglose SHAP.</p>
              </div>

              <button
                onClick={() => downloadReport('pdf')}
                disabled={downloading === 'pdf' || !canExport}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  canExport
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Download className="w-4 h-4" />
                {!canExport
                  ? 'Permiso Requerido'
                  : downloading === 'pdf'
                  ? 'Generando PDF...'
                  : 'Exportar PDF'}
              </button>
            </div>

            {/* Excel Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all shadow-xl">
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white">Planilla Excel (4 Hojas)</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Libro de cálculo estructurado en 4 pestañas: Telemetría 1Hz, Log XAI, Benchmark PDS y Registro Ético.</p>
              </div>

              <button
                onClick={() => downloadReport('xlsx')}
                disabled={downloading === 'xlsx' || !canExport}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  canExport
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Download className="w-4 h-4" />
                {!canExport
                  ? 'Permiso Requerido'
                  : downloading === 'xlsx'
                  ? 'Generando Excel...'
                  : 'Exportar Excel (.xlsx)'}
              </button>
            </div>

            {/* Word Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all shadow-xl">
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                  <FileCode className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white">Documento Word (.docx)</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">Informe de gerencia editable para el comité de investigación de incidentes MSHA.</p>
              </div>

              <button
                onClick={() => downloadReport('docx')}
                disabled={downloading === 'docx' || !canExport}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  canExport
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Download className="w-4 h-4" />
                {!canExport
                  ? 'Permiso Requerido'
                  : downloading === 'docx'
                  ? 'Generando Word...'
                  : 'Exportar Word (.docx)'}
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Analytics: Report Generation Statistics */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" /> Estadísticas de Exportación por Formato (Últimos 4 Meses)
            </h3>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-1 rounded-lg font-bold">
              HISTÓRICO GENERACIONES
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportFrequencyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="pdf" name="PDF Formales" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="xlsx" name="Excel 4-Hojas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="docx" name="Word Editables" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

