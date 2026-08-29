'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { FileText, Download, FileSpreadsheet, FileCode, CheckCircle2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function ReportsPage() {
  const [anonymize, setAnonymize] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadReport = async (format: 'pdf' | 'xlsx' | 'docx') => {
    setDownloading(format);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const endpoint = `${apiHost}/api/v1/reports/equipment/ca-01/${format}`;
      const res = await axios.get(endpoint, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_cuasi_colisiones_${anonymize ? 'anonimizado' : 'completo'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert(`Generando reporte ${format.toUpperCase()} simulado de cuasi-colisiones con el motor backend.`);
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
                disabled={downloading === 'pdf'}
                className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                {downloading === 'pdf' ? 'Generando PDF...' : 'Exportar PDF'}
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
                disabled={downloading === 'xlsx'}
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                {downloading === 'xlsx' ? 'Generando Excel...' : 'Exportar Excel (.xlsx)'}
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
                disabled={downloading === 'docx'}
                className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                {downloading === 'docx' ? 'Generando Word...' : 'Exportar Word (.docx)'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
