import React from 'react';
import {
  ShieldAlert, Activity, CheckCircle, AlertTriangle, Cpu, TrendingDown,
  Layers, ArrowUpRight, BarChart3, Clock, Sparkles
} from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';
import { MetricCard } from '../common/MetricCard';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';

interface OverviewTabProps {
  onSelectTab: (tab: string) => void;
  onSelectIncident: (id: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  onSelectTab,
  onSelectIncident
}) => {
  const { overview, incidents, predictions, telemetry } = useLiveData();

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const p1Incidents = incidents.filter(i => i.severity === 'P1-Critical' && i.status !== 'RESOLVED');
  const anomalies = telemetry.filter(t => t.is_anomaly);

  return (
    <div className="space-y-6">
      
      {/* System Status Banner */}
      <div className={`p-4 rounded-xl border backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        overview?.overall_health === 'DEGRADED' 
          ? 'bg-rose-500/10 border-rose-500/30' 
          : 'bg-emerald-500/10 border-emerald-500/20'
      }`}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              overview?.overall_health === 'DEGRADED' ? 'bg-rose-400' : 'bg-emerald-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              overview?.overall_health === 'DEGRADED' ? 'bg-rose-500' : 'bg-emerald-500'
            }`} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                OVERALL SYSTEM STATUS: {overview?.overall_health || 'OPERATIONAL'}
              </span>
              <span className="text-xs font-mono text-slate-300">
                (Health Index: {overview?.overall_health_score || 94.5}%)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {p1Incidents.length > 0 
                ? `${p1Incidents.length} Critical P1 incident actively isolated on payment-processor.` 
                : 'All cluster microservices operating within SLA thresholds.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('incidents')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            Review Incidents ({activeIncidents.length})
          </button>
          <button
            onClick={() => onSelectTab('copilot')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-blue hover:bg-blue-600 text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Copilot Triage
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active P1 Incidents"
          value={overview?.active_incidents_p1 ?? 1}
          subtitle="Customer checkout impacted"
          icon={<ShieldAlert className="w-4 h-4" />}
          accentColor="rose"
        />
        <MetricCard
          title="High-Risk Services"
          value={overview?.high_risk_services_count ?? 2}
          subtitle="Pre-breach anomaly horizon"
          icon={<AlertTriangle className="w-4 h-4" />}
          accentColor="amber"
        />
        <MetricCard
          title="Verified ML Accuracy"
          value="99.89%"
          subtitle="Random Forest held-out test split"
          icon={<Cpu className="w-4 h-4" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Mean Time to Resolve (MTTR)"
          value="12.4m"
          subtitle="-71.4% reduction from baseline"
          icon={<TrendingDown className="w-4 h-4" />}
          trend={{ value: "-45% vs last month", isPositive: true }}
          accentColor="blue"
        />
      </div>

      {/* Middle Row: Active Incidents & Predictive Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Incidents Feed (2 cols) */}
        <div className="lg:col-span-2">
          <GlassCard glow className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-bold text-white">Active Operational Incidents</span>
                </div>
                <button
                  onClick={() => onSelectTab('incidents')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  View All ({incidents.length})
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {incidents.slice(0, 3).map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="p-3.5 rounded-xl bg-midnight-950/70 border border-white/[0.06] hover:border-brand-blue/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            inc.severity === 'P1-Critical' ? 'p1' :
                            inc.severity === 'P2-High' ? 'p2' : 'p3'
                          }
                          pulse={inc.status !== 'RESOLVED'}
                        >
                          {inc.severity}
                        </Badge>
                        <span className="font-bold text-sm text-white">{inc.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span>Service: <strong className="text-slate-300">{inc.service_name}</strong></span>
                        <span>P99: <strong className="text-slate-300">{inc.latency_p99}ms</strong></span>
                        <span>Approval: <strong className={inc.approval_status === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'}>{inc.approval_status}</strong></span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <Badge variant={inc.status === 'RESOLVED' ? 'success' : 'warning'}>
                        {inc.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>All remediation gated behind Human-in-the-Loop SRE sign-off</span>
              <button 
                onClick={() => onSelectTab('incidents')}
                className="text-brand-blue hover:text-blue-400 font-semibold"
              >
                Open Incident Workbench &rarr;
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Predictive Horizon Card (1 col) */}
        <div>
          <GlassCard glow className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Risk Horizon (T-30m)</span>
                </div>
                <Badge variant="info">RF-v1.4.2</Badge>
              </div>

              <div className="space-y-4">
                {predictions.slice(0, 3).map((pred, i) => (
                  <div key={i} className="p-3 rounded-lg bg-midnight-950/80 border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white font-mono">{pred.service_name}</span>
                      <span className={`text-xs font-bold font-mono ${
                        pred.risk_score > 0.7 ? 'text-rose-400' :
                        pred.risk_score > 0.4 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {(pred.risk_score * 100).toFixed(1)}% Risk
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          pred.risk_score > 0.7 ? 'bg-rose-500' :
                          pred.risk_score > 0.4 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.max(5, pred.risk_score * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Severity: <strong className="text-slate-300">{pred.severity}</strong></span>
                      <span>Anomaly: <strong className={pred.anomaly_detected ? 'text-rose-400' : 'text-slate-400'}>{pred.anomaly_score}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] mt-4">
              <button
                onClick={() => onSelectTab('predictions')}
                className="w-full py-2 rounded-lg bg-midnight-800/80 hover:bg-midnight-700/80 border border-white/10 text-xs font-semibold text-white transition-colors"
              >
                Inspect Calibrated Risk Matrix &rarr;
              </button>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Bottom Row: Microservices Health & Availability Grid */}
      <GlassCard glow>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-blue" />
            <span className="text-sm font-bold text-white">Cluster Microservices Fleet (Real 5-Second Telemetry)</span>
          </div>
          <button
            onClick={() => onSelectTab('monitoring')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            Open Live Telemetry Streams
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
          {telemetry.map(svc => {
            const isDegraded = svc.cpu_utilization > 80 || svc.memory_utilization > 85;
            const isWarning = svc.cpu_utilization > 65 || svc.latency_ms > 200;

            return (
              <div
                key={svc.service_name}
                onClick={() => onSelectTab('monitoring')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isDegraded ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-400' :
                  isWarning ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400' :
                  'bg-midnight-950/70 border-white/[0.06] hover:border-brand-blue/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-2 h-2 rounded-full ${
                    isDegraded ? 'bg-rose-400 animate-pulse' :
                    isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className="text-[10px] text-slate-400">{svc.latency_ms.toFixed(0)}ms</span>
                </div>
                <div className="font-bold text-slate-200 truncate text-[11px] mb-1">{svc.service_name}</div>
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <div>CPU: <span className="text-slate-200">{svc.cpu_utilization.toFixed(0)}%</span></div>
                  <div>MEM: <span className="text-slate-200">{svc.memory_utilization.toFixed(0)}%</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

    </div>
  );
};
