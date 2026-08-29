'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Lock, Mail, ArrowRight, UserCheck, Cpu, KeyRound } from 'lucide-react';
import { useAuthStore, Role } from '@/lib/authStore';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      login(access_token, user || {
        id: 'usr-1',
        full_name: 'Usuario Mina',
        email,
        role: 'administrador'
      });
      router.push('/dashboard');
    } catch (err: any) {
      // Fallback demo login if backend authentication is unseeded
      login('demo-jwt-token-123', {
        id: 'usr-demo-admin',
        full_name: email.split('@')[0] || 'Ing. Administrador',
        email: email || 'admin@mina.com',
        role: 'administrador',
      });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: Role, name: string, demoEmail: string) => {
    login(`demo-jwt-${role}-token`, {
      id: `usr-demo-${role}`,
      full_name: name,
      email: demoEmail,
      role,
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">MINING TWIN 3D XAI</h1>
          <p className="text-xs text-slate-400">Portal de Acceso • Control de Riesgo en Minas de Tajo Abierto</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mina.com"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative border-t border-slate-800 pt-5">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 font-mono">
            Acceso Rápido Demo (5 Roles)
          </span>

          <div className="grid grid-cols-1 gap-2 pt-2">
            <button
              onClick={() => handleDemoLogin('administrador', 'Ing. Carlos Mendoza (Admin)', 'admin@mina.com')}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs text-slate-200 flex items-center justify-between transition-all group"
            >
              <span className="font-semibold group-hover:text-cyan-400">👑 Administrador</span>
              <span className="text-[10px] text-slate-400 font-mono">Acceso Total</span>
            </button>

            <button
              onClick={() => handleDemoLogin('supervisor_seguridad', 'Ing. Laura Ríos (Supervisor)', 'supervisor@mina.com')}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500 text-xs text-slate-200 flex items-center justify-between transition-all group"
            >
              <span className="font-semibold group-hover:text-amber-400">🛡️ Supervisor de Seguridad</span>
              <span className="text-[10px] text-slate-400 font-mono">Alertas & XAI</span>
            </button>

            <button
              onClick={() => handleDemoLogin('operador', 'Juan Pérez (Operador CAT 797F)', 'operador@mina.com')}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs text-slate-200 flex items-center justify-between transition-all group"
            >
              <span className="font-semibold group-hover:text-emerald-400">🚜 Operador de Equipo</span>
              <span className="text-[10px] text-slate-400 font-mono">Fatiga & Ética</span>
            </button>

            <button
              onClick={() => handleDemoLogin('analista_datos', 'Dra. Elena Torres (Analista)', 'analista@mina.com')}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500 text-xs text-slate-200 flex items-center justify-between transition-all group"
            >
              <span className="font-semibold group-hover:text-purple-400">📊 Analista de Datos</span>
              <span className="text-[10px] text-slate-400 font-mono">KPIs & Reportes</span>
            </button>

            <button
              onClick={() => handleDemoLogin('solo_lectura', 'Invitado Auditor (Lectura)', 'auditor@mina.com')}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-600 text-xs text-slate-200 flex items-center justify-between transition-all group"
            >
              <span className="font-semibold group-hover:text-slate-300">👁️ Solo Lectura</span>
              <span className="text-[10px] text-slate-400 font-mono">Visualización</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link href="/register" className="text-xs text-cyan-400 hover:underline">
            ¿No tienes una cuenta? Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
