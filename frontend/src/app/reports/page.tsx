'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { FileText, Download, FileSpreadsheet, FileCode, CheckCircle2, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Módulo de Reportes Multiformato (PDF / Excel / Word)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generación de reportes documentados de cuasi-colisiones, tiempos de alerta (Lead Time) y atribución de riesgo SHAP.
          </p>
        </div>

        {!canExport && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center gap-3 text-xs font-semibold">
            <Lock className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span>
              Restricción de Permisos RBAC: Tu rol actual (<strong className="uppercase">{user?.role}</strong>) no tiene permisos de exportación habilitados. Puedes cambiar a Administrador, Supervisor o Analista en tu Perfil para habilitar la descarga.
            </span>
          </div>
        )}

        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
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

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white">Parámetros del Reporte de Cuasi-Colisiones</h2>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={anonymize}
                onChange={(e) => setAnonymize(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Anonimizar Operadores (Ética)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PDF Card */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-red-500/50 transition-all">
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-red-500/10 text-red-400 w-fit">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Reporte PDF</h3>
                <p className="text-xs text-slate-400">Documento formal de auditoría de seguridad con tablas e histograma SHAP.</p>
              </div>

              <button
                onClick={() => downloadReport('pdf')}
                disabled={downloading === 'pdf' || !canExport}
                className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  canExport
                    ? 'bg-red-600 hover:bg-red-500 text-white'
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
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all">
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Planilla Excel (.xlsx)</h3>
                <p className="text-xs text-slate-400">Telemetría cruda, serie de tiempo de fatiga y matriz de riesgo exportable.</p>
              </div>

              <button
                onClick={() => downloadReport('xlsx')}
                disabled={downloading === 'xlsx' || !canExport}
                className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  canExport
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all">
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 w-fit">
                  <FileCode className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Documento Word (.docx)</h3>
                <p className="text-xs text-slate-400">Informe de gerencia editable para el comité de investigación de incidentes.</p>
              </div>

              <button
                onClick={() => downloadReport('docx')}
                disabled={downloading === 'docx' || !canExport}
                className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  canExport
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
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
      </main>
    </div>
  );
}

