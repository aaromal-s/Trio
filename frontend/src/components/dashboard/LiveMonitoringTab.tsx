import React, { useState, useEffect } from 'react';
import {
  Activity, Cpu, HardDrive, Network, AlertCircle, RefreshCw,
  Search, ArrowUpDown, ShieldAlert, Sparkles
} from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { api } from '../../services/api';
import { TelemetrySnapshot } from '../../types';

interface LiveMonitoringTabProps {
  onInvestigate: (serviceName: string) => void;
}

export const LiveMonitoringTab: React.FC<LiveMonitoringTabProps> = ({ onInvestigate }) => {
  const { telemetry, isRefreshing, isPaused, lastUpdatedRelative, refreshNow, togglePause } = useLiveData();
  const [selectedService, setSelectedService] = useState<string>('payment-processor');
  const [history, setHistory] = useState<TelemetrySnapshot[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Fetch time-series history when selected service changes
  useEffect(() => {
    let isMounted = true;
    api.getTelemetryHistory(selectedService, 24)
      .then(res => {
        if (isMounted) setHistory(res);
      })
      .catch(err => console.warn(err));

    return () => {
      isMounted = false;
    };
  }, [selectedService]);

  const filteredTelemetry = telemetry.filter(t =>
    t.service_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const activeSnapshot = telemetry.find(t => t.service_name === selectedService) || telemetry[0];

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-midnight-900/80 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Live Cluster Telemetry Streams</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Prometheus node_exporter & Envoy ingress metric feeds sampled every 5 seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter microservices..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue font-mono"
            />
          </div>

          <button
            onClick={refreshNow}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 text-xs text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Service Table & Real-Time Time-Series Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Services Table List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>MICROSERVICE ({filteredTelemetry.length})</span>
            <span>STATUS / P99</span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredTelemetry.map(svc => {
              const isSelected = svc.service_name === selectedService;
              const isDegraded = svc.cpu_utilization > 80 || svc.memory_utilization > 85;
              const isWarning = svc.cpu_utilization > 65 || svc.latency_ms > 200;

              return (
                <div
                  key={svc.service_name}
                  onClick={() => setSelectedService(svc.service_name)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-blue/15 border-brand-blue shadow-glow-sm'
                      : isDegraded
                      ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-400'
                      : isWarning
                      ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400'
                      : 'bg-midnight-900/80 border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white font-mono">{svc.service_name}</span>
                    <Badge
                      variant={isDegraded ? 'p1' : isWarning ? 'warning' : 'nominal'}
                      pulse={isDegraded}
                    >
                      {isDegraded ? 'DEGRADED' : isWarning ? 'WARNING' : 'NOMINAL'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 font-mono text-xs text-slate-400">
                    <div>
                      <span className="text-[10px] text-slate-500 block">CPU</span>
                      <span className={`font-semibold ${svc.cpu_utilization > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {svc.cpu_utilization.toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">MEM</span>
                      <span className={`font-semibold ${svc.memory_utilization > 85 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {svc.memory_utilization.toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">P99 LAT</span>
                      <span className={`font-semibold ${svc.latency_ms > 400 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {svc.latency_ms.toFixed(0)}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">RPS</span>
                      <span className="font-semibold text-slate-200">{svc.request_throughput.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Service Detail & Time-Series Graphs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {activeSnapshot && (
            <GlassCard glow className="space-y-6">
              
              {/* Header for Selected Service */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold font-mono text-white">{activeSnapshot.service_name}</h3>
                    <Badge variant={activeSnapshot.cpu_utilization > 80 ? 'p1' : 'nominal'} pulse={activeSnapshot.cpu_utilization > 80}>
                      {activeSnapshot.is_anomaly ? 'STATISTICAL ANOMALY' : 'NORMAL ENVELOPE'}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Source: {activeSnapshot.source} &bull; Timestamp: {activeSnapshot.timestamp.slice(11, 19)} UTC
                  </span>
                </div>

                <button
                  onClick={() => onInvestigate(activeSnapshot.service_name)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-blue to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Investigate with Copilot
                </button>
              </div>

              {/* Real-Time Metrics Quad */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CPU Load</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{activeSnapshot.cpu_utilization}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Limit: 100%</span>
                </div>

                <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-violet-400" />
                    <span>Memory RSS</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{activeSnapshot.memory_utilization}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Heap limit: 4.0GB</span>
                </div>

                <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Latency P99</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{activeSnapshot.latency_ms}ms</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">SLA: &lt; 250ms</span>
                </div>

                <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Network className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Error Rate</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{activeSnapshot.error_rate}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">SLO: &lt; 0.1%</span>
                </div>
              </div>

              {/* Time-Series Sparklines / Bar Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Historical Telemetry Stream (Last 2 Hours)</span>
                  <span className="text-slate-400 font-mono">{history.length} snapshots</span>
                </div>

                {/* Simulated Chart Bars for CPU & Memory */}
                <div className="p-4 rounded-xl bg-midnight-950 border border-white/5 space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1.5">
                      <span>CPU Utilization (%)</span>
                      <span className="text-cyan-400 font-bold">{activeSnapshot.cpu_utilization}% current</span>
                    </div>
                    <div className="h-16 flex items-end gap-1.5 pt-2">
                      {history.map((pt, idx) => {
                        const h = Math.min(100, Math.max(8, pt.cpu_utilization));
                        const isHigh = pt.cpu_utilization > 80;
                        return (
                          <div
                            key={idx}
                            title={`${pt.formatted_time}: ${pt.cpu_utilization}%`}
                            className="flex-1 bg-slate-800 rounded-t hover:opacity-80 transition-all relative group"
                            style={{ height: `${h}%` }}
                          >
                            <div className={`w-full h-full rounded-t ${isHigh ? 'bg-rose-500' : 'bg-cyan-500/70'}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1.5">
                      <span>Latency P99 (ms)</span>
                      <span className="text-amber-400 font-bold">{activeSnapshot.latency_ms}ms current</span>
                    </div>
                    <div className="h-16 flex items-end gap-1.5 pt-2">
                      {history.map((pt, idx) => {
                        const h = Math.min(100, Math.max(8, (pt.latency_ms / 800) * 100));
                        const isHigh = pt.latency_ms > 400;
                        return (
                          <div
                            key={idx}
                            title={`${pt.formatted_time}: ${pt.latency_ms}ms`}
                            className="flex-1 bg-slate-800 rounded-t hover:opacity-80 transition-all relative group"
                            style={{ height: `${h}%` }}
                          >
                            <div className={`w-full h-full rounded-t ${isHigh ? 'bg-amber-500' : 'bg-blue-500/70'}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                  <span>-2 Hours ago</span>
                  <span>Observation Timestamp: {new Date().toLocaleTimeString()}</span>
                  <span>Live (Now)</span>
                </div>
              </div>

            </GlassCard>
          )}
        </div>

      </div>

    </div>
  );
};
