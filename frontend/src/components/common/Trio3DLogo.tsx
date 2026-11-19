import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Trio3DLogoProps {
  size?: number;
  interactive?: boolean;
  className?: string;
}

export const Trio3DLogo: React.FC<Trio3DLogoProps> = ({
  size = 120,
  interactive = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for the 3-node tri-memory system
    const trioGroup = new THREE.Group();
    scene.add(trioGroup);

    // Node Positions (Equilateral Triangle in 3D)
    // STM: Top Left (Cyan), LTM: Top Right (Purple), CM: Bottom (Amber)
    const r = 1.15;
    const posSTM = new THREE.Vector3(-r * 0.866, r * 0.5, 0);
    const posLTM = new THREE.Vector3(r * 0.866, r * 0.5, 0);
    const posCM = new THREE.Vector3(0, -r * 0.8, 0.15);

    // Node 1: STM (Cyan #06B6D4)
    const stmGeometry = new THREE.SphereGeometry(0.24, 24, 24);
    const stmMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.8,
    });
    const nodeSTM = new THREE.Mesh(stmGeometry, stmMaterial);
    nodeSTM.position.copy(posSTM);
    trioGroup.add(nodeSTM);

    // Node 2: LTM (Purple #8B5CF6)
    const ltmGeometry = new THREE.SphereGeometry(0.24, 24, 24);
    const ltmMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.8,
    });
    const nodeLTM = new THREE.Mesh(ltmGeometry, ltmMaterial);
    nodeLTM.position.copy(posLTM);
    trioGroup.add(nodeLTM);

    // Node 3: CM (Amber #F59E0B)
    const cmGeometry = new THREE.SphereGeometry(0.26, 24, 24);
    const cmMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const nodeCM = new THREE.Mesh(cmGeometry, cmMaterial);
    nodeCM.position.copy(posCM);
    trioGroup.add(nodeCM);

    // Connecting Tri-Memory Lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      linewidth: 1.5,
    });
    const linePoints = [posSTM, posLTM, posCM, posSTM];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const triangleLines = new THREE.Line(lineGeometry, lineMaterial);
    trioGroup.add(triangleLines);

    // Dynamic data packets (traveling particles along connections)
    const packetGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const packet1 = new THREE.Mesh(packetGeo, packetMat);
    const packet2 = new THREE.Mesh(packetGeo, packetMat);
    trioGroup.add(packet1);
    trioGroup.add(packet2);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 0.8;
      mouseY = -y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous gentle rotation + mouse target interpolation
        trioGroup.rotation.y += 0.008;
        trioGroup.rotation.y = THREE.MathUtils.lerp(trioGroup.rotation.y, trioGroup.rotation.y + mouseX * 0.05, 0.05);
        trioGroup.rotation.x = THREE.MathUtils.lerp(trioGroup.rotation.x, mouseY * 0.5, 0.05);
        trioGroup.rotation.z = Math.sin(elapsedTime * 0.5) * 0.05;

        // Animate traveling data packets
        const t1 = (elapsedTime * 0.6) % 1;
        const t2 = (elapsedTime * 0.4 + 0.5) % 1;

        if (t1 < 0.5) {
          packet1.position.lerpVectors(posSTM, posLTM, t1 * 2);
        } else {
          packet1.position.lerpVectors(posLTM, posCM, (t1 - 0.5) * 2);
        }

        packet2.position.lerpVectors(posCM, posSTM, t2);

        // Subtle node pulsing
        const pulse = 1 + Math.sin(elapsedTime * 3) * 0.04;
        nodeSTM.scale.set(pulse, pulse, pulse);
        nodeLTM.scale.set(pulse, pulse, pulse);
        nodeCM.scale.set(1.05 + Math.cos(elapsedTime * 3) * 0.05, 1.05 + Math.cos(elapsedTime * 3) * 0.05, 1.05 + Math.cos(elapsedTime * 3) * 0.05);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
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
  }, [size, interactive]);

  return (
    <div
      ref={mountRef}
      className={`inline-flex items-center justify-center relative cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
      title="TRIO: Short-Term, Long-Term, and Contradiction Memory System"
    />
  );
};
