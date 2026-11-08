import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Layers, 
  Compass, 
  Activity, 
  HelpCircle, 
  ArrowRight, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

export const TriMemoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stm' | 'ltm' | 'cm'>('stm');
  const [stmData, setStmData] = useState<any>(null);
  const [ltmData, setLtmData] = useState<any>(null);
  const [cmData, setCmData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMemoryData();
  }, []);

  const loadMemoryData = async () => {
    setLoading(true);
    try {
      const [stmRes, ltmRes, cmRes] = await Promise.all([
        api.getStmDetails().catch(() => null),
        api.getLtmDetails().catch(() => null),
        api.getCmDetails(20).catch(() => null)
      ]);
      setStmData(stmRes);
      setLtmData(ltmRes);
      setCmData(cmRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-trio-border gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-trio-cyan" />
            <span>The Tri-Memory Operational Architecture</span>
          </h2>
          <p className="text-xs text-trio-muted mt-1">
            Real-time inspection of Short-Term Memory, Long-Term Memory, and Contradiction Memory.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-trio-card p-1 rounded-xl border border-trio-border text-xs">
          <button
            onClick={() => setActiveTab('stm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'stm' 
                ? 'bg-cyan-950 text-trio-cyan border border-trio-cyan/30' 
                : 'text-trio-muted hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Short-Term (STM)</span>
          </button>

          <button
            onClick={() => setActiveTab('ltm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'ltm' 
                ? 'bg-purple-950 text-trio-purple border border-trio-purple/30' 
                : 'text-trio-muted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Long-Term (LTM)</span>
          </button>

          <button
            onClick={() => setActiveTab('cm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'cm' 
                ? 'bg-amber-950 text-trio-amber border border-trio-amber/30' 
                : 'text-trio-muted hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Contradiction (CM)</span>
          </button>
        </div>
      </div>

      {/* Visual Interactive Tri-Memory Flow Diagram */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-trio-secondary to-trio-card border border-trio-border relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-trio-border/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-trio-cyan animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Tri-Memory Signal Flow &amp; Arbitration
            </h3>
          </div>
          <span className="text-[11px] font-mono text-trio-muted">
            Zero Data Leakage Pipeline
          </span>
        </div>

        {/* Neural Interconnection Graphic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Box 1: STM */}
          <div 
            onClick={() => setActiveTab('stm')}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'stm' 
                ? 'bg-trio-card border-trio-cyan shadow-glow-cyan/25' 
                : 'bg-trio-card/60 border-trio-border hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-trio-cyan flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                <span>1. Short-Term Memory</span>
              </span>
              <span className="text-[10px] font-mono bg-cyan-950 text-trio-cyan px-2 py-0.5 rounded border border-trio-cyan/30">
                Buffer: {stmData?.current_size || 30} / 30
              </span>
            </div>
            <p className="text-xs text-trio-muted leading-relaxed mb-3">
              Sliding observation window tracking local rate of change, momentum, and smoothing transient high-frequency sensor spikes.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              Output: Temporal Inconsistency Factor (T)
            </div>
          </div>

          {/* Box 2: LTM */}
          <div 
            onClick={() => setActiveTab('ltm')}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'ltm' 
                ? 'bg-trio-card border-trio-purple shadow-glow-purple/25' 
                : 'bg-trio-card/60 border-trio-border hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-trio-purple flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>2. Long-Term Memory</span>
              </span>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                {ltmData?.count || 3} Prototypes
              </span>
            </div>
            <p className="text-xs text-trio-muted leading-relaxed mb-3">
              Learned multi-dimensional centroid prototypes and covariance radii representing verified normal factory regimes.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              Output: Prototype Distance Factor (D)
            </div>
          </div>

          {/* Box 3: CM */}
          <div 
            onClick={() => setActiveTab('cm')}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'cm' 
                ? 'bg-trio-card border-trio-amber shadow-glow-amber/25' 
                : 'bg-trio-card/60 border-trio-border hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-trio-amber flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>3. Contradiction Memory</span>
              </span>
              <span className="text-[10px] font-mono bg-amber-950 text-trio-amber px-2 py-0.5 rounded border border-trio-amber/30">
                {cmData?.total_contradiction_records || 185} Evidences
              </span>
            </div>
            <p className="text-xs text-trio-muted leading-relaxed mb-3">
              Stores observations violating known prototypes ($C \ge \tau$). Groups repeated coherent points to discover novel unknown states.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              Output: Discovered Unknown Operational Candidates
            </div>
          </div>
        </div>

        {/* Central Explanatory Banner */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-trio-cyan shrink-0" />
            <span>
              <strong>Arbitration Logic:</strong> If an observation has high prototype distance (D) but zero temporal momentum (T) and repeats consistently, TRIO treats it as an emerging unknown state, not a faulty outlier.
            </span>
          </div>
          <span className="text-trio-cyan font-mono text-[11px] shrink-0 hidden sm:inline">
            C = 0.45&bull;D + 0.30&bull;T + 0.25&bull;A
          </span>
        </div>
      </div>

      {/* Tab 1 Content: Short-Term Memory (STM) */}
      {activeTab === 'stm' && stmData && (
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-trio-cyan" />
                <span>Short-Term Memory (STM) &bull; Sliding Observation Window</span>
              </h3>
              <p className="text-xs text-trio-muted mt-0.5">
                {stmData.explanation}
              </p>
            </div>
            <span className="text-xs font-mono text-trio-cyan bg-cyan-950/40 px-2.5 py-1 rounded border border-trio-cyan/30">
              Capacity: {stmData.capacity} Samples
            </span>
          </div>

          {/* Running Moving Averages and Velocity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-trio-secondary/60 border border-trio-border">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Rolling Moving Averages (&mu;)
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {Object.entries(stmData.moving_average || {}).map(([key, val]: any) => (
                  <div key={key} className="bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">{key}</span>
                    <span className="text-white font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-trio-secondary/60 border border-trio-border">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Temporal Velocity Vector (&Delta;v)
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {Object.entries(stmData.velocity || {}).map(([key, val]: any) => (
                  <div key={key} className="bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">{key}</span>
                    <span className={val >= 0 ? "text-trio-green" : "text-rose-400"}>
                      {val > 0 ? `+${val}` : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Window Readings Table */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Recent Observations in Buffer (Sliding Window FIFO)
            </span>
            <div className="overflow-x-auto rounded-xl border border-trio-border">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-trio-muted border-b border-trio-border">
                  <tr>
                    <th className="py-2 px-3">Timestamp</th>
                    {stmData.recent_readings?.[0] && Object.keys(stmData.recent_readings[0]).filter(k => k !== 'timestamp').map((col) => (
                      <th key={col} className="py-2 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-trio-secondary/40">
                  {stmData.recent_readings?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 text-trio-cyan">{item.timestamp?.slice(-8) || `T-${idx}`}</td>
                      {Object.keys(item).filter(k => k !== 'timestamp').map((col) => (
                        <td key={col} className="py-2 px-3 text-slate-300">{item[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 Content: Long-Term Memory (LTM) */}
      {activeTab === 'ltm' && ltmData && (
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-trio-purple" />
                <span>Long-Term Memory (LTM) &bull; Known Operational-State Prototypes</span>
              </h3>
              <p className="text-xs text-trio-muted mt-0.5">
                {ltmData.explanation}
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded border border-purple-500/30">
              {ltmData.count} Learned Prototypes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ltmData.known_prototypes?.map((proto: any) => (
              <div key={proto.id} className="p-5 rounded-xl bg-trio-secondary/70 border border-trio-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-trio-border/60">
                  <span className="text-sm font-bold text-white">{proto.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">Freq: {proto.frequency} pts</span>
                </div>

                <div className="text-xs text-trio-muted flex justify-between">
                  <span>Dispersion Radius (95% CI):</span>
                  <span className="font-mono text-purple-300 font-bold">{proto.radius}</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Centroid Coordinates (Scaled Feature Vector):
                  </span>
                  <div className="space-y-1 font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {Object.entries(proto.centroid || {}).map(([feat, val]: any) => (
                      <div key={feat} className="flex justify-between">
                        <span className="text-slate-500">{feat}:</span>
                        <span className="text-slate-200">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3 Content: Contradiction Memory (CM) */}
      {activeTab === 'cm' && cmData && (
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-trio-amber" />
                <span>Contradiction Memory (CM) &bull; Evidence Collection Log</span>
              </h3>
              <p className="text-xs text-trio-muted mt-0.5">
                {cmData.explanation}
              </p>
            </div>
            <span className="text-xs font-mono text-trio-amber bg-amber-950/40 px-2.5 py-1 rounded border border-trio-amber/30">
              {cmData.total_contradiction_records} Ingested Violations
            </span>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto rounded-xl border border-trio-border">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-trio-muted border-b border-trio-border">
                <tr>
                  <th className="py-2.5 px-3">Idx</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Score (C)</th>
                  <th className="py-2.5 px-3">Distance (D)</th>
                  <th className="py-2.5 px-3">Temporal (T)</th>
                  <th className="py-2.5 px-3">Anomaly (A)</th>
                  <th className="py-2.5 px-3">Sensor Deviations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-trio-secondary/40">
                {cmData.recent_records?.map((rec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-500">{rec.index}</td>
                    <td className="py-2 px-3 text-white">{rec.timestamp?.slice(-8) || `T-${idx}`}</td>
                    <td className="py-2 px-3 text-trio-amber font-bold">{rec.contradiction_score}</td>
                    <td className="py-2 px-3 text-purple-300">{rec.distance_score}</td>
                    <td className="py-2 px-3 text-trio-cyan">{rec.temporal_score}</td>
                    <td className="py-2 px-3 text-rose-300">{rec.anomaly_score}</td>
                    <td className="py-2 px-3 text-slate-400">
                      {rec.DPIT301 ? `DPIT301: ${rec.DPIT301}, FIT101: ${rec.FIT101}` : 'Multi-sensor anomaly'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

