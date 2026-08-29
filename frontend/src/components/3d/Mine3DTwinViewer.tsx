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

    // 6. Terrain (Open-Pit Mine Benches Cotas 3100m - 3600m & 9% Haul Ramp)
    const terrainGroup = new THREE.Group();

    // Pit floor (Cota 3100m)
    const floorGeo = new THREE.PlaneGeometry(140, 140);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    terrainGroup.add(floor);

    // Bench 1 Step (Cota 3350m)
    const bench1Geo = new THREE.RingGeometry(18, 42, 36);
    const bench1Mat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, side: THREE.DoubleSide });
    const bench1 = new THREE.Mesh(bench1Geo, bench1Mat);
    bench1.rotation.x = -Math.PI / 2;
    bench1.position.y = 0.5;
    terrainGroup.add(bench1);

    // Bench 2 Step (Cota 3600m)
    const bench2Geo = new THREE.RingGeometry(42, 65, 36);
    const bench2Mat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9, side: THREE.DoubleSide });
    const bench2 = new THREE.Mesh(bench2Geo, bench2Mat);
    bench2.rotation.x = -Math.PI / 2;
    bench2.position.y = 1.4;
    terrainGroup.add(bench2);

    // 9% Haul Ramp Mesh (Connecting Cota 3100m to Cota 3600m)
    const rampGeo = new THREE.BoxGeometry(8, 0.2, 50);
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    rampMesh.position.set(22, 0.75, 5);
    rampMesh.rotation.x = 0.09; // 9% operational slope grade
    rampMesh.rotation.y = -0.3;
    terrainGroup.add(rampMesh);

    // Grid helper
    const grid = new THREE.GridHelper(140, 40, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.05;
    terrainGroup.add(grid);

    scene.add(terrainGroup);

    // 7. Equipment 3D Mesh Generation, LiDAR Cones & Predictive Trajectories
    const interactiveMeshes: { mesh: THREE.Object3D; eq: EquipmentTwinData; auraMesh: THREE.Mesh; lidarCone: THREE.Mesh; pathLine: THREE.Line }[] = [];

    const coordsList: [number, number, number, number][] = [
      [-12, 0, 8, 0.4],     // x, y, z, rotationAngle
      [-4, 0, -2, -0.6],
      [14, 0, 12, 1.2],
      [-18, 0, -15, 2.1],
      [8, 0, -18, -1.8],
    ];

    fleet.forEach((eq, idx) => {
      const pos = coordsList[idx % coordsList.length];
      const eqGroup = new THREE.Group();
      eqGroup.position.set(pos[0], pos[1], pos[2]);
      eqGroup.rotation.y = pos[3];

      const riskColor = getRiskColorHex(eq.risk_level);

      // Risk Aura Cylinder Glow (Verde, Amarillo, Naranja, Rojo)
      const auraGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.2, 32);
      const auraMat = new THREE.MeshBasicMaterial({
        color: riskColor,
        transparent: true,
        opacity: 0.4,
      });
      const auraMesh = new THREE.Mesh(auraGeo, auraMat);
      auraMesh.position.y = 0.1;
      eqGroup.add(auraMesh);

      // Volumetric 3D LiDAR Scanning Cone (Frustum)
      const coneGeo = new THREE.ConeGeometry(3.0, 7.0, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.2,
        wireframe: true,
        side: THREE.DoubleSide,
      });
      const lidarCone = new THREE.Mesh(coneGeo, coneMat);
      lidarCone.position.set(0, 1.2, 4.5);
      lidarCone.rotation.x = Math.PI / 2;
      eqGroup.add(lidarCone);

      // Predictive Trajectory Vector Line (Lead Time ray)
      const pathPoints = [
        new THREE.Vector3(0, 0.3, 0),
        new THREE.Vector3(0, 0.3, 6 + (eq.prediction_horizon_sec || 5.0) * 0.8),
      ];
      const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
      const pathMat = new THREE.LineDashedMaterial({
        color: riskColor,
        dashSize: 0.6,
        gapSize: 0.3,
        linewidth: 2,
      });
      const pathLine = new THREE.Line(pathGeo, pathMat);
      pathLine.computeLineDistances();
      eqGroup.add(pathLine);

      if (eq.equipment_type === 'shovel') {
        // Pala Eléctrica P&H 495HR
        const baseGeo = new THREE.BoxGeometry(3.6, 2.0, 3.8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.4 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 1.1;
        eqGroup.add(baseMesh);

        // Heavy Boom Arm
        const boomGeo = new THREE.BoxGeometry(0.8, 4.5, 0.8);
        const boomMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const boomMesh = new THREE.Mesh(boomGeo, boomMat);
        boomMesh.position.set(0, 3.2, 1.8);
        boomMesh.rotation.x = 0.65;
        eqGroup.add(boomMesh);
      } else if (eq.equipment_type === 'cargador') {
        // Vehículo de Supervisión / Camioneta HSE
        const bodyGeo = new THREE.BoxGeometry(1.6, 0.9, 2.6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.y = 0.6;
        eqGroup.add(bodyMesh);
      } else {
        // Camiones CAT 797F (Manual d97706) vs Autonomous AHS (Cyan/Blue 3b82f6)
        const chassisColor = eq.fleet_type === 'autonomo' ? 0x06b6d4 : 0xd97706;
        const chassisGeo = new THREE.BoxGeometry(2.6, 1.0, 4.2);
        const chassisMat = new THREE.MeshStandardMaterial({ color: chassisColor, metalness: 0.4, roughness: 0.3 });
        const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
        chassisMesh.position.y = 1.0;
        eqGroup.add(chassisMesh);

        // Cabina
        const cabGeo = new THREE.BoxGeometry(1.1, 1.0, 1.4);
        const cabMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.2 });
        const cabMesh = new THREE.Mesh(cabGeo, cabMat);
        cabMesh.position.set(0.65, 1.8, 1.2);
        eqGroup.add(cabMesh);

        // Dump Box (Tolva)
        const dumpGeo = new THREE.BoxGeometry(2.5, 1.2, 3.0);
        const dumpMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
        const dumpMesh = new THREE.Mesh(dumpGeo, dumpMat);
        dumpMesh.position.set(0, 1.9, -0.6);
        dumpMesh.rotation.x = -0.12;
        eqGroup.add(dumpMesh);

        // Wheels
        [
          [-1.3, 0.6, -1.4],
          [1.3, 0.6, -1.4],
          [-1.3, 0.6, 1.4],
          [1.3, 0.6, 1.4],
        ].forEach((wPos) => {
          const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
          const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
          const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
          wheelMesh.rotation.z = Math.PI / 2;
          wheelMesh.position.set(wPos[0], wPos[1], wPos[2]);
          eqGroup.add(wheelMesh);
        });
      }

      scene.add(eqGroup);
      interactiveMeshes.push({ mesh: eqGroup, eq, auraMesh, lidarCone, pathLine });
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
