'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore, Role } from '@/lib/authStore';
import { User, Shield, Mail, CheckCircle2, Lock, ShieldCheck, Check, X, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setRole = useAuthStore((state) => state.setRole);
  const updateUser = useAuthStore((state) => state.updateUser);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const rolesList: { role: Role; label: string; desc: string }[] = [
    { role: 'administrador', label: '👑 Administrador', desc: 'Acceso total a todos los módulos, usuarios y reportes.' },
    { role: 'supervisor_seguridad', label: '🛡️ Supervisor de Seguridad', desc: 'Monitoreo 3D, resolución de alertas y exportación XAI.' },
    { role: 'operador', label: '🚜 Operador de Equipo', desc: 'Monitoreo de fatiga, telemetría y consentimiento informado.' },
    { role: 'analista_datos', label: '📊 Analista de Datos', desc: 'Análisis de KPIs, modelos basal PDS vs Twin y estadísticas.' },
    { role: 'solo_lectura', label: '👁️ Solo Lectura', desc: 'Visualización de visor 3D sin permisos de modificación.' },
  ];

  const permissionsMatrix = [
    { key: 'read', label: 'Leer (Read)', desc: 'Visualizar gemelo 3D, alertas y gráficos' },
    { key: 'create', label: 'Crear (Create)', desc: 'Crear escenarios de riesgo y órdenes' },
    { key: 'update', label: 'Actualizar (Update)', desc: 'Modificar estado de equipos y parámetros' },
    { key: 'delete', label: 'Eliminar (Delete)', desc: 'Eliminar registros u órdenes activas' },
    { key: 'export', label: 'Exportar (Export)', desc: 'Generar reportes PDF, Excel (.xlsx) y Word (.docx)' },
    { key: 'ethics', label: 'Gestión Ética', desc: 'Firmar o administrar consentimientos de fatiga' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ full_name: fullName, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-cyan-400" />
            Perfil de Usuario & Simulador de Roles (RBAC)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestiona la información de tu cuenta y cambia de rol dinámicamente para probar permisos granulares.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Details Form & Permissions Matrix */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Mail className="w-4 h-4 text-cyan-400" /> Información Personal
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nombre Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cambiar Contraseña (Opcional)</label>
                  <input
                    type="password"
                    placeholder="Dejar en blanco para mantener la actual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saved && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Perfil Actualizado Exitosamente
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>

            {/* Granular Permissions Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> Matriz Granular de Permisos Activa
                </h2>
                <span className="text-xs font-mono px-2.5 py-1 bg-slate-950 text-cyan-400 rounded border border-slate-800 uppercase font-bold">
                  {user?.role}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {permissionsMatrix.map((item) => {
                  const allowed = hasPermission(item.key as any);
                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        allowed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                      </div>

                      {allowed ? (
                        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-full bg-slate-900 text-slate-600">
                          <X className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Role Simulator & Permission Radar Chart Panel */}
          <div className="space-y-6">
            <div className="glass-panel border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <h2 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Shield className="w-5 h-5 text-purple-400" /> Simulador de Roles (RBAC)
              </h2>

              <p className="text-xs text-slate-400 font-medium">
                Selecciona un rol para probar los permisos granulares del sistema en tiempo real:
              </p>

              <div className="space-y-2 pt-1">
                {rolesList.map((item) => {
                  const isActive = user?.role === item.role;
                  return (
                    <div
                      key={item.role}
                      onClick={() => setRole(item.role)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{item.label}</span>
                        {isActive && <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-900/80 px-2 py-0.5 rounded">ACTIVO</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium leading-snug">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Radar Chart: Cobertura de Permisos */}
            <div className="glass-panel border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <BarChart2 className="w-4 h-4 text-cyan-400" /> Cobertura de Permisos por Rol
                </h3>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                    { subject: 'Lectura', ADMIN: 100, SUPERVISOR: 100, OPERATOR: 100 },
                    { subject: 'Crear', ADMIN: 100, SUPERVISOR: 100, OPERATOR: 0 },
                    { subject: 'Editar', ADMIN: 100, SUPERVISOR: 100, OPERATOR: 0 },
                    { subject: 'Eliminar', ADMIN: 100, SUPERVISOR: 0, OPERATOR: 0 },
                    { subject: 'Exportar', ADMIN: 100, SUPERVISOR: 100, OPERATOR: 0 },
                    { subject: 'Ética', ADMIN: 100, SUPERVISOR: 100, OPERATOR: 100 },
                  ]}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                    <Radar name="Cobertura %" dataKey="ADMIN" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

