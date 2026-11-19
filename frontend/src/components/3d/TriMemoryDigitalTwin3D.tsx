import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Layers, Compass, Sparkles, Droplets, Cpu } from 'lucide-react';

interface TriMemoryDigitalTwin3DProps {
  interactive?: boolean;
  className?: string;
}

type FocusTarget = 'stm' | 'ltm' | 'cm' | 'facility' | 'pump';

export const TriMemoryDigitalTwin3D: React.FC<TriMemoryDigitalTwin3DProps> = ({
  interactive = true,
  className = 'w-full h-[540px]'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTarget, setActiveTarget] = useState<FocusTarget>('stm');
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string>('');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Respect user motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animIntensity = localStorage.getItem('trio_anim_intensity') || 'subtle';
    if (animIntensity === 'off') return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060c18, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 2.8, 8.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Volumetric Lighting & Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const cyanPointLight = new THREE.PointLight(0x06b6d4, 3.0, 9);
    cyanPointLight.position.set(-2.8, 1.8, 0.5);
    scene.add(cyanPointLight);

    const purplePointLight = new THREE.PointLight(0x8b5cf6, 3.2, 10);
    purplePointLight.position.set(0, 3.2, -0.6);
    scene.add(purplePointLight);

    const amberPointLight = new THREE.PointLight(0xf59e0b, 3.0, 9);
    amberPointLight.position.set(2.8, 1.8, 0.5);
    scene.add(amberPointLight);

    const plantLight = new THREE.PointLight(0x38bdf8, 1.5, 6);
    plantLight.position.set(0, -0.2, 1.5);
    scene.add(plantLight);

    // 3. Holographic Ground Grid & Facility Skid Platform
    const gridHelper = new THREE.GridHelper(18, 36, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -1.4;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.22;
    scene.add(gridHelper);

    // Structural Base Skid Plate
    const skidGeo = new THREE.BoxGeometry(7.8, 0.16, 4.4);
    const skidMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.85
    });
    const skidMesh = new THREE.Mesh(skidGeo, skidMat);
    skidMesh.position.set(0, -1.32, 0.5);
    skidMesh.receiveShadow = true;
    scene.add(skidMesh);

    // Skid Outer Accent Ring
    const ringGeo = new THREE.RingGeometry(4.2, 4.35, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.39;
    scene.add(ringMesh);

    // ==========================================
    // 4. REALISTIC WATER TREATMENT FACILITY
    // ==========================================

    // --- Tank 1: Primary Clarifier / Sedimentation Tank ---
    const tank1Group = new THREE.Group();
    tank1Group.position.set(-2.2, -0.4, 0.8);

    // Outer Glass Tank Shell
    const tank1Geo = new THREE.CylinderGeometry(0.75, 0.75, 1.7, 32);
    const tank1Mat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.4,
      ior: 1.333
    });
    const tank1Mesh = new THREE.Mesh(tank1Geo, tank1Mat);
    tank1Group.add(tank1Mesh);

    // Water Fluid Inside Tank 1
    const water1Geo = new THREE.CylinderGeometry(0.70, 0.70, 1.25, 24);
    const water1Mat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.1
    });
    const water1Mesh = new THREE.Mesh(water1Geo, water1Mat);
    water1Mesh.position.y = -0.18;
    tank1Group.add(water1Mesh);

    // Tank Metallic Rings & Reinforcing Collars
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const collar1 = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.03, 12, 32), steelMat);
    collar1.rotation.x = Math.PI / 2;
    collar1.position.y = 0.85;
    tank1Group.add(collar1);

    const collar2 = collar1.clone();
    collar2.position.y = -0.85;
    tank1Group.add(collar2);

    // Level Sensor Probe LIT101
    const probeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.8 });
    const probeMesh = new THREE.Mesh(probeGeo, sensorMat);
    probeMesh.position.set(0.35, 0.2, 0);
    tank1Group.add(probeMesh);

    scene.add(tank1Group);

    // --- Tank 2: Chemical Dosing & Filtration Vessel ---
    const tank2Group = new THREE.Group();
    tank2Group.position.set(2.2, -0.4, 0.8);

    const tank2Geo = new THREE.CylinderGeometry(0.68, 0.68, 1.7, 32);
    const tank2Mat = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      transmission: 0.8,
      thickness: 0.4
    });
    const tank2Mesh = new THREE.Mesh(tank2Geo, tank2Mat);
    tank2Group.add(tank2Mesh);

    const water2Geo = new THREE.CylinderGeometry(0.63, 0.63, 1.05, 24);
    const water2Mat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.6,
      roughness: 0.15
    });
    const water2Mesh = new THREE.Mesh(water2Geo, water2Mat);
    water2Mesh.position.y = -0.28;
    tank2Group.add(water2Mesh);

    const collar3 = collar1.clone();
    collar3.position.y = 0.85;
    tank2Group.add(collar3);
    const collar4 = collar1.clone();
    collar4.position.y = -0.85;
    tank2Group.add(collar4);

    scene.add(tank2Group);

    // --- Industrial Centrifugal Pump P101 ---
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(0, -0.95, 1.1);

    // Motor Housing
    const motorGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.65, 24);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });
    const motorMesh = new THREE.Mesh(motorGeo, motorMat);
    motorMesh.rotation.z = Math.PI / 2;
    pumpGroup.add(motorMesh);

    // Volute Impeller Casing
    const voluteGeo = new THREE.TorusGeometry(0.38, 0.12, 16, 24);
    const voluteMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.25 });
    const voluteMesh = new THREE.Mesh(voluteGeo, voluteMat);
    voluteMesh.position.set(0.42, 0, 0);
    pumpGroup.add(voluteMesh);

    // Pump Mount Base
    const pumpBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.5), steelMat);
    pumpBase.position.set(0.1, -0.32, 0);
    pumpGroup.add(pumpBase);

    // Digital Flow Sensor Pod FIT101 on Pump
    const sensorPodGeo = new THREE.BoxGeometry(0.14, 0.18, 0.12);
    const sensorPodMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.6 });
    const sensorPod = new THREE.Mesh(sensorPodGeo, sensorPodMat);
    sensorPod.position.set(0.42, 0.42, 0);
    pumpGroup.add(sensorPod);

    scene.add(pumpGroup);

    // --- Metallic Interconnecting Pipelines ---
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });

    // Pipe 1: Tank 1 -> Pump P101 Suction
    const pipe1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, -0.95, 0.8),
      new THREE.Vector3(-0.8, -0.95, 0.95),
      new THREE.Vector3(-0.4, -0.95, 1.1)
    ]);
    const pipe1 = new THREE.Mesh(new THREE.TubeGeometry(pipe1Curve, 24, 0.065, 12, false), pipeMat);
    scene.add(pipe1);

    // Pipe 2: Pump P101 Discharge -> Tank 2
    const pipe2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, -0.85, 1.1),
      new THREE.Vector3(0.9, -0.55, 1.0),
      new THREE.Vector3(1.5, -0.55, 0.8)
    ]);
    const pipe2 = new THREE.Mesh(new THREE.TubeGeometry(pipe2Curve, 24, 0.065, 12, false), pipeMat);
    scene.add(pipe2);

    // Pipeline Valve Handwheel
    const valveWheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.02, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.3 })
    );
    valveWheel.rotation.x = Math.PI / 2;
    valveWheel.position.set(0.9, -0.42, 1.0);
    scene.add(valveWheel);

    // ==========================================
    // 5. THE TRI-MEMORY SCIENTIFIC APPARATUS
    // ==========================================

    const posSTM = new THREE.Vector3(-2.4, 1.5, 0.2);
    const posLTM = new THREE.Vector3(0, 2.3, -0.5);
    const posCM = new THREE.Vector3(2.4, 1.5, 0.2);

    const createScientificNode = (colorHex: number, coreGeom: THREE.BufferGeometry) => {
      const group = new THREE.Group();

      // Glowing Inner Core
      const coreMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.65,
        roughness: 0.15,
        metalness: 0.85
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      group.add(core);

      // Holographic Outer Forcefield Shield
      const shieldMat = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.22,
        roughness: 0.08,
        transmission: 0.65,
        thickness: 0.4
      });
      const shield = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 32), shieldMat);
      group.add(shield);

      // Rotating Gyro Orbit Ring
      const orbitMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.7 });
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.016, 12, 48), orbitMat);
      orbit.rotation.x = Math.PI / 3;
      group.add(orbit);

      const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.012, 12, 48), orbitMat);
      orbit2.rotation.y = Math.PI / 4;
      group.add(orbit2);

      return { group, core, shield, orbit, orbit2 };
    };

    // Node 1: Short-Term Memory (STM - Cyan)
    const stm = createScientificNode(0x06b6d4, new THREE.TorusGeometry(0.36, 0.14, 16, 32));
    stm.group.position.copy(posSTM);
    scene.add(stm.group);

    // Node 2: Long-Term Memory (LTM - Violet)
    const ltm = createScientificNode(0x8b5cf6, new THREE.DodecahedronGeometry(0.48, 0));
    ltm.group.position.copy(posLTM);
    scene.add(ltm.group);

    // Node 3: Contradiction Memory (CM - Amber)
    const cm = createScientificNode(0xf59e0b, new THREE.IcosahedronGeometry(0.46, 0));
    cm.group.position.copy(posCM);
    scene.add(cm.group);

    // ==========================================
    // 6. TELEMETRY STREAMS & DATA PACKETS
    // ==========================================

    // Pipe sensor stream -> STM Node (Bottom-up Telemetry Feed)
    const createStream = (p1: THREE.Vector3, p2: THREE.Vector3, ctrlOffset: THREE.Vector3, color: number) => {
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).add(ctrlOffset);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 36, 0.02, 8, false),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 })
      );
      scene.add(tube);
      return { curve, tube };
    };

    // Sensor P101 -> STM
    const streamSensorToSTM = createStream(
      new THREE.Vector3(0.42, -0.5, 1.1),
      posSTM,
      new THREE.Vector3(-0.6, 0.4, 0.6),
      0x06b6d4
    );

    // STM -> LTM
    const streamSTMtoLTM = createStream(posSTM, posLTM, new THREE.Vector3(-0.3, 0.3, 0.2), 0x06b6d4);

    // LTM -> CM
    const streamLTMtoCM = createStream(posLTM, posCM, new THREE.Vector3(0.3, 0.3, 0.2), 0x8b5cf6);

    // CM -> STM (Arbitration Loop)
    const streamCMtoSTM = createStream(posCM, posSTM, new THREE.Vector3(0, -0.4, 0.8), 0xf59e0b);

    // Data energy packets
    const packetGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const packet1 = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    const packet2 = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color: 0xc084fc }));
    const packet3 = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
    const packetSensor = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));

    scene.add(packet1);
    scene.add(packet2);
    scene.add(packet3);
    scene.add(packetSensor);

    // Ambient floating sensor particles
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const colorPalette = [
      new THREE.Color(0x06b6d4),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xf59e0b),
      new THREE.Color(0x38bdf8)
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 12;
      particlePositions[i3 + 1] = Math.random() * 6 - 1.2;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 8;

      const c = colorPalette[i % colorPalette.length];
      particleColors[i3] = c.r;
      particleColors[i3 + 1] = c.g;
      particleColors[i3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleField = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.65 })
    );
    scene.add(particleField);

    // ==========================================
    // 7. RAYCASTING & INTERACTION
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2(-100, -100);

    let targetCamX = 0;
    let targetCamY = 2.8;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mousePos.set(x, y);

      if (interactive && !prefersReducedMotion) {
        targetCamX = x * 0.9;
        targetCamY = 2.8 + y * 0.45;
      }
    };

    const handlePointerClick = () => {
      raycaster.setFromCamera(mousePos, camera);
      const interactiveTargets = [
        stm.shield, ltm.shield, cm.shield,
        tank1Mesh, tank2Mesh, voluteMesh, motorMesh
      ];
      const hits = raycaster.intersectObjects(interactiveTargets);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (hitObj === stm.shield) setActiveTarget('stm');
        else if (hitObj === ltm.shield) setActiveTarget('ltm');
        else if (hitObj === cm.shield) setActiveTarget('cm');
        else if (hitObj === tank1Mesh || hitObj === tank2Mesh) setActiveTarget('facility');
        else if (hitObj === voluteMesh || hitObj === motorMesh) setActiveTarget('pump');
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handlePointerClick);

    // ==========================================
    // 8. ANIMATION LOOP
    // ==========================================
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Camera lerp
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.04);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.04);
      camera.lookAt(0, 0.8, 0);

      // Rotate Skid Ring
      ringMesh.rotation.z += 0.0015;

      // Animate Scientific Cores
      stm.core.rotation.x = elapsed * 0.8;
      stm.core.rotation.y = elapsed * 0.5;
      stm.orbit.rotation.z = elapsed * 0.7;
      stm.orbit2.rotation.x = -elapsed * 0.6;

      ltm.core.rotation.y = elapsed * 0.6;
      ltm.core.rotation.z = elapsed * 0.3;
      ltm.orbit.rotation.z = -elapsed * 0.5;
      ltm.orbit2.rotation.y = elapsed * 0.4;

      cm.core.rotation.y = elapsed * 0.9;
      cm.core.rotation.x = -elapsed * 0.6;
      cm.orbit.rotation.z = elapsed * 0.8;
      cm.orbit2.rotation.x = elapsed * 0.5;

      // Gentle levitation float
      stm.group.position.y = posSTM.y + Math.sin(elapsed * 1.5) * 0.08;
      ltm.group.position.y = posLTM.y + Math.cos(elapsed * 1.3) * 0.08;
      cm.group.position.y = posCM.y + Math.sin(elapsed * 1.7) * 0.08;

      // Animate Water ripples inside tanks
      water1Mesh.position.y = -0.18 + Math.sin(elapsed * 2.0) * 0.02;
      water2Mesh.position.y = -0.28 + Math.cos(elapsed * 1.8) * 0.02;

      // Valve wheel subtle vibration
      valveWheel.rotation.z = Math.sin(elapsed * 4.0) * 0.05;

      // Animate Packets Along Curves
      const tSensor = (elapsed * 0.6) % 1;
      const t1 = (elapsed * 0.45) % 1;
      const t2 = (elapsed * 0.40) % 1;
      const t3 = (elapsed * 0.50) % 1;

      packetSensor.position.copy(streamSensorToSTM.curve.getPointAt(tSensor));
      packet1.position.copy(streamSTMtoLTM.curve.getPointAt(t1));
      packet2.position.copy(streamLTMtoCM.curve.getPointAt(t2));
      packet3.position.copy(streamCMtoSTM.curve.getPointAt(t3));

      // Drift particle dust
      particleField.rotation.y = elapsed * 0.025;

      // Raycaster inspection
      raycaster.setFromCamera(mousePos, camera);
      const interactiveTargets = [
        stm.shield, ltm.shield, cm.shield,
        tank1Mesh, tank2Mesh, voluteMesh, motorMesh
      ];
      const hits = raycaster.intersectObjects(interactiveTargets);
      if (hits.length > 0) {
        container.style.cursor = 'pointer';
        setIsHovered(true);
        const hit = hits[0].object;
        if (hit === stm.shield) setHoverLabel('STM Node • Short-Term Memory');
        else if (hit === ltm.shield) setHoverLabel('LTM Node • Long-Term Memory');
        else if (hit === cm.shield) setHoverLabel('CM Node • Contradiction Memory');
        else if (hit === tank1Mesh || hit === tank2Mesh) setHoverLabel('Industrial Clarifier & Dosing Vessels');
        else if (hit === voluteMesh || hit === motorMesh) setHoverLabel('Pump P101 • Centrifugal Ingestion Stage');
      } else {
        container.style.cursor = 'default';
        setIsHovered(false);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 10. Clean Lifecycle Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handlePointerClick);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div className={`relative ${className} select-none overflow-hidden rounded-2xl bg-slate-950/90`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating 3D Telemetry HUD Card (Bottom Left) */}
      <div className="absolute bottom-5 left-5 max-w-sm rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 p-4 shadow-2xl text-left pointer-events-auto">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {activeTarget === 'stm' && <Activity className="w-4 h-4 text-cyan-400" />}
            {activeTarget === 'ltm' && <Layers className="w-4 h-4 text-purple-400" />}
            {activeTarget === 'cm' && <Compass className="w-4 h-4 text-amber-400" />}
            {activeTarget === 'facility' && <Droplets className="w-4 h-4 text-sky-400" />}
            {activeTarget === 'pump' && <Cpu className="w-4 h-4 text-emerald-400" />}
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {activeTarget === 'stm' && 'Short-Term Memory (STM)'}
              {activeTarget === 'ltm' && 'Long-Term Memory (LTM)'}
              {activeTarget === 'cm' && 'Contradiction Memory (CM)'}
              {activeTarget === 'facility' && 'SWaT Industrial Treatment Vessels'}
              {activeTarget === 'pump' && 'Pump P101 • Dynamic Ingestion'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
            {activeTarget === 'stm' && 'Velocity T'}
            {activeTarget === 'ltm' && 'Distance D'}
            {activeTarget === 'cm' && 'DBSCAN Clusters'}
            {activeTarget === 'facility' && '51 Sensors'}
            {activeTarget === 'pump' && 'FIT101 • DPIT301'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {activeTarget === 'stm' &&
            'Tracks short-term temporal continuity across sliding observation windows. Suppresses high-frequency sensor noise and calculates Temporal Inconsistency (T).'}
          {activeTarget === 'ltm' &&
            'Stores verified baseline prototypes learned unsupervised from normal operating periods. Computes multidimensional Mahalanobis/Euclidean distance (D).'}
          {activeTarget === 'cm' &&
            'Accumulates multi-sensor contradiction records where C = αD + βT + γA exceeds threshold τ = 0.48. DBSCAN density clustering discovers persistent novel states.'}
          {activeTarget === 'facility' &&
            'Physical testbed modeled on the Secure Water Treatment (SWaT) 6-stage purification process. Transmits flow, pressure, level, and chemical sensor signals.'}
          {activeTarget === 'pump' &&
            'Centrifugal pump unit equipped with flow transmitter FIT101 and differential pressure DPIT301 streaming live telemetry into the tri-memory pipeline.'}
        </p>

        {/* Quick Node Selector Tabs */}
        <div className="grid grid-cols-5 gap-1 pt-1 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTarget('stm')}
            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all ${
              activeTarget === 'stm' ? 'bg-cyan-950 border border-cyan-500 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            STM
          </button>
          <button
            onClick={() => setActiveTarget('ltm')}
            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all ${
              activeTarget === 'ltm' ? 'bg-purple-950 border border-purple-500 text-purple-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            LTM
          </button>
          <button
            onClick={() => setActiveTarget('cm')}
            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all ${
              activeTarget === 'cm' ? 'bg-amber-950 border border-amber-500 text-amber-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            CM
          </button>
          <button
            onClick={() => setActiveTarget('facility')}
            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all ${
              activeTarget === 'facility' ? 'bg-sky-950 border border-sky-500 text-sky-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tanks
          </button>
          <button
            onClick={() => setActiveTarget('pump')}
            className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all ${
              activeTarget === 'pump' ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            P101
          </button>
        </div>
      </div>

      {/* Top Floating Target Badge */}
      <div className={`absolute top-4 right-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border text-[11px] font-mono pointer-events-none transition-colors ${
        isHovered ? 'border-cyan-500/50 text-cyan-300' : 'border-slate-800 text-slate-400'
      }`}>
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>{isHovered ? hoverLabel : 'Cinematic Industrial Digital Twin • Hover / Click Components'}</span>
      </div>

      {/* Floating Sensor Telemetry Tags in 3D View */}
      <div className="absolute top-5 left-5 hidden md:flex flex-col gap-1.5 pointer-events-none text-[10px] font-mono">
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>LIT101: 742 mm (Level Tank 1)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>FIT101: 2.45 m³/h (Pump P101)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>DPIT301: 0.48 bar (Differential)</span>
        </div>
      </div>
    </div>
  );
};
