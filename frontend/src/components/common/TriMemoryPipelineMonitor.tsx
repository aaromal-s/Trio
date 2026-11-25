import React from 'react';
import { Activity, Layers, Compass } from 'lucide-react';

interface TriMemoryPipelineMonitorProps {
  stmUtilization: number;
  ltmPrototypes: number;
  cmEvidence: number;
  className?: string;
}

export const TriMemoryPipelineMonitor: React.FC<TriMemoryPipelineMonitorProps> = ({
  stmUtilization,
  ltmPrototypes,
  cmEvidence,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-3 gap-2">
        {/* Node 1: STM */}
        <div className="p-3 rounded-xl bg-stone-950/60 border border-orange-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400">STM Buffer</span>
            <Activity className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">
            {stmUtilization}%
          </div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
            Sliding N=30
          </div>
          <div className="w-full h-1 bg-stone-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, stmUtilization)}%` }}
            />
          </div>
        </div>

        {/* Node 2: LTM */}
        <div className="p-3 rounded-xl bg-stone-950/60 border border-yellow-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-yellow-400">LTM Baseline</span>
            <Layers className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">
            {ltmPrototypes} <span className="text-xs font-normal text-stone-400">clusters</span>
          </div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
            Learned &mu;k
          </div>
          <div className="w-full h-1 bg-stone-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full w-full" />
          </div>
        </div>

        {/* Node 3: CM */}
        <div className="p-3 rounded-xl bg-stone-950/60 border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">CM Evidence</span>
            <Compass className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">
            {cmEvidence} <span className="text-xs font-normal text-stone-400">pts</span>
          </div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
            DBSCAN Ready
          </div>
          <div className="w-full h-1 bg-stone-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (cmEvidence / 30) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Signal Routing Pipeline Indicator */}
      <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/90 flex items-center justify-between text-[11px] font-mono text-stone-400 shadow-inner">
        <span className="flex items-center gap-2 text-stone-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          Contradiction Scorer Active
        </span>
        <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/25 text-orange-300">&tau; &ge; 0.32 Routing</span>
      </div>
    </div>
  );
};
export default TriMemoryPipelineMonitor;