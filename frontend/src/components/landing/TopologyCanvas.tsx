import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
  color: string;
  pulseRadius: number;
  isAlert?: boolean;
}

export const TopologyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initial microservice nodes
    const nodes: Node[] = [
      { x: width * 0.5, y: height * 0.25, vx: 0.1, vy: 0.05, radius: 9, label: 'api-gateway', color: '#06b6d4', pulseRadius: 0 },
      { x: width * 0.32, y: height * 0.45, vx: -0.08, vy: 0.06, radius: 8, label: 'auth-service', color: '#3b82f6', pulseRadius: 0 },
      { x: width * 0.68, y: height * 0.45, vx: 0.07, vy: -0.05, radius: 8, label: 'order-service', color: '#f59e0b', pulseRadius: 0 },
      { x: width * 0.5, y: height * 0.58, vx: -0.05, vy: -0.06, radius: 10, label: 'payment-processor', color: '#f43f5e', pulseRadius: 0, isAlert: true },
      { x: width * 0.22, y: height * 0.72, vx: 0.06, vy: -0.04, radius: 7, label: 'inventory-svc', color: '#3b82f6', pulseRadius: 0 },
      { x: width * 0.78, y: height * 0.72, vx: -0.07, vy: 0.05, radius: 7, label: 'search-indexer', color: '#8b5cf6', pulseRadius: 0 },
      { x: width * 0.38, y: height * 0.82, vx: 0.04, vy: 0.06, radius: 8, label: 'postgres-db', color: '#10b981', pulseRadius: 0 },
      { x: width * 0.62, y: height * 0.82, vx: -0.05, vy: 0.04, radius: 8, label: 'kafka-bus', color: '#8b5cf6', pulseRadius: 0 },
    ];

    // Data packets travelling between nodes
    interface Packet {
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      color: string;
    }

    const packets: Packet[] = [
      { fromIdx: 0, toIdx: 1, progress: 0.1, speed: 0.008, color: '#06b6d4' },
      { fromIdx: 0, toIdx: 2, progress: 0.5, speed: 0.007, color: '#3b82f6' },
      { fromIdx: 2, toIdx: 3, progress: 0.3, speed: 0.009, color: '#f43f5e' },
      { fromIdx: 3, toIdx: 6, progress: 0.7, speed: 0.006, color: '#f59e0b' },
      { fromIdx: 2, toIdx: 7, progress: 0.2, speed: 0.008, color: '#8b5cf6' },
    ];

    // Background ambient particles
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1
    }));

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      step += 0.02;

      // Draw subtle ambient particles
      ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update & draw nodes
      nodes.forEach((n, i) => {
        n.x += n.vx;
        n.y += n.vy;

        // Bounding bounce softly
        if (n.x < width * 0.15 || n.x > width * 0.85) n.vx *= -1;
        if (n.y < height * 0.15 || n.y > height * 0.88) n.vy *= -1;

        // Pulsing alert ring for degraded nodes
        if (n.isAlert) {
          n.pulseRadius = (n.pulseRadius + 0.4) % 35;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + n.pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 63, 94, ${Math.max(0, 0.6 - n.pulseRadius / 35)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Draw connecting edges
      const edgePairs = [
        [0, 1], [0, 2], [2, 3], [3, 6], [2, 7], [1, 6], [2, 4], [7, 5]
      ];

      edgePairs.forEach(([i, j]) => {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const isDegradedEdge = (i === 2 && j === 3) || (i === 3 && j === 6);

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = isDegradedEdge ? 'rgba(244, 63, 94, 0.45)' : 'rgba(59, 130, 246, 0.18)';
        ctx.lineWidth = isDegradedEdge ? 2 : 1.2;
        if (isDegradedEdge) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw animated packets
      packets.forEach(p => {
        p.progress += p.speed;
        if (p.progress >= 1.0) p.progress = 0;

        const from = nodes[p.fromIdx];
        const to = nodes[p.toIdx];
        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw node circles & text
      nodes.forEach(n => {
        // Node outer glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '22';
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Node Label
        ctx.font = '10px Inter, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.radius + 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] lg:h-[520px] rounded-2xl overflow-hidden glass-panel border border-white/[0.08] shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Live Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Restrained Live Incident Alert Overlay */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm p-3.5 rounded-xl bg-midnight-950/90 border border-rose-500/30 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="text-[11px] font-bold tracking-wider text-rose-400 uppercase">PREDICTIVE SRE ALERT</span>
          <span className="text-[10px] text-slate-400 ml-auto font-mono">T-30m Horizon</span>
        </div>
        <p className="text-xs font-semibold text-slate-200">payment-processor &bull; P1 Risk (94.2%)</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Heap memory exhaustion & connection pool starvation detected prior to SLA breach.</p>
      </div>

      {/* Floating Live Telemetry Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-midnight-950/80 border border-white/10 text-xs text-slate-300 font-mono backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>8 Services &bull; 99.89% ML Acc</span>
      </div>
    </div>
  );
};
