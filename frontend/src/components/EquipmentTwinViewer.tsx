"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import type { EquipmentStatus } from "@/types";

const STATUS_COLOR: Record<EquipmentStatus, string> = {
  optimo: "#22c55e",
  alerta: "#f59e0b",
  critico: "#ef4444",
};

interface Props {
  status: EquipmentStatus;
}

/**
 * Representación simplificada del gemelo digital 3D de un equipo de carguío:
 * chasis, cabina, tren de potencia y ruedas como despiece por componentes.
 * En una fase posterior se reemplaza por modelos GLTF reales del fabricante.
 */
export default function EquipmentTwinViewer({ status }: Props) {
  const color = STATUS_COLOR[status];

  return (
    <div className="h-80 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
      <Canvas camera={{ position: [4, 3, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Chasis */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[3, 1, 1.4]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Cabina */}
        <mesh position={[-1, 1.3, 0]}>
          <boxGeometry args={[0.8, 0.8, 1.2]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        {/* Tren de potencia (representación) */}
        <mesh position={[0.8, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>

        {/* Ruedas / orugas */}
        {[-1.2, -0.3, 0.6, 1.3].map((x) => (
          <mesh key={x} position={[x, -0.1, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 20]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}
        {[-1.2, -0.3, 0.6, 1.3].map((x) => (
          <mesh key={`b-${x}`} position={[x, -0.1, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 20]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}

        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
