import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Interactive3DBackgroundProps {
  className?: string;
  intensity?: 'full' | 'subtle' | 'off';
}

export const Interactive3DBackground: React.FC<Interactive3DBackgroundProps> = ({
  className = '',
  intensity = 'subtle',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (intensity === 'off') return;
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070c18, 0.0035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    camera.position.set(0, 40, 220);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Subtle Industrial Volumetric Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.0, 300);
    cyanLight.position.set(-80, 50, 40);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2.2, 350);
    purpleLight.position.set(80, 80, -20);
    scene.add(purpleLight);

    // Isometric Industrial Grid Base
    const gridHelper = new THREE.GridHelper(300, 30, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -60;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // Rotating Holographic Platform Ring
    const ringGeo = new THREE.RingGeometry(85, 87, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.28 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -59.5;
    scene.add(ringMesh);

    // Deep Background Industrial Silos / Tanks (Geometric Low-Poly Accent)
    const tankGeo = new THREE.CylinderGeometry(18, 18, 55, 16);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.35,
      wireframe: false
    });

    const tank1 = new THREE.Mesh(tankGeo, tankMat);
    tank1.position.set(-110, -32, -60);
    scene.add(tank1);

    const tank2 = new THREE.Mesh(tankGeo, tankMat);
    tank2.position.set(110, -32, -60);
    scene.add(tank2);

    // Subtly Glowing Pipe Structure
    const pipeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 });
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-110, -10, -60),
      new THREE.Vector3(0, 15, -40),
      new THREE.Vector3(110, -10, -60)
    ]);
    const pipeMesh = new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 32, 2.5, 8, false), pipeMat);
    scene.add(pipeMesh);

    // Particles Grid (Telemetry Sensor Wave)
    const particleCount = intensity === 'full' ? 220 : 130;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x06b6d4); // Cyan
    const color2 = new THREE.Color(0x8b5cf6); // Purple
    const color3 = new THREE.Color(0x38bdf8); // Sky

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 400;
      positions[i3 + 1] = Math.random() * 180 - 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 250;

      const mixedColor = Math.random() > 0.6 ? color1 : (Math.random() > 0.5 ? color2 : color3);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Mouse Tracking with Smooth Lerp
    let targetX = 0;
    let targetY = 40;
    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX - width / 2) * 0.04;
      targetY = 40 + (e.clientY - height / 2) * 0.03;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle cloud and ring rotation
      pointCloud.rotation.y = elapsed * 0.02;
      ringMesh.rotation.z += 0.001;

      // Soft Camera Parallax
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (targetY - camera.position.y) * 0.03;
      camera.lookAt(0, -10, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [intensity]);

  if (intensity === 'off') return null;

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
