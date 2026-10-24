import React, { useEffect, useRef } from 'react';
import { ShieldAlert, Zap, Sparkles, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  isCity?: boolean;
  name?: string;
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

    let width = canvas.parentElement?.clientWidth || 540;
    let height = canvas.parentElement?.clientHeight || 540;

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

    const radius = Math.min(width, height) * 0.38;
    const globeCenter = { x: width * 0.5, y: height * 0.52 };
    const tilt = 0.38; // ~22 degrees tilt
    let rotation = 0;

    // Generate latitude/longitude points on the sphere
    const points: Point3D[] = [];
    const latLines = 24;
    for (let i = 0; i < latLines; i++) {
      const lat = ((i + 0.5) / latLines - 0.5) * Math.PI; // -PI/2 to PI/2
      const rAtLat = Math.cos(lat);
      const y = Math.sin(lat) * radius;
      const count = Math.max(6, Math.floor(48 * rAtLat));

      for (let j = 0; j < count; j++) {
        const lon = (j / count) * 2 * Math.PI;
        points.push({
          x: Math.cos(lon) * rAtLat * radius,
          y: y,
          z: Math.sin(lon) * rAtLat * radius,
          baseRadius: 1.2,
        });
      }
    }

    // Datacenter Cluster nodes on earth
    const datacenters: Point3D[] = [
      { x: 0.65 * radius, y: -0.25 * radius, z: 0.7 * radius, baseRadius: 3.5, isCity: true, name: 'US-East (N. Virginia)' },
      { x: 0.3 * radius, y: -0.15 * radius, z: 0.94 * radius, baseRadius: 3.5, isCity: true, name: 'US-West (Oregon)' },
      { x: -0.2 * radius, y: -0.4 * radius, z: 0.88 * radius, baseRadius: 3.5, isCity: true, name: 'EU-Central (Frankfurt)' },
      { x: -0.6 * radius, y: -0.1 * radius, z: 0.78 * radius, baseRadius: 3.5, isCity: true, name: 'AP-South (Mumbai)' },
      { x: -0.85 * radius, y: -0.2 * radius, z: 0.45 * radius, baseRadius: 3.5, isCity: true, name: 'AP-East (Tokyo)' },
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
      // Pause animation if tab is hidden
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      rotation += 0.0035;
      packetProgress = (packetProgress + 0.006) % 1;

      const cosRot = Math.cos(rotation);
      const sinRot = Math.sin(rotation);
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);

      // 1. Atmosphere Radial Glow
      const glowGrad = ctx.createRadialGradient(
        globeCenter.x, globeCenter.y, radius * 0.7,
        globeCenter.x, globeCenter.y, radius * 1.35
      );
      glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.07)');
      glowGrad.addColorStop(0.85, 'rgba(139, 92, 246, 0.04)');
      glowGrad.addColorStop(1, 'rgba(6, 9, 17, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(globeCenter.x, globeCenter.y, radius * 1.35, 0, 2 * Math.PI);
      ctx.fill();

      // Outer Sphere Silhouette Ring
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(globeCenter.x, globeCenter.y, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Outer Equatorial Ring with slight tilt
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(globeCenter.x, globeCenter.y, radius * 1.22, radius * 0.42, -0.25, 0, 2 * Math.PI);
      ctx.stroke();

      // Project 3D point helper
      const project = (p: Point3D) => {
        // Rotate around Y
        const rx = p.x * cosRot - p.z * sinRot;
        const rz = p.x * sinRot + p.z * cosRot;
        const ry = p.y;

        // Tilt around X
        const ty = ry * cosTilt - rz * sinTilt;
        const tz = ry * sinTilt + rz * cosTilt;
        const tx = rx;

        // Perspective
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

        // Depth cue: front hemisphere points are brighter
        const isFront = proj.z > 0;
        const alpha = isFront
          ? Math.min(0.9, 0.25 + (proj.z / radius) * 0.65)
          : Math.max(0.06, 0.18 + (proj.z / radius) * 0.12);

        ctx.fillStyle = isFront
          ? `rgba(0, 240, 255, ${alpha})`
          : `rgba(99, 102, 241, ${alpha})`;

        const dotSize = (p.baseRadius * (isFront ? 1.2 : 0.8)) * proj.scale;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(0.6, dotSize), 0, 2 * Math.PI);
        ctx.fill();
      }

      // 3. Render Arcs between datacenters
      for (const arc of arcs) {
        const proj1 = project(arc.p1);
        const proj2 = project(arc.p2);

        // Only draw if at least one point is somewhat visible
        if (proj1.z > -radius * 0.5 || proj2.z > -radius * 0.5) {
          const midX = (proj1.x + proj2.x) / 2;
          const midY = (proj1.y + proj2.y) / 2 - radius * 0.28;

          ctx.strokeStyle = arc.color;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = Math.max(0.15, Math.min(0.7, (proj1.z + proj2.z + radius) / (2 * radius)));
          ctx.beginPath();
          ctx.moveTo(proj1.x, proj1.y);
          ctx.quadraticCurveTo(midX, midY, proj2.x, proj2.y);
          ctx.stroke();

          // Packet Pulse traveling along the arc
          const t = (packetProgress + 0.25) % 1;
          const px = (1 - t) * (1 - t) * proj1.x + 2 * (1 - t) * t * midX + t * t * proj2.x;
          const py = (1 - t) * (1 - t) * proj1.y + 2 * (1 - t) * t * midY + t * t * proj2.y;

          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(px, py, 2.8, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = arc.color;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // 4. Render Datacenter Hubs
      for (const city of datacenters) {
        const proj = project(city);
        if (proj.z > -radius * 0.2) {
          const intensity = Math.max(0.3, (proj.z + radius * 0.2) / (radius * 1.2));

          // Outer halo pulse
          ctx.fillStyle = `rgba(0, 240, 255, ${0.35 * intensity})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 8 * proj.scale, 0, 2 * Math.PI);
          ctx.fill();

          // Bright center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 3 * proj.scale, 0, 2 * Math.PI);
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
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px] flex items-center justify-center select-none overflow-visible">
      
      {/* Background ambient lighting behind the globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] bg-gradient-radial from-brand-blue/20 via-cyan-500/10 to-transparent rounded-full blur-2xl" />
      </div>

      {/* 3D Canvas Visual Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full relative z-10"
        aria-label="Interactive 3D Digital Globe Telemetry Visual"
      />

      {/* ============================================================== */}
      {/* FLOATING GLASSMORPHISM INCIDENT CARDS SURROUNDING THE GLOBE */}
      {/* ============================================================== */}

      {/* Card 1: Top-Right Critical Latency & Memory Alert */}
      <div className="absolute top-2 -right-2 sm:top-6 sm:right-0 z-20 animate-float max-w-[240px] sm:max-w-[260px]">
        <div className="p-3.5 rounded-2xl bg-midnight-950/85 border border-rose-500/40 backdrop-blur-xl shadow-glow-sm hover:border-rose-400 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">CRITICAL INCIDENT</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400">P1-SLA</span>
          </div>

          <div className="text-xs font-semibold text-white truncate">payment-processor</div>
          
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-midnight-900/80 p-2 rounded-lg border border-white/5">
            <div>
              <span className="text-slate-500 text-[9px] block">P99 LATENCY</span>
              <span className="text-rose-400 font-bold">740 ms</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] block">HEAP MEMORY</span>
              <span className="text-rose-400 font-bold">94.2%</span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Predicted Risk:</span>
            <span className="font-bold font-mono text-rose-400">94.2% (+30m)</span>
          </div>
        </div>
      </div>

      {/* Card 2: Top-Left Pre-Breach Machine Learning Early Warning */}
      <div className="absolute top-10 -left-2 sm:top-14 sm:left-0 z-20 animate-float-delayed max-w-[230px] sm:max-w-[250px]">
        <div className="p-3.5 rounded-2xl bg-midnight-950/85 border border-cyan-500/40 backdrop-blur-xl shadow-glow-cyan hover:border-cyan-300 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">PREDICTIVE RADAR</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">99.89%</span>
          </div>

          <p className="text-xs font-semibold text-white">Pre-Cursor Detected</p>
          <p className="text-[10px] text-slate-300 mt-1 leading-snug">
            Thread lock accumulation flagged 26 minutes prior to customer outage.
          </p>

          <div className="mt-2 flex items-center gap-2 text-[9px] text-cyan-300 font-mono">
            <span>HORIZON: +30 MIN</span>
            <span>&bull;</span>
            <span>RF-v1.4.2</span>
          </div>
        </div>
      </div>

      {/* Card 3: Bottom-Right AI Copilot Remediation Proposal */}
      <div className="absolute -bottom-2 right-2 sm:bottom-4 sm:right-6 z-20 animate-float-slow max-w-[250px] sm:max-w-[280px]">
        <div className="p-3.5 rounded-2xl bg-midnight-950/85 border border-violet-500/40 backdrop-blur-xl shadow-glow-violet hover:border-violet-300 transition-colors">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">AI COPILOT TRIAGE</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Governed</span>
          </div>

          <div className="text-xs text-slate-200">
            <span className="text-white font-semibold block">Scale Replica Pool (x2)</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Blast radius: 1 pod &bull; Guaranteed rollback</span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Awaiting Lead SRE Sign-off
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
