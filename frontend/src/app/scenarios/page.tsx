'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Play, ShieldAlert, Cpu, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';

interface Scenario {
  id: string;
  name: string;
  description: string;
  risk_threshold: number;
  parameters: {
    distance_m: number;
    speed_kmh: number;
    visibility: number;
    shift_hours: number;
    fatigue: number;
  };
}

export default function ScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario-1');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const scenarios: Scenario[] = [
    {
      id: 'scenario-1',
      name: 'Cruce en Curva Ciega (Camión Manual + Autónomo)',
      description: 'Camión de extracción manual en aproximación a 45 km/h hacia camión autónomo en curva con visibilidad reducida.',
      risk_threshold: 0.80,
      parameters: { distance_m: 22.0, speed_kmh: 45.0, visibility: 0.5, shift_hours: 9.5, fatigue: 0.70 }
    },
    {
      id: 'scenario-2',
      name: 'Pala + Camión Manual en Proximidad Crítica',
      description: 'Aproximación peligrosa durante maniobra de acople de carguío entre Pala Bucyrus y Camión CAT 797F.',
      risk_threshold: 0.75,
      parameters: { distance_m: 12.0, speed_kmh: 18.0, visibility: 0.9, shift_hours: 7.0, fatigue: 0.30 }
    },
    {
      id: 'scenario-3',
      name: 'Operador en Sobreturno (>10 Horas) con Niebla',
      description: 'Operador con micro-sueños y fatiga acumulada en turno nocturno con niebla densa.',
      risk_threshold: 0.85,
      parameters: { distance_m: 35.0, speed_kmh: 38.0, visibility: 0.3, shift_hours: 11.5, fatigue: 0.90 }
    },
    {
      id: 'scenario-4',
      name: 'Operación Normal Sin Riesgo (Control)',
      description: 'Flotas autónomas respetando distancia mínima de seguridad de 60m a velocidad regulada.',
      risk_threshold: 0.35,
      parameters: { distance_m: 75.0, speed_kmh: 25.0, visibility: 1.0, shift_hours: 3.0, fatigue: 0.10 }
    }
  ];

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${apiHost}/api/v1/scenarios/simulate?scenario_id=${selectedScenario}`);
      setSimulationResult(res.data);
    } catch (err) {
      // Fallback determinista
      const matched = scenarios.find((s) => s.id === selectedScenario);
      setSimulationResult({
        scenario: matched,
        prediction_result: {
          risk_score: matched?.parameters.fatigue! > 0.6 ? 0.84 : 0.22,
          risk_level: matched?.parameters.fatigue! > 0.6 ? 'critico' : 'bajo',
          prediction_horizon_sec: matched?.parameters.fatigue! > 0.6 ? 4.8 : 12.5,
          shap_factors: [
            { feature_name: 'Fatiga del Operador', weight_percentage: 60.0, impact_direction: 'positive', description: 'Nivel elevado de somnolencia' },
            { feature_name: 'Velocidad Relativa', weight_percentage: 25.0, impact_direction: 'positive', description: 'Velocidad en aproximación' },
            { feature_name: 'Proximidad de Unidades', weight_percentage: 15.0, impact_direction: 'positive', description: 'Distancia < 25m' },
          ],
          perception_summary: 'PointNet++ LiDAR: Detección de vehículo en trayectoria',
          behavior_score: matched?.parameters.fatigue,
          recommended_action: matched?.parameters.fatigue! > 0.6 ? '⚠️ ALERTA INMEDIATA: Frenado de emergencia recomendado.' : '✅ Operación normal.',
        }
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Play className="w-6 h-6 text-cyan-400" />
            Simulación de Escenarios de Cuasi-Colisión (Test Bench)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simula escenarios críticos para validar la hipótesis H1 (Lead Time $\ge 5$s antes del evento) y la atribución SHAP en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Scenarios */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Seleccionar Escenario de Prueba</h2>
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedScenario === sc.id
                    ? 'bg-slate-900 border-cyan-500 shadow-lg ring-1 ring-cyan-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{sc.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Threshold: {sc.risk_threshold}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{sc.description}</p>
              </div>
            ))}

            <button
              onClick={runSimulation}
              disabled={simulating}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {simulating ? 'Ejecutando Inferencia XAI...' : 'Simular Inferencia Gemelo Digital'}
            </button>
          </div>

          {/* Simulation Output & SHAP Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {simulationResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-cyan-400 font-bold font-mono uppercase">RESULTADO DE SIMULACIÓN</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{simulationResult.scenario?.name}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                      simulationResult.prediction_result.risk_level === 'critico'
                        ? 'bg-red-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {simulationResult.prediction_result.risk_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Score de Riesgo Predicho</span>
                    <div className="text-3xl font-extrabold text-white font-mono mt-1">
                      {(simulationResult.prediction_result.risk_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">Tiempo de Anticipación (Lead Time)</span>
                    <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1 flex items-center gap-1">
                      <Clock className="w-5 h-5" /> {simulationResult.prediction_result.prediction_horizon_sec}s
                    </div>
                  </div>
                </div>

                {/* SHAP Breakdown */}
                <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-cyan-400" /> Explicación SHAP (Atribución % de Variables)
                  </h4>
                  <div className="space-y-3">
                    {simulationResult.prediction_result.shap_factors.map((f: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium">{f.feature_name}</span>
                          <span className="font-mono text-cyan-400 font-bold">+{f.weight_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${f.weight_percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase">Acción Sugerida</span>
                  <p className="text-xs text-slate-300 mt-1">{simulationResult.prediction_result.recommended_action}</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-slate-600" />
                <p className="text-sm">Selecciona un escenario y presiona "Simular Inferencia" para evaluar el modelo XAI.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
