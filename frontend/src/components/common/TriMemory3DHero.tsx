import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import {
  Activity,
  Layers,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Radio,
} from 'lucide-react';

type SimulationMode = 'normal' | 'cavitation' | 'transient';

interface ParticleState {
  progress: number;
  speed: number;
  lane: number;
  jitter: THREE.Vector3;
}

export const TriMemory3DHero: React.FC = () => {
  const [mode, setMode] = useState<SimulationMode>('cavitation');
  const [tick, setTick] = useState(0);
  const modeRef = useRef<SimulationMode>('cavitation');
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Live sensor readout ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => (prev + 1) % 1000);
    }, 450);
    return () => clearInterval(timer);
  }, []);

  const sensorData = {
    normal: {
      tp2: { val: (0.54 + Math.sin(tick * 0.3) * 0.42).toFixed(2), unit: 'bar', color: 'text-orange-300' },
      reservoirs: { val: (9.12 + Math.cos(tick * 0.25) * 0.22).toFixed(2), unit: 'bar', color: 'text-emerald-400' },
      oil_temp: { val: (54.6 + Math.sin(tick * 0.15) * 1.6).toFixed(1), unit: '°C', color: 'text-yellow-300' },
      score: 0.14,
      state: 'Known LTM Prototype #1',
      action: 'Normal baseline cycling — routed calmly to LTM',
      routeLabel: 'SCADA → STM → LTM Baseline',
    },
    cavitation: {
      tp2: { val: (8.45 - Math.sin(tick * 0.3) * 0.9).toFixed(2), unit: 'bar', color: 'text-amber-300' },
      reservoirs: { val: (6.42 + Math.cos(tick * 0.35) * 0.45).toFixed(2), unit: 'bar', color: 'text-rose-400' },
      oil_temp: { val: (86.4 + Math.sin(tick * 0.2) * 2.2).toFixed(1), unit: '°C', color: 'text-rose-400' },
      score: 0.78,
      state: 'Unknown State #CAND-01',
      action: 'DBSCAN cluster crystallized in Contradiction Memory (F1=94.3%)',
      routeLabel: 'SCADA → STM → CM DBSCAN Cluster',
    },
    transient: {
      tp2: { val: (0.52 + (tick % 6 === 0 ? 3.1 : 0.05)).toFixed(2), unit: 'bar', color: 'text-yellow-300' },
      reservoirs: { val: (9.10 + (tick % 6 === 0 ? -0.75 : 0.05)).toFixed(2), unit: 'bar', color: 'text-amber-300' },
      oil_temp: { val: (54.8).toFixed(1), unit: '°C', color: 'text-stone-200' },
      score: 0.29,
      state: 'STM Filtered Transient',
      action: 'Pneumatic spike dampened in STM — zero false alarms',
      routeLabel: 'SCADA → STM Dampened (Suppressed)',
    },
  }[mode];

  // Three.js 3D Tri-Memory Neural Core & Particle Routing
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.45, 7.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Master group for smooth mouse parallax
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Lighting (Volcanic Charcoal + Molten Amber + Gold + Crimson)
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const stmLight = new THREE.PointLight(0xf97316, 4.5, 9);
    const ltmLight = new THREE.PointLight(0xfacc15, 4.0, 9);
    const cmLight = new THREE.PointLight(0xf43f5e, 4.5, 9);
    rootGroup.add(stmLight, ltmLight, cmLight);

    // Subtle architectural floor grid
    const gridHelper = new THREE.GridHelper(14, 24, 0x44403c, 0x1c1917);
    gridHelper.position.y = -2.25;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    rootGroup.add(gridHelper);

    // Node Coordinates
    const posSTM = new THREE.Vector3(-2.55, 0.85, 0.25);
    const posCore = new THREE.Vector3(0, 0.15, 0.35);
    const posLTM = new THREE.Vector3(-0.15, -1.25, -0.55);
    const posCM = new THREE.Vector3(2.55, 0.65, 0.15);

    stmLight.position.copy(posSTM);
    ltmLight.position.copy(posLTM);
    cmLight.position.copy(posCM);

    // Helper to build a sleek 3D memory node
    const createMemoryNode = (pos: THREE.Vector3, colorHex: number, radius: number) => {
      const group = new THREE.Group();
      group.position.copy(pos);

      const coreGeo = new THREE.IcosahedronGeometry(radius * 0.55, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.75,
        roughness: 0.2,
        metalness: 0.7,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      const shellGeo = new THREE.IcosahedronGeometry(radius, 1);
      const shellMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);
      group.add(shellMesh);

      const ringGeo = new THREE.TorusGeometry(radius * 1.32, 0.022, 12, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.55,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2.6;
      group.add(ringMesh);

      rootGroup.add(group);
      return { group, coreMesh, shellMesh, ringMesh, coreMat, shellMat, ringMat };
    };

    const stmNode = createMemoryNode(posSTM, 0xf97316, 0.62);
    const ltmNode = createMemoryNode(posLTM, 0xfacc15, 0.68);
    const cmNode = createMemoryNode(posCM, 0xf43f5e, 0.64);

    // Central Contradiction Arbitrator Core
    const coreGroup = new THREE.Group();
    coreGroup.position.copy(posCore);
    const arbGeo = new THREE.OctahedronGeometry(0.42, 0);
    const arbMat = new THREE.MeshStandardMaterial({
      color: 0xfafaf9,
      emissive: 0xf97316,
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.9,
    });
    const arbMesh = new THREE.Mesh(arbGeo, arbMat);
    coreGroup.add(arbMesh);

    const gyro1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.015, 10, 48),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.45 })
    );
    const gyro2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.84, 0.012, 10, 48),
      new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.3 })
    );
    gyro2.rotation.y = Math.PI / 3;
    coreGroup.add(gyro1, gyro2);
    rootGroup.add(coreGroup);

    // Connection filaments (STM -> Core -> LTM / CM)
    const createFilament = (a: THREE.Vector3, b: THREE.Vector3, colorHex: number) => {
      const mid = a.clone().lerp(b, 0.5);
      mid.y += 0.25;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
      const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.32 });
      const line = new THREE.Line(geo, mat);
      rootGroup.add(line);
      return { curve, mat, geo };
    };

    const filStmCore = createFilament(posSTM, posCore, 0xf97316);
    const filCoreLtm = createFilament(posCore, posLTM, 0xfacc15);
    const filCoreCm = createFilament(posCore, posCM, 0xf43f5e);

    // DBSCAN Mini-Cluster orbiting CM (crystallizes during Novel Regime)
    const dbscanCount = 24;
    const dbscanGroup = new THREE.Group();
    dbscanGroup.position.copy(posCM);
    const dbscanPoints: { mesh: THREE.Mesh; baseOffset: THREE.Vector3 }[] = [];
    const dotGeo = new THREE.SphereGeometry(0.055, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.85 });

    for (let i = 0; i < dbscanCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dbscanCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 0.85 + (i % 3) * 0.12;
      const offset = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      const mesh = new THREE.Mesh(dotGeo, dotMat);
      mesh.position.copy(offset);
      dbscanGroup.add(mesh);
      dbscanPoints.push({ mesh, baseOffset: offset });
    }
    rootGroup.add(dbscanGroup);

    // Live Telemetry Particle Stream (96 particles)
    const particleCount = 96;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particleSystem);

    const particles: ParticleState[] = Array.from({ length: particleCount }, (_, i) => ({
      progress: i / particleCount,
      speed: 0.24 + (i % 5) * 0.025,
      lane: i % 3,
      jitter: new THREE.Vector3(
        (Math.random() - 0.5) * 0.16,
        (Math.random() - 0.5) * 0.16,
        (Math.random() - 0.5) * 0.16
      ),
    }));

    const colorOrange = new THREE.Color(0xf97316);
    const colorGold = new THREE.Color(0xfacc15);
    const colorCrimson = new THREE.Color(0xf43f5e);

    // Mouse Parallax
    const targetRot = { x: 0, y: 0 };
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRot.y = nx * 0.18;
      targetRot.x = ny * 0.10;
    };
    container.addEventListener('mousemove', handlePointerMove);

    // ResizeObserver for crisp responsiveness
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let rafId = 0;
    let lastTime = performance.now();

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const t = now * 0.001;
      const activeMode = modeRef.current;

      // Smooth parallax
      rootGroup.rotation.y += (targetRot.y - rootGroup.rotation.y) * 0.06;
      rootGroup.rotation.x += (targetRot.x - rootGroup.rotation.x) * 0.06;

      // Rotate nodes
      stmNode.shellMesh.rotation.y += dt * 0.55;
      stmNode.ringMesh.rotation.z += dt * 0.9;
      ltmNode.shellMesh.rotation.y -= dt * 0.35;
      ltmNode.ringMesh.rotation.z -= dt * 0.5;
      cmNode.shellMesh.rotation.y += dt * (activeMode === 'cavitation' ? 1.1 : 0.35);
      cmNode.ringMesh.rotation.z += dt * (activeMode === 'cavitation' ? 1.4 : 0.45);

      arbMesh.rotation.y += dt * 0.8;
      arbMesh.rotation.x += dt * 0.4;
      gyro1.rotation.x += dt * 0.9;
      gyro2.rotation.z -= dt * 0.7;

      // Dynamic emphasis per active mode
      const stmTargetIntensity = activeMode === 'transient' ? 1.25 : 0.65;
      const ltmTargetIntensity = activeMode === 'normal' ? 1.25 : 0.5;
      const cmTargetIntensity = activeMode === 'cavitation' ? 1.45 : 0.35;

      stmNode.coreMat.emissiveIntensity += (stmTargetIntensity - stmNode.coreMat.emissiveIntensity) * 0.08;
      ltmNode.coreMat.emissiveIntensity += (ltmTargetIntensity - ltmNode.coreMat.emissiveIntensity) * 0.08;
      cmNode.coreMat.emissiveIntensity += (cmTargetIntensity - cmNode.coreMat.emissiveIntensity) * 0.08;

      filCoreLtm.mat.opacity = activeMode === 'normal' ? 0.65 : 0.16;
      filCoreCm.mat.opacity = activeMode === 'cavitation' ? 0.75 : 0.14;
      filStmCore.mat.opacity = activeMode === 'transient' ? 0.25 : 0.55;

      // DBSCAN cluster crystallization
      dbscanGroup.rotation.y += dt * 0.45;
      const clusterScale = activeMode === 'cavitation' ? 1.0 : 0.35;
      dbscanGroup.scale.lerp(new THREE.Vector3(clusterScale, clusterScale, clusterScale), 0.08);
      dotMat.opacity += ((activeMode === 'cavitation' ? 0.92 : 0.18) - dotMat.opacity) * 0.08;

      // Update flowing telemetry particles
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      const colAttr = particleGeo.getAttribute('color') as THREE.BufferAttribute;
      const tmp = new THREE.Vector3();

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.progress = (p.progress + dt * p.speed) % 1;

        if (p.progress < 0.45) {
          // Stage 1: Incoming SCADA stream -> STM -> Core
          const u = p.progress / 0.45;
          filStmCore.curve.getPoint(u, tmp);
          tmp.addScaledVector(p.jitter, Math.sin(t * 2 + i));
          colAttr.setXYZ(i, colorOrange.r, colorOrange.g, colorOrange.b);
        } else {
          // Stage 2: Route depending on active mode
          const u = (p.progress - 0.45) / 0.55;
          if (activeMode === 'normal') {
            filCoreLtm.curve.getPoint(u, tmp);
            tmp.addScaledVector(p.jitter, 0.7);
            colAttr.setXYZ(i, colorGold.r, colorGold.g, colorGold.b);
          } else if (activeMode === 'cavitation') {
            filCoreCm.curve.getPoint(u, tmp);
            tmp.addScaledVector(p.jitter, 1.1);
            colAttr.setXYZ(i, colorCrimson.r, colorCrimson.g, colorCrimson.b);
          } else {
            // Transient pulse: absorbed/dissolved inside STM orbital ring
            const angle = t * 2.5 + i * 0.4;
            const r = 0.75 * (1 - u * 0.65);
            tmp.set(
              posSTM.x + Math.cos(angle) * r,
              posSTM.y + Math.sin(angle) * r * 0.6,
              posSTM.z + Math.sin(angle * 0.5) * 0.3
            );
            colAttr.setXYZ(i, colorGold.r, colorGold.g, colorGold.b);
          }
        }
        posAttr.setXYZ(i, tmp.x, tmp.y, tmp.z);
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      particleGeo.dispose();
      particleMat.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      filStmCore.geo.dispose();
      filCoreLtm.geo.dispose();
      filCoreCm.geo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[#141210]/90 border border-stone-700/60 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden backdrop-blur-2xl">
      {/* Top Liquid Glass Control Bar */}
      <div className="px-5 py-3.5 bg-[#0C0A09]/90 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-stone-100">
              TRIO 3D NEURAL CORE
            </span>
          </div>
          <span className="text-stone-700 font-mono text-xs hidden sm:inline">&bull;</span>
          <span className="text-[11px] font-mono text-stone-400 hidden sm:inline">
            MetroPT-3 Air Compressor &bull; Real-Time Particle Arbitration
          </span>
        </div>

        {/* Interactive Scenario Selector with iOS Liquid Glass Pill */}
        <div className="flex items-center gap-1 bg-stone-950/60 p-1 rounded-full border border-white/10 backdrop-blur-xl text-xs shadow-inner">
          {[
            { id: 'normal', label: 'Normal Baseline', activeClass: 'text-orange-200', bgClass: 'bg-orange-500/20 border-orange-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]' },
            { id: 'cavitation', label: 'Novel Regime (Overheat)', activeClass: 'text-rose-200', bgClass: 'bg-rose-500/20 border-rose-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]' },
            { id: 'transient', label: 'Transient Pulse (Noise)', activeClass: 'text-yellow-200', bgClass: 'bg-yellow-500/20 border-yellow-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]' },
          ].map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as SimulationMode)}
                className={`relative px-3.5 py-1.5 rounded-full font-medium transition-all active:scale-95 ${
                  isActive ? tab.activeClass : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="hero-3d-mode-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className={`absolute inset-0 rounded-full border backdrop-blur-md ${tab.bgClass}`}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D WebGL Viewport + Floating Liquid Glass HUDs */}
      <div className="relative w-full h-[420px] sm:h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08)_0%,rgba(12,10,9,0.96)_72%)] overflow-hidden">
        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top-Left Routing Status Pill */}
        <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-pill text-[11px] font-mono text-stone-200">
          <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>{sensorData.routeLabel}</span>
        </div>

        {/* Top-Right 3D Node Legend */}
        <div className="pointer-events-none hidden sm:flex absolute top-4 right-4 items-center gap-3 px-3 py-1.5 rounded-full liquid-glass-pill text-[10px] font-mono text-stone-300">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-orange-400" /> STM (N=30)
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-yellow-400" /> LTM (&mu;k)
          </span>
          <span className="flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-rose-400" /> CM (DBSCAN)
          </span>
        </div>

        {/* Bottom-Left Live Sensor Telemetry HUD */}
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 lg:right-auto flex flex-wrap gap-2.5">
          <div className="px-3.5 py-2 rounded-xl liquid-glass-nav min-w-[115px]">
            <div className="text-[10px] font-mono text-stone-400">TP2 (Delivery)</div>
            <div className={`text-sm font-bold font-mono tabular-nums ${sensorData.tp2.color}`}>
              {sensorData.tp2.val} <span className="text-[10px] font-normal text-stone-400">{sensorData.tp2.unit}</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl liquid-glass-nav min-w-[125px]">
            <div className="text-[10px] font-mono text-stone-400">Reservoirs (Tank)</div>
            <div className={`text-sm font-bold font-mono tabular-nums ${sensorData.reservoirs.color}`}>
              {sensorData.reservoirs.val} <span className="text-[10px] font-normal text-stone-400">{sensorData.reservoirs.unit}</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl liquid-glass-nav min-w-[115px]">
            <div className="text-[10px] font-mono text-stone-400">Oil Temp</div>
            <div className={`text-sm font-bold font-mono tabular-nums ${sensorData.oil_temp.color}`}>
              {sensorData.oil_temp.val} <span className="text-[10px] font-normal text-stone-400">{sensorData.oil_temp.unit}</span>
            </div>
          </div>
        </div>

        {/* Bottom-Right Contradiction Arbitrator HUD */}
        <div className="pointer-events-none hidden md:block absolute bottom-4 right-4 w-72 p-3.5 rounded-2xl liquid-glass-nav">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-stone-300">C = &alpha;&middot;D + &beta;&middot;T + &gamma;&middot;A</span>
            <span className={`font-bold tabular-nums ${sensorData.score >= 0.32 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {sensorData.score.toFixed(2)} <span className="text-stone-500">/ &tau;=0.32</span>
            </span>
          </div>

          <div className="relative w-full h-2 rounded-full bg-stone-950/80 overflow-hidden mb-2.5 border border-stone-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                sensorData.score >= 0.32
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500'
                  : 'bg-gradient-to-r from-amber-400 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, sensorData.score * 100)}%` }}
            />
            <div className="absolute top-0 bottom-0 left-[32%] w-0.5 bg-white/80" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {mode === 'cavitation' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="font-semibold text-white truncate">{sensorData.state}</div>
              <div className="text-[10px] text-stone-400 truncate">{sensorData.action}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="px-5 py-2.5 bg-[#0C0A09]/95 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Leakage Chronological Ingestion</span>
        </span>
        <span className="font-mono text-stone-500 hidden sm:inline">Move cursor to orbit 3D Neural Core</span>
      </div>
    </div>
  );
};

export default TriMemory3DHero;
