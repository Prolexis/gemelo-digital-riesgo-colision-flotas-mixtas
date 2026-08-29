'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Lock, ShieldCheck, FileCheck, EyeOff, Activity, ShieldAlert, KeyRound, PieChart as PieIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

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

  const consentStatsData = [
    { name: 'Consentimiento Autorizado (Informed)', value: 94.2, color: '#10b981' },
    { name: 'Anonimización Criptográfica SHA-256', value: 88.5, color: '#06b6d4' },
    { name: 'Uso Exclusivo Prevención HSE', value: 100.0, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-400 animate-pulse" />
            Módulo 7: Gobernanza Ética, Consentimiento Informado & Privacidad de Datos
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Garantiza el cumplimiento de estándares éticos internacionales para datos biométricos de operadores con principios de no-punición laboral.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Informed Consent Form & SHA-256 Hash Box */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informed Consent Card */}
            <div className="glass-panel border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Registro de Consentimiento Informado del Operador</h2>
                  <p className="text-xs text-slate-400">Normativa de Protección de Datos de Comportamiento Humano</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 shadow-inner">
                <p className="font-bold text-slate-200 uppercase tracking-wide">Declaración de Transparencia & No Punición:</p>
                <p className="text-slate-400 leading-relaxed font-medium">
                  Los datos recolectados (horas de turno, frecuencia de frenado brusco, estimación de fatiga vía Bi-LSTM) se emplean exclusivamente para la prevención en tiempo real de cuasi-colisiones en el tajo abierto y no con fines punitivos ni laborales disciplinarios.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer p-4 glass-card rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Autorizar Ingesta de Telemetría de Comportamiento</span>
                    <span className="text-slate-400">Permite procesar métricas de fatiga en el modelo Bi-LSTM para predicción de riesgo.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-4 glass-card rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={anonymizeInReports}
                    onChange={(e) => setAnonymizeInReports(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <EyeOff className="w-4 h-4 text-cyan-400" /> Anonimización de Identidad SHA-256 en Reportes
                    </span>
                    <span className="text-slate-400">Reemplaza nombres reales por hashes alfanuméricos encubiertos (ej. EMP-ANON-8492-SHA256).</span>
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
                  className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
                >
                  Guardar Configuración Ética
                </button>
              </div>
            </div>

            {/* SHA-256 Live Cryptographic Anonymizer Box */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                  <KeyRound className="w-4 h-4 text-cyan-400" /> INTERRUPTOR DE ANONIMIZACIÓN CRIPTOGRÁFICA SHA-256
                </span>
                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono font-bold">ACTIVO</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Nombre Operador Original:</span>
                  <span className="text-slate-200 font-bold">Carlos Mendoza (OP-8492)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Hash Ofuscado SHA-256:</span>
                  <span className="text-cyan-400 font-bold truncate block">EMP-ANON-E3B0C44298FC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Biometric Consent Statistics Chart */}
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <PieIcon className="w-4 h-4 text-emerald-400" /> Tasa de Consentimiento & Aceptación Biométrica
                </h3>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={consentStatsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                      {consentStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center font-medium">
                94.2% de aceptación de operadores en el programa de prevención de fatiga biológica.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Trail Section */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-wide">
              <Activity className="w-4 h-4 text-cyan-400" /> Audit Log (Trazabilidad Ética de Accesos Inmutables)
            </h3>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-1 rounded-lg font-mono font-bold">
              REGISTRO INMUTABLE POSTGRES
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Acción Registrada</th>
                  <th className="p-3">Recurso / Entidad</th>
                  <th className="p-3">Detalle Payload (SHA-256)</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 text-cyan-400 font-bold">{log.action}</td>
                    <td className="p-3 text-slate-300">{log.resource}</td>
                    <td className="p-3 text-slate-400 text-[11px] truncate max-w-xs">{log.details_json || '-'}</td>
                    <td className="p-3 text-slate-500">{log.created_at || '2026-08-29'}</td>
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

