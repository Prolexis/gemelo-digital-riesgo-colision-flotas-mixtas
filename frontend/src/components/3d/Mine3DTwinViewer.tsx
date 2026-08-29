'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EquipmentTwinData, RiskLevel } from '@/types/digital_twin';

interface Mine3DTwinViewerProps {
  fleet: EquipmentTwinData[];
  selectedEquipment: EquipmentTwinData | null;
  onSelectEquipment: (eq: EquipmentTwinData) => void;
}

const getRiskColorHex = (level: RiskLevel): number => {
  switch (level) {
    case 'critico':
      return 0xef4444; // Red
    case 'alto':
      return 0xf97316; // Orange
    case 'medio':
      return 0xeab308; // Yellow
    case 'bajo':
    default:
      return 0x22c55e; // Green
  }
};

export default function Mine3DTwinViewer({
  fleet,
  selectedEquipment,
  onSelectEquipment,
}: Mine3DTwinViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedCodeRef = useRef<string | null>(selectedEquipment?.code || null);
  selectedCodeRef.current = selectedEquipment?.code || null;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Slate 950

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 30, 35);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 10;
    controls.maxDistance = 80;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(30, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 1, 50);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);

    // 6. Terrain (Open-Pit Mine Benches)
    const terrainGroup = new THREE.Group();

    // Pit floor
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    terrainGroup.add(floor);

    // Bench steps
    const bench1Geo = new THREE.RingGeometry(15, 35, 32);
    const bench1Mat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, side: THREE.DoubleSide });
    const bench1 = new THREE.Mesh(bench1Geo, bench1Mat);
    bench1.rotation.x = -Math.PI / 2;
    bench1.position.y = 0.4;
    terrainGroup.add(bench1);

    const bench2Geo = new THREE.RingGeometry(35, 55, 32);
    const bench2Mat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9, side: THREE.DoubleSide });
    const bench2 = new THREE.Mesh(bench2Geo, bench2Mat);
    bench2.rotation.x = -Math.PI / 2;
    bench2.position.y = 1.2;
    terrainGroup.add(bench2);

    // Grid helper
    const grid = new THREE.GridHelper(120, 40, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.05;
    terrainGroup.add(grid);

    scene.add(terrainGroup);

    // 7. Equipment 3D Mesh Generation & Placement
    const interactiveMeshes: { mesh: THREE.Object3D; eq: EquipmentTwinData; auraMesh: THREE.Mesh }[] = [];

    const coordsList: [number, number, number][] = [
      [-12, 0, 8],
      [-4, 0, -2],
      [14, 0, 12],
      [-18, 0, -15],
      [8, 0, -18],
    ];

    fleet.forEach((eq, idx) => {
      const pos = coordsList[idx % coordsList.length];
      const eqGroup = new THREE.Group();
      eqGroup.position.set(pos[0], pos[1], pos[2]);

      const riskColor = getRiskColorHex(eq.risk_level);

      // Risk Aura Cylinder Glow
      const auraGeo = new THREE.CylinderGeometry(3.0, 3.0, 0.2, 32);
      const auraMat = new THREE.MeshBasicMaterial({
        color: riskColor,
        transparent: true,
        opacity: 0.35,
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      auraMesh.position.y = 0.1;
      eqGroup.add(auraMesh);

      if (eq.equipment_type === 'shovel') {
        // Shovel Base
        const baseGeo = new THREE.BoxGeometry(3.2, 1.8, 3.4);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 1.0;
        eqGroup.add(baseMesh);

        // Boom Arm
        const boomGeo = new THREE.BoxGeometry(0.7, 4.0, 0.7);
        const boomMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const boomMesh = new THREE.Mesh(boomGeo, boomMat);
        boomMesh.position.set(0, 3.0, 1.5);
        boomMesh.rotation.x = 0.6;
        eqGroup.add(boomMesh);
      } else {
        // Haul Truck Chassis
        const chassisColor = eq.fleet_type === 'autonomo' ? 0x3b82f6 : 0xd97706;
        const chassisGeo = new THREE.BoxGeometry(2.4, 0.9, 4.0);
        const chassisMat = new THREE.MeshStandardMaterial({ color: chassisColor, metalness: 0.3, roughness: 0.4 });
        const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
        chassisMesh.position.y = 0.95;
        eqGroup.add(chassisMesh);

        // Cab
        const cabGeo = new THREE.BoxGeometry(1.0, 0.9, 1.3);
        const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
        const cabMesh = new THREE.Mesh(cabGeo, cabMat);
        cabMesh.position.set(0.6, 1.7, 1.1);
        eqGroup.add(cabMesh);

        // Dump Box (Caja)
        const dumpGeo = new THREE.BoxGeometry(2.3, 1.1, 2.8);
        const dumpMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 });
        const dumpMesh = new THREE.Mesh(dumpGeo, dumpMat);
        dumpMesh.position.set(0, 1.8, -0.6);
        dumpMesh.rotation.x = -0.12;
        eqGroup.add(dumpMesh);

        // Wheels
        [
          [-1.25, 0.55, -1.3],
          [1.25, 0.55, -1.3],
          [-1.25, 0.55, 1.3],
          [1.25, 0.55, 1.3],
        ].forEach((wheelPos) => {
          const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16);
          const wheelMat = new THREE.MeshStandardMaterial({ color: 0x090d16 });
          const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
          wheelMesh.rotation.z = Math.PI / 2;
          wheelMesh.position.set(wheelPos[0], wheelPos[1], wheelPos[2]);
          eqGroup.add(wheelMesh);
        });
      }

      scene.add(eqGroup);
      interactiveMeshes.push({ mesh: eqGroup, eq, auraMesh });
    });

    // 8. Raycasting Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targetObjects = interactiveMeshes.map((item) => item.mesh);
      const intersects = raycaster.intersectObjects(targetObjects, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && hitObj.parent && hitObj.parent !== scene) {
          hitObj = hitObj.parent;
        }

        const found = interactiveMeshes.find((item) => item.mesh === hitObj);
        if (found) {
          onSelectEquipment(found.eq);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsing aura for critical risk & selected equipment
      interactiveMeshes.forEach((item) => {
        const isSelected = selectedCodeRef.current === item.eq.code;
        if (item.eq.risk_level === 'critico') {
          const scale = 1 + Math.sin(elapsedTime * 6) * 0.12;
          item.auraMesh.scale.set(scale, 1, scale);
        } else if (isSelected) {
          const scale = 1 + Math.sin(elapsedTime * 4) * 0.08;
          item.auraMesh.scale.set(scale, 1, scale);
        } else {
          item.auraMesh.scale.set(1, 1, 1);
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 10. Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [fleet, onSelectEquipment]);

  return (
    <div className="w-full h-full relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top 3D Control overlay banner */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-white shadow-xl flex items-center gap-4">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-cyan-400 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            GEMELO DIGITAL 3D — TAJO ABIERTO
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Telemetría GNSS/LiDAR 1 Hz • Tajo Sector Norte
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs border-l border-slate-700 pl-4">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Bajo
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-yellow-500" /> Medio
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Alto
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Crítico
          </span>
        </div>
      </div>

      {/* Selected Equipment Indicator Banner */}
      {selectedEquipment && (
        <div className="absolute top-4 right-4 z-10 bg-slate-900/95 border border-cyan-500 px-4 py-2 rounded-lg text-white shadow-xl flex items-center gap-3 animate-fade-in">
          <div>
            <div className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-2">
              EQUIPO SELECCIONADO: {selectedEquipment.code}
            </div>
            <div className="text-[10px] text-slate-300">
              Score Riesgo: {(selectedEquipment.risk_score * 100).toFixed(1)}% | Lead Time: {selectedEquipment.prediction_horizon_sec}s
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Instructions footer */}
      <div className="absolute bottom-3 left-4 z-10 text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800 backdrop-blur-md">
        💡 Haz clic en cualquier equipo 3D para desplegar el panel de explicación SHAP. Arrastra el mouse para rotar (360°).
      </div>
    </div>
  );
}
