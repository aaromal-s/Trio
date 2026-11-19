import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TriMemoryMiniVisualizer3DProps {
  stmUtilization?: number;
  ltmPrototypes?: number;
  cmEvidence?: number;
  className?: string;
}

export const TriMemoryMiniVisualizer3D: React.FC<TriMemoryMiniVisualizer3DProps> = ({
  stmUtilization = 100,
  ltmPrototypes = 3,
  cmEvidence = 48,
  className = 'w-full h-48'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animIntensity = localStorage.getItem('trio_anim_intensity') || 'subtle';
    if (animIntensity === 'off') return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 192;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.8, 6);
    cyanLight.position.set(-1.6, 0.2, 1);
    scene.add(cyanLight);

    // Central Group
    const group = new THREE.Group();
    scene.add(group);

    // 3 Nodes in a Triangle
    const pSTM = new THREE.Vector3(-1.6, -0.2, 0);
    const pLTM = new THREE.Vector3(0, 1.1, -0.2);
    const pCM = new THREE.Vector3(1.6, -0.2, 0);

    const nodeGeo = new THREE.IcosahedronGeometry(0.32, 1);

    // STM Node (Cyan) - scaled with STM fullness
    const stmScale = 0.8 + (stmUtilization / 100) * 0.4;
    const mSTM = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    }));
    mSTM.position.copy(pSTM);
    mSTM.scale.setScalar(stmScale);
    group.add(mSTM);

    // LTM Node (Purple)
    const mLTM = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    }));
    mLTM.position.copy(pLTM);
    group.add(mLTM);

    // Dynamic Prototype Centroid Satellites around LTM
    const satelliteGroup = new THREE.Group();
    satelliteGroup.position.copy(pLTM);
    const numSatellites = Math.min(6, Math.max(1, ltmPrototypes));
    const satGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const satMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 0.8 });
    for (let i = 0; i < numSatellites; i++) {
      const angle = (i / numSatellites) * Math.PI * 2;
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.position.set(Math.cos(angle) * 0.65, 0, Math.sin(angle) * 0.65);
      satelliteGroup.add(sat);
    }
    group.add(satelliteGroup);

    // CM Node (Amber)
    const mCM = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5 + Math.min(0.5, cmEvidence / 100),
      roughness: 0.2,
      metalness: 0.8
    }));
    mCM.position.copy(pCM);
    group.add(mCM);

    // Mini Industrial Inflow Pipe into STM
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.6, -1.4, 0.4),
      new THREE.Vector3(-1.6, -0.7, 0.2),
      pSTM
    ]);
    const pipeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(pipeCurve, 16, 0.04, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.2 })
    );
    group.add(pipeMesh);

    // Orbiting rings around each node
    const ringGeo = new THREE.TorusGeometry(0.5, 0.015, 8, 32);
    const rSTM = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 }));
    rSTM.position.copy(pSTM);
    rSTM.rotation.x = Math.PI / 3;
    group.add(rSTM);

    const rLTM = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6 }));
    rLTM.position.copy(pLTM);
    rLTM.rotation.y = Math.PI / 4;
    group.add(rLTM);

    const rCM = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 }));
    rCM.position.copy(pCM);
    rCM.rotation.z = Math.PI / 6;
    group.add(rCM);

    // Connecting Tubes
    const makeCurve = (v1: THREE.Vector3, v2: THREE.Vector3, col: number) => {
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      mid.y += 0.3;
      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.015, 6, false),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4 })
      );
      group.add(tube);
      return curve;
    };

    const c1 = makeCurve(pSTM, pLTM, 0x06b6d4);
    const c2 = makeCurve(pLTM, pCM, 0x8b5cf6);
    const c3 = makeCurve(pCM, pSTM, 0xf59e0b);

    // Packets
    const pGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const packet1 = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    const packet2 = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: 0xc084fc }));
    const packet3 = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
    group.add(packet1);
    group.add(packet2);
    group.add(packet3);

    // Inflow Packet
    const pInflow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
    group.add(pInflow);

    // Interaction mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
    };
    container.addEventListener('mousemove', onMove);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, mouseX + Math.sin(elapsed * 0.4) * 0.15, 0.05);
        group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -mouseY, 0.05);

        rSTM.rotation.z += 0.02;
        rLTM.rotation.z -= 0.015;
        rCM.rotation.z += 0.025;

        // Rotate Prototype Satellites
        satelliteGroup.rotation.y = elapsed * 0.8;

        // Packet progression
        const tIn = (elapsed * 0.7) % 1;
        const t1 = (elapsed * 0.6) % 1;
        const t2 = (elapsed * 0.5) % 1;
        const t3 = (elapsed * 0.7) % 1;

        pInflow.position.copy(pipeCurve.getPointAt(tIn));
        packet1.position.copy(c1.getPointAt(t1));
        packet2.position.copy(c2.getPointAt(t2));
        packet3.position.copy(c3.getPointAt(t3));
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onMove);

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
  }, [stmUtilization, ltmPrototypes, cmEvidence]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mountRef} className="w-full h-full select-none" />
      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/70 backdrop-blur-md px-2 py-1 rounded border border-slate-800">
        <span className="text-cyan-400">STM: {stmUtilization}%</span>
        <span className="text-purple-400">LTM: {ltmPrototypes} Centroids</span>
        <span className="text-amber-400">CM: {cmEvidence} Clustered</span>
      </div>
    </div>
  );
};
