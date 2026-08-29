'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Cpu, FileText, Lock, PlayCircle, User, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Gemelo 3D & Riesgo', icon: Cpu },
    { href: '/scenarios', label: 'Escenarios & Simulación', icon: PlayCircle },
    { href: '/ethics', label: 'Ética & Privacidad', icon: Lock },
    { href: '/reports', label: 'Reportes & Exportación', icon: FileText },
    { href: '/architecture', label: 'Arquitectura & SQL', icon: Shield },
  ];

  const getRoleBadge = (roleStr?: string) => {
    switch (roleStr) {
      case 'administrador':
        return { label: 'ADMINISTRADOR', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' };
      case 'supervisor_seguridad':
        return { label: 'SUPERVISOR', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
      case 'operador':
        return { label: 'OPERADOR', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
      case 'analista_datos':
        return { label: 'ANALISTA', color: 'text-purple-400 bg-purple-950/60 border-purple-800' };
      case 'solo_lectura':
      default:
        return { label: 'SOLO LECTURA', color: 'text-slate-400 bg-slate-900 border-slate-700' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              MINING TWIN 3D <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">XAI SHAP</span>
            </h1>
            <p className="text-[11px] text-slate-400">Predicción de Colisión en Minas • Flotas Mixtas</p>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Role Indicator & Logout Button */}
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{user?.full_name || 'Usuario Demo'}</p>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
              <User className="w-4 h-4" />
            </div>
          </Link>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all flex items-center gap-1 text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline font-semibold">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
