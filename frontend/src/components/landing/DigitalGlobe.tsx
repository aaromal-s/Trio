import React, { useEffect, useRef } from 'react';
import { Zap, Sparkles, CheckCircle2, AlertOctagon, TrendingUp } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
}

interface Arc {
  p1: Point3D;
  p2: Point3D;
  color: string;
}

export const DigitalGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    let width = canvas.parentElement?.clientWidth || 500;
    let height = canvas.parentElement?.clientHeight || 460;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    // Globe parameters - compact and balanced
    const radius = Math.min(width, height) * 0.33;
    const globeCenter = { x: width * 0.52, y: height * 0.5 };
    const tilt = 0.32; // ~18 degrees tilt
    let rotation = 0;

    // Generate latitude/longitude points on the sphere
    const points: Point3D[] = [];
    const latLines = 22;
    for (let i = 0; i < latLines; i++) {
      const lat = ((i + 0.5) / latLines - 0.5) * Math.PI;
      const rAtLat = Math.cos(lat);
      const y = Math.sin(lat) * radius;
      const count = Math.max(6, Math.floor(44 * rAtLat));

      for (let j = 0; j < count; j++) {
        const lon = (j / count) * 2 * Math.PI;
        points.push({
          x: Math.cos(lon) * rAtLat * radius,
          y: y,
          z: Math.sin(lon) * rAtLat * radius,
          baseRadius: 1.1,
        });
      }
    }

    // Datacenter Cluster nodes on earth
    const datacenters: Point3D[] = [
      { x: 0.65 * radius, y: -0.22 * radius, z: 0.72 * radius, baseRadius: 3.5 },
      { x: 0.28 * radius, y: -0.15 * radius, z: 0.95 * radius, baseRadius: 3.5 },
      { x: -0.22 * radius, y: -0.38 * radius, z: 0.88 * radius, baseRadius: 3.5 },
      { x: -0.58 * radius, y: -0.1 * radius, z: 0.8 * radius, baseRadius: 3.5 },
      { x: -0.85 * radius, y: -0.2 * radius, z: 0.48 * radius, baseRadius: 3.5 },
    ];

    // Arcs connecting datacenters
    const arcs: Arc[] = [
      { p1: datacenters[0], p2: datacenters[1], color: '#00f0ff' },
      { p1: datacenters[0], p2: datacenters[2], color: '#3b82f6' },
      { p1: datacenters[2], p2: datacenters[3], color: '#8b5cf6' },
      { p1: datacenters[3], p2: datacenters[4], color: '#00f0ff' },
    ];

    let packetProgress = 0;

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      rotation += 0.003;
      packetProgress = (packetProgress + 0.005) % 1;

      const cosRot = Math.cos(rotation);
      const sinRot = Math.sin(rotation);
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);

      // 1. Atmosphere Radial Glow
      const glowGrad = ctx.createRadialGradient(
        globeCenter.x, globeCenter.y, radius * 0.65,
        globeCenter.x, globeCenter.y, radius * 1.3
      );
      glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      glowGrad.addColorStop(0.85, 'rgba(139, 92, 246, 0.04)');
      glowGrad.addColorStop(1, 'rgba(6, 9, 17, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(globeCenter.x, globeCenter.y, radius * 1.3, 0, 2 * Math.PI);
      ctx.fill();

      // Outer Sphere Silhouette
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(globeCenter.x, globeCenter.y, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Orbital Meridian Ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(globeCenter.x, globeCenter.y, radius * 1.22, radius * 0.38, -0.22, 0, 2 * Math.PI);
      ctx.stroke();

      // Project 3D point helper
      const project = (p: Point3D) => {
        const rx = p.x * cosRot - p.z * sinRot;
        const rz = p.x * sinRot + p.z * cosRot;
        const ry = p.y;

        const ty = ry * cosTilt - rz * sinTilt;
        const tz = ry * sinTilt + rz * cosTilt;
        const tx = rx;

        const perspective = 700;
        const scale = perspective / (perspective - tz);
        const x2d = globeCenter.x + tx * scale;
        const y2d = globeCenter.y + ty * scale;

        return { x: x2d, y: y2d, z: tz, scale };
      };

      // 2. Render Lat/Lon Grid Points
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const proj = project(p);

        const isFront = proj.z > 0;
        const alpha = isFront
          ? Math.min(0.9, 0.25 + (proj.z / radius) * 0.65)
          : Math.max(0.06, 0.15 + (proj.z / radius) * 0.1);

        ctx.fillStyle = isFront
          ? `rgba(0, 240, 255, ${alpha})`
          : `rgba(99, 102, 241, ${alpha})`;

        const dotSize = (p.baseRadius * (isFront ? 1.15 : 0.75)) * proj.scale;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(0.6, dotSize), 0, 2 * Math.PI);
        ctx.fill();
      }

      // 3. Render Arcs between datacenters
      for (const arc of arcs) {
        const proj1 = project(arc.p1);
        const proj2 = project(arc.p2);

        if (proj1.z > -radius * 0.4 || proj2.z > -radius * 0.4) {
          const midX = (proj1.x + proj2.x) / 2;
          const midY = (proj1.y + proj2.y) / 2 - radius * 0.25;

          ctx.strokeStyle = arc.color;
          ctx.lineWidth = 1.3;
          ctx.globalAlpha = Math.max(0.15, Math.min(0.65, (proj1.z + proj2.z + radius) / (2 * radius)));
          ctx.beginPath();
          ctx.moveTo(proj1.x, proj1.y);
          ctx.quadraticCurveTo(midX, midY, proj2.x, proj2.y);
          ctx.stroke();

          // Packet Pulse traveling along the arc
          const t = (packetProgress + 0.3) % 1;
          const px = (1 - t) * (1 - t) * proj1.x + 2 * (1 - t) * t * midX + t * t * proj2.x;
          const py = (1 - t) * (1 - t) * proj1.y + 2 * (1 - t) * t * midY + t * t * proj2.y;

          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = arc.color;
          ctx.globalAlpha = 0.45;
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // 4. Render Datacenter Hubs
      for (const city of datacenters) {
        const proj = project(city);
        if (proj.z > -radius * 0.2) {
          const intensity = Math.max(0.3, (proj.z + radius * 0.2) / (radius * 1.2));

          ctx.fillStyle = `rgba(0, 240, 255, ${0.35 * intensity})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 7 * proj.scale, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 2.8 * proj.scale, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[440px] lg:h-[480px] flex items-center justify-center select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] bg-gradient-radial from-brand-blue/20 via-cyan-500/10 to-transparent rounded-full blur-2xl" />
      </div>

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full relative z-10"
        aria-label="Interactive 3D Digital Globe Telemetry Visual"
      />

      {/* ============================================================== */}
      {/* THREE COMPACT FLOATING GLASS INCIDENT CARDS (SNUG AROUND GLOBE) */}
      {/* ============================================================== */}

      {/* Card 1: Top-Right Critical Incident Alert */}
      <div className="absolute top-2 right-0 sm:top-4 sm:right-2 z-20 animate-float max-w-[210px] sm:max-w-[230px]">
        <div className="p-3 rounded-xl bg-midnight-950/90 border border-rose-500/40 backdrop-blur-xl shadow-glow-sm hover:border-rose-400 transition-colors">
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">CRITICAL INCIDENT</span>
            </div>
            <span className="text-[8px] font-mono text-slate-400">P1-SLA</span>
          </div>

          <div className="text-[11px] font-bold text-white truncate">payment-processor</div>
          
          <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] font-mono bg-midnight-900/80 p-1.5 rounded-lg border border-white/5">
            <div>
              <span className="text-slate-500 text-[8px] block">P99 LATENCY</span>
              <span className="text-rose-400 font-bold">740ms</span>
            </div>
            <div>
              <span className="text-slate-500 text-[8px] block">MEMORY</span>
              <span className="text-rose-400 font-bold">94.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Mid-Left Predictive Risk Warning */}
      <div className="absolute top-20 left-0 sm:top-24 sm:-left-2 z-20 animate-float-delayed max-w-[210px] sm:max-w-[230px]">
        <div className="p-3 rounded-xl bg-midnight-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-glow-cyan hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">PREDICTIVE RADAR</span>
            </div>
            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">99.89%</span>
          </div>

          <p className="text-[11px] font-semibold text-white">Risk: 94.2% Imminent</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 mb-1">
            <div className="bg-gradient-to-r from-amber-400 to-rose-500 h-1.5 rounded-full" style={{ width: '94.2%' }} />
          </div>

          <div className="flex items-center justify-between text-[9px] text-cyan-300 font-mono">
            <span>HORIZON: +30 MIN</span>
            <span>RF-v1.4.2</span>
          </div>
        </div>
      </div>

      {/* Card 3: Bottom-Right AI Copilot Triage Action */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 animate-float-slow max-w-[220px] sm:max-w-[240px]">
        <div className="p-3 rounded-xl bg-midnight-950/90 border border-violet-500/40 backdrop-blur-xl shadow-glow-violet hover:border-violet-300 transition-colors">
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[9px] font-bold text-violet-300 uppercase tracking-wider">AI COPILOT TRIAGE</span>
            </div>
            <span className="text-[8px] text-emerald-400 font-mono">Verified</span>
          </div>

          <div className="text-[11px] text-slate-200">
            <span className="text-white font-semibold block truncate">Scale Replica Pool (x2)</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Blast radius: 1 pod &bull; Zero downtime</span>
          </div>

          <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px]">
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Awaiting SRE Sign-off
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
