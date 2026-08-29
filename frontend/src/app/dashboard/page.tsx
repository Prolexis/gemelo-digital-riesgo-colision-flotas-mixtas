'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import SafetyDashboard from '@/components/dashboard/SafetyDashboard';
import SHAPExplanationDrawer from '@/components/dashboard/SHAPExplanationDrawer';

const Mine3DTwinViewer = dynamic(() => import('@/components/3d/Mine3DTwinViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-cyan-400 font-mono text-xs border border-slate-800 rounded-xl">
      Cargando Entorno 3D Three.js...
    </div>
  ),
});
import { EquipmentTwinData } from '@/types/digital_twin';
import { Box, LayoutDashboard, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function DashboardPage() {
  const [fleet, setFleet] = useState<EquipmentTwinData[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentTwinData | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'dashboard'>('3d');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFleetData = async () => {
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${apiHost}/api/v1/telemetry/live-fleet`);
      setFleet(res.data);
    } catch (err) {
      console.warn('Usando datos de flota simulados por error de conexión backend:', err);
      // Fallback robusto con datos realistas
      setFleet([
        {
          code: 'CA-01',
          name: 'Camión CAT 797F #1',
          equipment_type: 'camion',
          fleet_type: 'manual',
          latitude: -16.3988,
          longitude: -71.5350,
          speed_kmh: 42.5,
          heading_deg: 45.0,
          risk_score: 0.82,
          risk_level: 'critico',
          prediction_horizon_sec: 4.8,
          shap_factors: [
            { feature_name: 'Fatiga del Operador (Turno 9.5h)', weight_percentage: 65.0, impact_direction: 'positive', description: 'Nivel elevado de somnolencia detectado' },
            { feature_name: 'Velocidad Relativa en Curva', weight_percentage: 20.0, impact_direction: 'positive', description: 'Aproximación rápida a 42.5 km/h' },
            { feature_name: 'Distancia Reducida (22m)', weight_percentage: 15.0, impact_direction: 'positive', description: 'Proximidad a unidad secundaria' },
          ],
          perception_summary: 'PointNet++ LiDAR: 2 obstáculos a 22m (Visibilidad: 50%)',
          behavior_score: 0.85,
          recommended_action: '⚠️ ALERTA INMEDIATA: Frenado de emergencia recomendado. Fatiga severa del operador.',
        },
        {
          code: 'CA-02',
          name: 'Camión Komatsu 930E #2',
          equipment_type: 'camion',
          fleet_type: 'autonomo',
          latitude: -16.3995,
          longitude: -71.5342,
          speed_kmh: 28.0,
          heading_deg: 120.0,
          risk_score: 0.25,
          risk_level: 'bajo',
          prediction_horizon_sec: 12.0,
          shap_factors: [
            { feature_name: 'Distancia de Seguridad (65m)', weight_percentage: 70.0, impact_direction: 'negative', description: 'Distancia adecuada de separación' },
            { feature_name: 'Sistema Autónomo Regulado', weight_percentage: 30.0, impact_direction: 'negative', description: 'Trayectoria limpia' },
          ],
          perception_summary: 'PointNet++ LiDAR: Despejado',
          behavior_score: 0.05,
          recommended_action: '✅ Operación normal dentro de los parámetros de seguridad.',
        },
        {
          code: 'PA-01',
          name: 'Pala Bucyrus 495HR',
          equipment_type: 'shovel',
          fleet_type: 'autonomo',
          latitude: -16.4010,
          longitude: -71.5360,
          speed_kmh: 0.0,
          heading_deg: 0.0,
          risk_score: 0.15,
          risk_level: 'bajo',
          prediction_horizon_sec: 15.0,
          shap_factors: [
            { feature_name: 'Unidad Estática en Banco', weight_percentage: 90.0, impact_direction: 'negative', description: 'Posición fija' },
          ],
          perception_summary: 'PointNet++ LiDAR: Estación de carguío libre',
          behavior_score: 0.0,
          recommended_action: '✅ Operación normal.',
        },
        {
          code: 'CA-03',
          name: 'Camión CAT 797F #3',
          equipment_type: 'camion',
          fleet_type: 'manual',
          latitude: -16.4002,
          longitude: -71.5375,
          speed_kmh: 38.0,
          heading_deg: 210.0,
          risk_score: 0.68,
          risk_level: 'alto',
          prediction_horizon_sec: 6.2,
          shap_factors: [
            { feature_name: 'Fatiga del Operador (Turno 10.5h)', weight_percentage: 55.0, impact_direction: 'positive', description: 'Sobreturno detectado' },
            { feature_name: 'Baja Visibilidad / Niebla', weight_percentage: 30.0, impact_direction: 'positive', description: 'Polvo en suspensión' },
          ],
          perception_summary: 'PointNet++ LiDAR: Visibilidad reducida en banco',
          behavior_score: 0.72,
          recommended_action: '🔔 Reducir velocidad a <15 km/h e incrementar distancia.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* View Switcher Controls */}
        <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Box className="w-4 h-4" /> Mapa Gemelo 3D
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> KPIs & Comparativa PDS
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchFleetData}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Actualizar
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Equipos Activos: <span className="text-cyan-400 font-bold">{fleet.length}</span>
            </span>
          </div>
        </div>

        {/* Content Section */}
        {viewMode === '3d' ? (
          <div className="h-[650px] w-full">
            <Mine3DTwinViewer
              fleet={fleet}
              selectedEquipment={selectedEquipment}
              onSelectEquipment={(eq) => setSelectedEquipment(eq)}
            />
          </div>
        ) : (
          <SafetyDashboard
            kpis={null}
            comparison={null}
            fleet={fleet}
            onSelectEquipment={(eq) => setSelectedEquipment(eq)}
          />
        )}
      </main>

      {/* SHAP Explanation Slide-over Drawer */}
      <SHAPExplanationDrawer
        equipment={selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
      />
    </div>
  );
}
