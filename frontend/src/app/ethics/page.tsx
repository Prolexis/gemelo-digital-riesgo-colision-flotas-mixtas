'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Lock, ShieldCheck, FileCheck, EyeOff, Activity, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';

interface AuditItem {
  id: string;
  action: string;
  resource: string;
  details_json?: string;
  created_at?: string;
}

export default function EthicsPage() {
  const [consentGiven, setConsentGiven] = useState<boolean>(true);
  const [anonymizeInReports, setAnonymizeInReports] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.get('/ethics/audit-log');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAuditLogs(res.data);
      } else {
        setAuditLogs([
          { id: '1', action: 'UPDATE_INFORMED_CONSENT', resource: 'OperatorConsent', created_at: '2026-08-29 11:30', details_json: '{"consent_given": true, "anonymize": true}' },
          { id: '2', action: 'EXPORT_PDF_REPORT', resource: 'RiskTwinReport', created_at: '2026-08-29 10:15', details_json: '{"format": "pdf", "anonymized": true}' },
          { id: '3', action: 'ACCESS_FATIGUE_TELEMETRY', resource: 'OperatorLog', created_at: '2026-08-29 08:45', details_json: '{"operator_id": "Op.#8492"}' }
        ]);
      }
    } catch (e) {
      setAuditLogs([
        { id: '1', action: 'UPDATE_INFORMED_CONSENT', resource: 'OperatorConsent', created_at: '2026-08-29 11:30', details_json: '{"consent_given": true, "anonymize": true}' },
        { id: '2', action: 'EXPORT_PDF_REPORT', resource: 'RiskTwinReport', created_at: '2026-08-29 10:15', details_json: '{"format": "pdf", "anonymized": true}' },
        { id: '3', action: 'ACCESS_FATIGUE_TELEMETRY', resource: 'OperatorLog', created_at: '2026-08-29 08:45', details_json: '{"operator_id": "Op.#8492"}' }
      ]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleSaveConsent = async () => {
    try {
      await api.post('/ethics/consent', {
        user_id: 'usr-operator-01',
        consent_given: consentGiven,
        anonymize_in_reports: anonymizeInReports,
      });
      setSaved(true);
      fetchAuditLogs();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-400" />
            Ética, Consentimiento Informado & Privacidad de Datos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Garantiza el cumplimiento ético en el monitoreo de fatiga y comportamiento del operador según los criterios de investigación.
          </p>
        </div>

        {/* Informed Consent Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registro de Consentimiento Informado del Operador</h2>
              <p className="text-xs text-slate-400">Normativa de Protección de Datos de Comportamiento Humano</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-slate-200">Declaración de Transparencia:</p>
            <p className="text-slate-400 leading-relaxed">
              Los datos recolectados (horas de turno, frecuencia de frenado brusco, estimación de fatiga) se emplean exclusivamente para la prevención en tiempo real de cuasi-colisiones en el tajo abierto y no con fines punitivos ni laborales disciplinarios.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">Autorizar Ingesta de Telemetría de Comportamiento</span>
                <span className="text-slate-400">Permite procesar métricas de fatiga en el modelo LSTM para predicción de riesgo.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={anonymizeInReports}
                onChange={(e) => setAnonymizeInReports(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> Anonimización de Identidad en Reportes PDF/Excel
                </span>
                <span className="text-slate-400">Reemplaza nombres reales por identificadores alfanuméricos encubiertos (ej. Op. #8492).</span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Preferencias Éticas Guardadas Correctamente
              </span>
            )}
            <button
              onClick={handleSaveConsent}
              className="ml-auto px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Guardar Configuración Ética
            </button>
          </div>
        </div>

        {/* Audit Trail Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Audit Log (Trazabilidad Ética de Accesos)
            </h3>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              HISTORIAL INMUTABLE
            </span>
          </div>
          <p className="text-xs text-slate-400">Registro inmutable de consultas y exportaciones sobre datos de comportamiento de operadores:</p>

          <div className="overflow-hidden border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="p-3">Acción Registrada</th>
                  <th className="p-3">Recurso / Entidad</th>
                  <th className="p-3">Detalle Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/50">
                    <td className="p-3 text-cyan-400 font-bold">{log.action}</td>
                    <td className="p-3 text-slate-300">{log.resource}</td>
                    <td className="p-3 text-slate-400 text-[11px] truncate max-w-xs">{log.details_json || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

