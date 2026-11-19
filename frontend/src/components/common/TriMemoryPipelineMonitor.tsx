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
        <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">STM Buffer</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {stmUtilization}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Sliding N=30
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, stmUtilization)}%` }}
            />
          </div>
        </div>

        {/* Node 2: LTM */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">LTM Baseline</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {ltmPrototypes} <span className="text-xs font-normal text-slate-400">clusters</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Learned &mu;k
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full w-full" />
          </div>
        </div>

        {/* Node 3: CM */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">CM Evidence</span>
            <Compass className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {cmEvidence} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            DBSCAN Ready
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (cmEvidence / 30) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Signal Routing Pipeline Indicator */}
      <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Contradiction Scorer Active
        </span>
        <span className="text-cyan-400">&tau; &ge; 0.48 Routing</span>
      </div>
    </div>
  );
};
export default TriMemoryPipelineMonitor;