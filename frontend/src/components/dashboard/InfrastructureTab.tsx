import React, { useState, useEffect } from 'react';
import {
  Layers, Server, Database, Activity, AlertTriangle, CheckCircle2,
  Cpu, HardDrive, RefreshCw, Sparkles, ArrowRight
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { api } from '../../services/api';
import { TopologyNode, TopologyEdge } from '../../types';

interface InfrastructureTabProps {
  onInvestigateNode: (serviceName: string) => void;
}

export const InfrastructureTab: React.FC<InfrastructureTabProps> = ({ onInvestigateNode }) => {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [edges, setEdges] = useState<TopologyEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getTopology()
      .then(res => {
        setNodes(res.nodes);
        setEdges(res.edges);
        setSelectedNode(res.nodes.find(n => n.status === 'DEGRADED') || res.nodes[0]);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'gateway': return <Server className="w-4 h-4 text-cyan-400" />;
      case 'database': return <Database className="w-4 h-4 text-emerald-400" />;
      case 'cache': return <HardDrive className="w-4 h-4 text-violet-400" />;
      case 'eventbus': return <Activity className="w-4 h-4 text-amber-400" />;
      default: return <Cpu className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-blue" />
            <h2 className="text-lg font-bold text-white tracking-tight">Microservices Topology & Dependencies</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive dependency topology graph illustrating real-time call paths, latency envelopes, and degraded components.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant="p1" pulse>1 Degraded</Badge>
          <Badge variant="warning">1 Warning</Badge>
          <Badge variant="nominal">{nodes.length - 2} Healthy</Badge>
        </div>
      </div>

      {/* Main Grid: Interactive Topology Matrix & Node Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topology Map (8 cols) */}
        <div className="lg:col-span-8">
          <GlassCard glow className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Service Tiers & Call Graph
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Click any service to inspect</span>
            </div>

            {/* Visual Node Grid Arranged by Architecture Tier */}
            <div className="space-y-6 py-2">
              
              {/* Tier 1: Ingress Gateway */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 font-mono">
                  Tier 1 &bull; Ingress & Edge Proxy
                </span>
                <div className="grid grid-cols-1 gap-3">
                  {nodes.filter(n => n.tier === 'edge').map(n => (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNode(n)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedNode?.id === n.id ? 'bg-cyan-500/20 border-cyan-400 shadow-glow-cyan' : 'bg-midnight-950 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-midnight-900 border border-white/10">{getNodeIcon(n.type)}</div>
                        <div>
                          <span className="font-bold text-white text-xs font-mono">{n.label}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">Throughput: {n.rps} RPS &bull; Latency: {n.latency_ms}ms</span>
                        </div>
                      </div>
                      <Badge variant="nominal">HEALTHY</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connecting Pipe */}
              <div className="flex justify-center -my-2 text-slate-600 font-mono text-xs">
                &darr; gRPC / HTTP2 Secure Mesh
              </div>

              {/* Tier 2: Core Microservices */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 font-mono">
                  Tier 2 &bull; Application Services
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {nodes.filter(n => n.tier === 'business' || n.tier === 'identity' || n.tier === 'ai' || n.tier === 'worker').map(n => {
                    const isSelected = selectedNode?.id === n.id;
                    const isDegraded = n.status === 'DEGRADED';
                    const isWarning = n.status === 'WARNING';

                    return (
                      <div
                        key={n.id}
                        onClick={() => setSelectedNode(n)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                          isSelected
                            ? 'bg-brand-blue/20 border-brand-blue shadow-glow-sm'
                            : isDegraded
                            ? 'bg-rose-500/10 border-rose-500/40 hover:border-rose-400'
                            : isWarning
                            ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400'
                            : 'bg-midnight-950 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-midnight-900 border border-white/10 mt-0.5">{getNodeIcon(n.type)}</div>
                          <div>
                            <span className="font-bold text-white text-xs font-mono block">{n.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {n.rps ? `${n.rps} RPS` : ''} {n.latency_ms ? `• ${n.latency_ms}ms` : ''}
                            </span>
                            {n.cpu && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                CPU: {n.cpu}% &bull; Mem: {n.mem}%
                              </span>
                            )}
                          </div>
                        </div>

                        <Badge
                          variant={isDegraded ? 'p1' : isWarning ? 'warning' : 'nominal'}
                          pulse={isDegraded}
                        >
                          {n.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Connecting Pipe */}
              <div className="flex justify-center -my-2 text-slate-600 font-mono text-xs">
                &darr; Persistence & Storage Layer
              </div>

              {/* Tier 3: Storage & Messaging Tier */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 font-mono">
                  Tier 3 &bull; Database & Event Bus
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {nodes.filter(n => n.tier === 'storage' || n.tier === 'messaging').map(n => (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNode(n)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedNode?.id === n.id ? 'bg-violet-500/20 border-violet-400' : 'bg-midnight-950 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-midnight-900 border border-white/10">{getNodeIcon(n.type)}</div>
                        <span className="font-bold text-white text-xs font-mono">{n.label}</span>
                      </div>
                      <Badge variant="nominal">OK</Badge>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </GlassCard>
        </div>

        {/* Node Inspection Panel (4 cols) */}
        <div className="lg:col-span-4">
          {selectedNode ? (
            <GlassCard glow className="space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  {getNodeIcon(selectedNode.type)}
                  <h3 className="text-base font-bold text-white font-mono">{selectedNode.label}</h3>
                </div>
                <Badge variant={selectedNode.status === 'DEGRADED' ? 'p1' : selectedNode.status === 'WARNING' ? 'warning' : 'nominal'}>
                  {selectedNode.status}
                </Badge>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-midnight-950 border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Node Identifier:</span>
                    <span className="text-white font-bold">{selectedNode.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Architecture Tier:</span>
                    <span className="text-cyan-300 uppercase">{selectedNode.tier}</span>
                  </div>
                  {selectedNode.rps && (
                    <div className="flex justify-between text-slate-400">
                      <span>Throughput:</span>
                      <span className="text-white">{selectedNode.rps} RPS</span>
                    </div>
                  )}
                  {selectedNode.latency_ms && (
                    <div className="flex justify-between text-slate-400">
                      <span>Latency P99:</span>
                      <span className={selectedNode.latency_ms > 400 ? 'text-rose-400 font-bold' : 'text-white'}>
                        {selectedNode.latency_ms}ms
                      </span>
                    </div>
                  )}
                </div>

                {/* Dependencies */}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">
                    Connected Dependencies
                  </span>
                  <div className="space-y-1 text-[11px]">
                    {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((e, idx) => {
                      const isTarget = e.from === selectedNode.id;
                      const partner = isTarget ? e.to : e.from;
                      return (
                        <div key={idx} className="p-2 rounded bg-midnight-950 border border-white/5 flex justify-between items-center">
                          <span className="text-slate-300 font-mono">
                            {isTarget ? `-> ${partner}` : `<- ${partner}`}
                          </span>
                          <span className="text-[9px] text-slate-500 font-sans px-1.5 py-0.5 rounded bg-white/5">
                            {e.protocol}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedNode.status === 'DEGRADED' && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1 font-sans">
                    <span className="font-bold block">Degraded Service Alert</span>
                    <p>Monitored thresholds exceeded. Immediate rolling restart or thread scale-up recommended.</p>
                  </div>
                )}

                <button
                  onClick={() => onInvestigateNode(selectedNode.id)}
                  className="w-full py-2.5 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors font-sans"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Triage with Copilot
                </button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="text-center py-12 text-slate-500 text-xs">
              Select a node to inspect dependencies
            </GlassCard>
          )}
        </div>

      </div>

    </div>
  );
};
