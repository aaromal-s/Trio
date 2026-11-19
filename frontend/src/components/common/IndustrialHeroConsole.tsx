import React, { useState, useEffect } from 'react';
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

  // Dynamic SVG Waveform points
  const generateWaveform = (baseVal: number, amp: number, freq: number, spike: boolean) => {
    const points: string[] = [];
    for (let i = 0; i < 28; i++) {
      const x = (i / 27) * 440;
      let y = baseVal + Math.sin((i + tick) * freq) * amp;
      if (spike && i === 18) y -= 36;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Console Top Control Bar */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="font-mono text-xs font-semibold text-slate-200">SCADA STREAM INGESTION</span>
          </div>
          <span className="text-slate-600 font-mono text-xs hidden sm:inline">&bull;</span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">MetroPT3 Air Compressor &bull; 7 SCADA Channels</span>
        </div>

        {/* Interactive Scenario Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMode('normal')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              mode === 'normal' 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Normal Baseline
          </button>
          <button
            onClick={() => setMode('cavitation')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              mode === 'cavitation' 
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Novel Regime (Overheat)
          </button>
          <button
            onClick={() => setMode('transient')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              mode === 'transient' 
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transient Pulse (Noise)
          </button>
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
            <div className="relative h-44 rounded-xl bg-slate-950/70 border border-slate-800 p-3 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 relative z-10">
                <span>CHANNEL: {activeSensor} &bull; SLIDING WINDOW N=30</span>
                <span className="text-cyan-400">HISTORICAL HORIZON</span>
              </div>

              <svg className="w-full h-28 overflow-visible relative z-10" viewBox="0 0 440 90">
                <defs>
                  <linearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="440" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="45" x2="440" y2="45" stroke="#334155" strokeDasharray="4 4" />
                <line x1="0" y1="70" x2="440" y2="70" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Primary dynamic waveform */}
                <polyline
                  fill="none"
                  stroke={mode === 'cavitation' ? '#f43f5e' : '#22d3ee'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={generateWaveform(45, mode === 'cavitation' ? 22 : 12, 0.4, mode === 'transient')}
                />

                {/* Moving scanner line */}
                <line
                  x1={(tick * 4.4).toString()}
                  y1="0"
                  x2={(tick * 4.4).toString()}
                  y2="90"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
              </svg>
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
                &tau; = 0.48
              </div>
            </div>

            {/* Contradiction Score Meter */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-5">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-300">C = &alpha;&bull;D + &beta;&bull;T + &gamma;&bull;A</span>
                <span className={`text-base font-bold ${sensorData.score >= 0.48 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {sensorData.score.toFixed(2)}
                </span>
              </div>

              {/* Progress bar with threshold marker */}
              <div className="relative w-full h-3 rounded-full bg-slate-950 overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    sensorData.score >= 0.48 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, sensorData.score * 100)}%` }}
                />
                <div className="absolute top-0 bottom-0 left-[48%] w-0.5 bg-white/60 shadow-[0_0_4px_white]" title="Threshold 0.48" />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>0.00 (Familiar)</span>
                <span className="text-white">&tau; = 0.48 Threshold</span>
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