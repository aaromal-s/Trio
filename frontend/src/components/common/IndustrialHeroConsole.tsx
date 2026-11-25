import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Layers, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  ShieldCheck 
} from 'lucide-react';

type SimulationMode = 'normal' | 'cavitation' | 'transient';

export const IndustrialHeroConsole: React.FC = () => {
  const [mode, setMode] = useState<SimulationMode>('cavitation');
  const [activeSensor, setActiveSensor] = useState<'TP2' | 'Reservoirs' | 'Oil_temp'>('Reservoirs');
  const [tick, setTick] = useState<number>(0);

  // Auto-increment tick for live waveform animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => (prev + 1) % 100);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // Sensor definitions with live simulated values based on mode
  const sensorData = {
    normal: {
      tp2: { val: (0.54 + Math.sin(tick * 0.3) * 0.45).toFixed(2), unit: 'bar', status: 'Nominal Cycling', color: 'text-cyan-400' },
      reservoirs: { val: (9.12 + Math.cos(tick * 0.25) * 0.25).toFixed(2), unit: 'bar', status: 'Nominal Stored', color: 'text-emerald-400' },
      oil_temp: { val: (54.6 + Math.sin(tick * 0.15) * 1.8).toFixed(1), unit: '°C', status: 'Normal Thermal', color: 'text-purple-400' },
      score: 0.14,
      state: 'Known LTM Prototype #1 (Standby / Compression)',
      action: 'Normal baseline compressor cycling (APU MetroPT3)',
      isContradiction: false
    },
    cavitation: {
      tp2: { val: (8.45 - Math.sin(tick * 0.3) * 1.2).toFixed(2), unit: 'bar', status: 'Continuous Load', color: 'text-amber-400' },
      reservoirs: { val: (6.42 + Math.cos(tick * 0.35) * 0.55).toFixed(2), unit: 'bar', status: 'Severe Pressure Drop', color: 'text-rose-400' },
      oil_temp: { val: (86.4 + Math.sin(tick * 0.2) * 2.6).toFixed(1), unit: '°C', status: 'Thermal Overheat', color: 'text-rose-400' },
      score: 0.78,
      state: 'Unknown Operational State #CAND-01',
      action: 'Persistent thermal overload cluster isolated (F1=94.3%)',
      isContradiction: true
    },
    transient: {
      tp2: { val: (0.52 + (tick % 7 === 0 ? 3.4 : 0.05)).toFixed(2), unit: 'bar', status: 'Pneumatic Pulse', color: 'text-cyan-400' },
      reservoirs: { val: (9.10 + (tick % 7 === 0 ? -0.85 : 0.05)).toFixed(2), unit: 'bar', status: 'Transient Flutter', color: 'text-amber-400' },
      oil_temp: { val: (54.8).toFixed(1), unit: '°C', status: 'Stable Thermal', color: 'text-purple-400' },
      score: 0.29,
      state: 'STM Filtered Transient',
      action: 'Exhaust valve pulse buffered in STM (Zero Nuisance Alarms)',
      isContradiction: false
    }
  }[mode];

  // Dynamic SVG Waveform points + area polygon
  const { linePoints, areaPoints, scanY } = React.useMemo(() => {
    const baseVal = 45;
    const amp = mode === 'cavitation' ? 22 : 12;
    const freq = 0.4;
    const spike = mode === 'transient';
    const pts: string[] = [];
    let currentScanY = baseVal;
    const scanIndex = Math.round((tick / 100) * 27);

    for (let i = 0; i < 28; i++) {
      const x = (i / 27) * 440;
      let y = baseVal + Math.sin((i + tick) * freq) * amp;
      if (spike && i === 18) y -= 34;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      if (i === scanIndex) currentScanY = y;
    }

    const line = pts.join(' ');
    const area = `0,90 ${line} 440,90`;
    return { linePoints: line, areaPoints: area, scanY: currentScanY };
  }, [mode, tick]);

  const waveColor = mode === 'cavitation' ? '#f43f5e' : mode === 'transient' ? '#f59e0b' : '#22d3ee';

  return (
    <div className="w-full rounded-2xl bg-[#0B1221]/95 border border-slate-700/60 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden backdrop-blur-2xl">
      {/* Console Top Control Bar */}
      <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-100">SCADA STREAM INGESTION</span>
          </div>
          <span className="text-slate-700 font-mono text-xs hidden sm:inline">&bull;</span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">MetroPT-3 Air Compressor &bull; 7 Channels</span>
        </div>

        {/* Interactive Scenario Selector with Animated Pill */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/90 text-xs">
          {[
            { id: 'normal', label: 'Normal Baseline', activeClass: 'text-cyan-300', bgClass: 'bg-cyan-500/15 border-cyan-500/40' },
            { id: 'cavitation', label: 'Novel Regime (Overheat)', activeClass: 'text-rose-300', bgClass: 'bg-rose-500/15 border-rose-500/40' },
            { id: 'transient', label: 'Transient Pulse (Noise)', activeClass: 'text-amber-300', bgClass: 'bg-amber-500/15 border-amber-500/40' },
          ].map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as SimulationMode)}
                className={`relative px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  isActive ? tab.activeClass : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="hero-mode-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className={`absolute inset-0 rounded-lg border ${tab.bgClass}`}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Column: Real-time Multi-Sensor Telemetry (7 Cols) */}
        <div className="lg:col-span-7 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Continuous Telemetry Stream
                </span>
                <h4 className="text-base font-semibold text-white mt-0.5">
                  Physical Sensor Vectors
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  100 ms Sample Rate
                </span>
              </div>
            </div>

            {/* Live Sensor Metrics Pills */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <button
                onClick={() => setActiveSensor('TP2')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeSensor === 'TP2'
                    ? 'bg-cyan-950/30 border-cyan-500/40'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>TP2 (Delivery Press)</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${mode === 'cavitation' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {sensorData.tp2.val} <span className="text-xs font-normal text-slate-400">{sensorData.tp2.unit}</span>
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${sensorData.tp2.color}`}>
                  {sensorData.tp2.status}
                </div>
              </button>

              <button
                onClick={() => setActiveSensor('Reservoirs')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeSensor === 'Reservoirs'
                    ? 'bg-cyan-950/30 border-cyan-500/40'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Reservoirs (Tank Press)</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${mode === 'cavitation' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {sensorData.reservoirs.val} <span className="text-xs font-normal text-slate-400">{sensorData.reservoirs.unit}</span>
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${sensorData.reservoirs.color}`}>
                  {sensorData.reservoirs.status}
                </div>
              </button>

              <button
                onClick={() => setActiveSensor('Oil_temp')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeSensor === 'Oil_temp'
                    ? 'bg-cyan-950/30 border-cyan-500/40'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>Oil Temp (Thermal)</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${mode === 'cavitation' ? 'bg-rose-400' : 'bg-purple-400'}`} />
                </div>
                <div className="text-lg font-bold font-mono text-white">
                  {sensorData.oil_temp.val} <span className="text-xs font-normal text-slate-400">{sensorData.oil_temp.unit}</span>
                </div>
                <div className={`text-[10px] font-mono mt-0.5 ${sensorData.oil_temp.color}`}>
                  {sensorData.oil_temp.status}
                </div>
              </button>
            </div>

            {/* Live Interactive Oscilloscope Waveform */}
            <div className="relative h-48 rounded-xl bg-[#060B14] border border-slate-800/90 p-3.5 overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 relative z-10">
                <span className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200">CH: {activeSensor}</span>
                  <span>SLIDING WINDOW N=30</span>
                </span>
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="relative flex items-center h-32">
                <div className="hidden sm:flex flex-col justify-between h-28 pr-2 text-[9px] font-mono text-slate-600 select-none">
                  <span>+3&sigma;</span>
                  <span>&mu;</span>
                  <span>-3&sigma;</span>
                </div>

                <svg className="w-full h-28 overflow-visible relative z-10" viewBox="0 0 440 90">
                  <defs>
                    <linearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={waveColor} stopOpacity="0.32" />
                      <stop offset="100%" stopColor={waveColor} stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid guidelines */}
                  <line x1="0" y1="18" x2="440" y2="18" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="45" x2="440" y2="45" stroke="#334155" strokeDasharray="4 4" />
                  <line x1="0" y1="72" x2="440" y2="72" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Gradient area fill */}
                  <polygon fill="url(#waveGlow)" points={areaPoints} />

                  {/* Primary dynamic waveform */}
                  <polyline
                    fill="none"
                    stroke={waveColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={linePoints}
                  />

                  {/* Moving scanner line */}
                  <line
                    x1={(tick * 4.4).toString()}
                    y1="0"
                    x2={(tick * 4.4).toString()}
                    y2="90"
                    stroke={waveColor}
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    opacity="0.7"
                  />

                  {/* Glowing leading-edge cursor dot */}
                  <circle cx={(tick * 4.4).toString()} cy={scanY} r="6" fill={waveColor} opacity="0.25" />
                  <circle cx={(tick * 4.4).toString()} cy={scanY} r="3" fill={waveColor} stroke="#060B14" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Leakage Chronological Ingestion</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">SCADA Bus: Modbus TCP / OPC-UA</span>
          </div>
        </div>

        {/* Right Column: Tri-Memory Arbitration Engine (5 Cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-950/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Tri-Memory Arbitration
                </span>
                <h4 className="text-base font-semibold text-white mt-0.5">
                  Contradiction Scoring
                </h4>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
                &tau; = 0.32
              </div>
            </div>

            {/* Contradiction Score Meter */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-5 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-300">C = &alpha;&bull;D + &beta;&bull;T + &gamma;&bull;A</span>
                <span className={`text-base font-bold tabular-nums ${sensorData.score >= 0.32 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {sensorData.score.toFixed(2)}
                </span>
              </div>

              {/* Progress bar with threshold marker */}
              <div className="relative w-full h-3 rounded-full bg-slate-950 overflow-hidden mb-2 border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    sensorData.score >= 0.32 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, sensorData.score * 100)}%` }}
                />
                <div className="absolute top-0 bottom-0 left-[32%] w-0.5 bg-white/80 shadow-[0_0_6px_white]" title="Threshold 0.32" />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>0.00 (Familiar)</span>
                <span className="text-white">&tau; = 0.32 Threshold</span>
                <span>1.00 (Contradiction)</span>
              </div>
            </div>

            {/* Three Memories Processing Status */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Short-Term Memory (STM)</div>
                    <div className="text-[10px] text-slate-400">Window N=30 &bull; Running Momentum &Delta;v</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400">Active</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Long-Term Memory (LTM)</div>
                    <div className="text-[10px] text-slate-400">3 Learned Baseline Prototypes (&mu;k)</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-purple-400">Synchronized</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    sensorData.isContradiction 
                      ? 'bg-rose-950/60 border-rose-500/40 text-rose-400' 
                      : 'bg-amber-950/60 border-amber-500/30 text-amber-400'
                  }`}>
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Contradiction Memory (CM)</div>
                    <div className="text-[10px] text-slate-400">DBSCAN Density Clustering</div>
                  </div>
                </div>
                <span className={`text-xs font-mono ${sensorData.isContradiction ? 'text-rose-400' : 'text-slate-400'}`}>
                  {sensorData.isContradiction ? 'Clustering' : 'Idle'}
                </span>
              </div>
            </div>
          </div>

          {/* Diagnosis & Classification Banner */}
          <div className={`mt-5 p-3 rounded-xl border text-xs flex items-center gap-3 ${
            mode === 'cavitation'
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              : mode === 'transient'
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="shrink-0">
              {mode === 'cavitation' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="font-semibold">{sensorData.state}</div>
              <div className="text-[11px] opacity-85">{sensorData.action}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default IndustrialHeroConsole;