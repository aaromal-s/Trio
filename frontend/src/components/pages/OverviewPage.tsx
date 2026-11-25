import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { 
  Activity, 
  Layers, 
  Compass, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldAlert,
  Server
} from 'lucide-react';
import { OverviewData } from '../../services/api';
import { TriMemoryPipelineMonitor } from '../common/TriMemoryPipelineMonitor';

interface OverviewPageProps {
  data: OverviewData;
  onNavigate: (view: string) => void;
}

const STATE_COLORS = ['#F97316', '#FACC15', '#34D399', '#FB923C', '#F43F5E'];
const SENSOR_PALETTE = ['#F97316', '#FACC15', '#FB923C', '#34D399', '#F43F5E', '#FDBA74'];

export const OverviewPage: React.FC<OverviewPageProps> = ({ data, onNavigate }) => {
  const { 
    kpis, 
    state_distribution, 
    contradiction_trend, 
    sensor_trends, 
    tri_memory_activity, 
    recent_discoveries, 
    system_health,
    dataset_name,
    is_simulated
  } = data;

  const sensorKeys = React.useMemo(() => {
    if (!sensor_trends || sensor_trends.length === 0) return [];
    return Object.keys(sensor_trends[0]).filter(k => k !== 'timestamp');
  }, [sensor_trends]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Command Status */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-trio-card via-trio-card/90 to-stone-900/90 border border-stone-700/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] gap-3">
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-trio-cyan/30 text-trio-cyan shadow-[0_0_15px_rgba(249,115,22,0.18)]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2">
              <span>Operational Sensor Health &amp; Discovery Stream</span>
              {is_simulated ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-trio-amber border border-trio-amber/30 uppercase tracking-wider">
                  Simulated Demo Data
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-trio-green border border-trio-green/30 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Production Stream
                </span>
              )}
            </h2>
            <p className="text-xs text-trio-muted mt-0.5">
              Active Dataset: <strong className="text-stone-200 font-mono">{dataset_name}</strong> &bull; Zero temporal data leakage enforced
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('discoveries')}
          className="relative z-10 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-trio-cyan/15 hover:bg-trio-cyan/25 text-orange-300 text-xs font-semibold border border-trio-cyan/35 shadow-sm transition-all shrink-0"
        >
          <span>View All Discoveries</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="relative overflow-hidden p-4 rounded-2xl glass-card group">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-orange-500/80 via-orange-400/20 to-transparent" />
          <div className="flex items-center justify-between text-xs text-trio-muted mb-2.5">
            <span className="font-medium">Observations Processed</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-trio-cyan">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {kpis.observations_processed.toLocaleString()}
          </div>
          <div className="text-[11px] text-trio-muted mt-2 flex items-center gap-1.5">
            <span className="text-trio-green font-medium">&bull; 100% streamed</span>
            <span>through STM sliding buffer</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="relative overflow-hidden p-4 rounded-2xl glass-card group">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-yellow-400/80 via-yellow-400/20 to-transparent" />
          <div className="flex items-center justify-between text-xs text-trio-muted mb-2.5">
            <span className="font-medium">Known Operational States</span>
            <div className="p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-trio-purple">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {kpis.known_operational_states}
          </div>
          <div className="text-[11px] text-trio-muted mt-2 flex items-center gap-1.5">
            <span className="text-yellow-300 font-medium">LTM Prototypes</span>
            <span>learned from baseline</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="relative overflow-hidden p-4 rounded-2xl glass-card group">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400/80 via-amber-400/20 to-transparent" />
          <div className="flex items-center justify-between text-xs text-trio-muted mb-2.5">
            <span className="font-medium">Unknown Candidates</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-trio-amber">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-trio-amber font-mono tabular-nums tracking-tight">
            {kpis.unknown_candidates}
          </div>
          <div className="text-[11px] text-trio-muted mt-2 flex items-center gap-1.5">
            <span className="text-amber-400 font-medium">CM Clustered</span>
            <span>via DBSCAN density</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="relative overflow-hidden p-4 rounded-2xl glass-card group">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400/80 via-emerald-400/20 to-transparent" />
          <div className="flex items-center justify-between text-xs text-trio-muted mb-2.5">
            <span className="font-medium">Confirmed Discoveries</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-trio-green">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-trio-green font-mono tabular-nums tracking-tight">
            {kpis.confirmed_discoveries}
          </div>
          <div className="text-[11px] text-trio-muted mt-2 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">Statistically verified</span>
            <span>novel operational regime</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Multi-Sensor Activity Timeline + State Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Sensor Activity Timeline (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-trio-card/90 border border-trio-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Multi-Sensor Physical Dynamics Timeline
              </h3>
              <p className="text-[11px] text-trio-muted">
                {sensorKeys.length > 0 
                  ? `Dynamic Sensor Channels: ${sensorKeys.slice(0, 4).join(', ')}${sensorKeys.length > 4 ? ` (+${sensorKeys.length - 4} more)` : ''}`
                  : 'Multi-channel real-time telemetry'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono">
              {sensorKeys.slice(0, 4).map((key, idx) => (
                <span key={key} className="flex items-center gap-1" style={{ color: SENSOR_PALETTE[idx % SENSOR_PALETTE.length] }}>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: SENSOR_PALETTE[idx % SENSOR_PALETTE.length] }} />
                  {key}
                </span>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensor_trends}>
                <defs>
                  {sensorKeys.slice(0, 4).map((key, idx) => {
                    const color = SENSOR_PALETTE[idx % SENSOR_PALETTE.length];
                    return (
                      <linearGradient key={`grad-${key}`} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.35}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C30', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                />
                {sensorKeys.slice(0, 4).map((key, idx) => {
                  const color = SENSOR_PALETTE[idx % SENSOR_PALETTE.length];
                  return (
                    <Area 
                      key={key} 
                      type="monotone" 
                      dataKey={key} 
                      stroke={color} 
                      strokeWidth={1.75} 
                      fillOpacity={1} 
                      fill={`url(#grad-${key})`} 
                      name={key} 
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational State Distribution Donut Chart (1 Col) */}
        <div className="p-5 rounded-xl bg-trio-card/90 border border-trio-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                State Distribution
              </h3>
              <span className="text-[10px] text-trio-cyan font-mono">Unsupervised</span>
            </div>
            <p className="text-[11px] text-trio-muted mb-4">
              Breakdown of observed operational states vs contradiction flags.
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={state_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {state_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={STATE_COLORS[index % STATE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C30', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-trio-border/60">
            {state_distribution.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: STATE_COLORS[idx % STATE_COLORS.length] }} 
                  />
                  <span className="text-trio-muted truncate" title={item.name}>{item.name}</span>
                </div>
                <span className="font-mono text-white font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Charts Row: Contradiction Score Trend + Tri-Memory Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contradiction Score Timeline (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-trio-card/90 border border-trio-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Contradiction Score Trend</span>
                <span className="font-mono text-trio-cyan text-[10px] bg-cyan-950/60 px-2 py-0.5 rounded border border-trio-cyan/30">
                  C = &alpha;D + &beta;T + &gamma;A
                </span>
              </h3>
              <p className="text-[11px] text-trio-muted">
                Points above threshold &tau; (0.48) trigger Contradiction Memory ingestion.
              </p>
            </div>
            <div className="text-xs font-mono text-trio-amber flex items-center gap-1.5 bg-amber-950/40 px-2.5 py-1 rounded border border-trio-amber/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Threshold &tau; = 0.48</span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={contradiction_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[0, 1]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C30', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="contradiction_score" 
                  stroke="#22D3EE" 
                  strokeWidth={2} 
                  dot={false}
                  name="Combined Score (C)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="distance_score" 
                  stroke="#8B5CF6" 
                  strokeWidth={1} 
                  strokeDasharray="3 3"
                  dot={false}
                  name="Prototype Distance (D)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="anomaly_score" 
                  stroke="#F59E0B" 
                  strokeWidth={1} 
                  strokeDasharray="3 3"
                  dot={false}
                  name="Anomaly Score (A)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tri-Memory Utilization & Engine Health (1 Col) */}
        <div className="p-5 rounded-xl bg-trio-card/90 border border-trio-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Tri-Memory Throughput
              </h3>
              <span className="text-[10px] text-trio-cyan font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-trio-cyan"></span>
                Active Engine
              </span>
            </div>
            <p className="text-[11px] text-trio-muted mb-3">
              Real-time buffer capacity and accumulated evidence.
            </p>

            {/* Industrial Tri-Memory Pipeline Monitor */}
            <div className="mb-4">
              <TriMemoryPipelineMonitor
                stmUtilization={tri_memory_activity.stm_utilization}
                ltmPrototypes={tri_memory_activity.ltm_prototypes}
                cmEvidence={tri_memory_activity.cm_accumulated}
              />
            </div>

            <div className="space-y-3.5">
              {/* STM Meter */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-trio-cyan font-medium">Short-Term Memory (STM)</span>
                  <span className="font-mono text-white">{tri_memory_activity.stm_utilization}% Full</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-trio-cyan rounded-full transition-all duration-500" 
                    style={{ width: `${tri_memory_activity.stm_utilization}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">Sliding temporal buffer tracking sensor momentum</span>
              </div>

              {/* LTM Meter */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-trio-purple font-medium">Long-Term Memory (LTM)</span>
                  <span className="font-mono text-white">{tri_memory_activity.ltm_prototypes} Prototypes</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-trio-purple rounded-full w-full" />
                </div>
                <span className="text-[10px] text-slate-500">Learned centroid coordinates from baseline training</span>
              </div>

              {/* CM Meter */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-trio-amber font-medium">Contradiction Memory (CM)</span>
                  <span className="font-mono text-white">{tri_memory_activity.cm_accumulated} Records</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-trio-amber rounded-full" 
                    style={{ width: `${Math.min(100, (tri_memory_activity.cm_accumulated / 200) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">Avg contradiction score: {tri_memory_activity.cm_average_score}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-trio-border/60 mt-4 flex items-center justify-between text-[11px] text-trio-muted">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-trio-green" />
              <span>Engine Status: {system_health.status}</span>
            </span>
            <span className="font-mono">{system_health.api_latency_ms} ms</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Discoveries Preview Card */}
      {recent_discoveries && recent_discoveries.length > 0 && (
        <div className="p-5 rounded-xl bg-trio-card/80 border border-trio-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-trio-cyan" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Emerging Operational State Discoveries
              </h3>
            </div>
            <button
              onClick={() => onNavigate('discoveries')}
              className="text-xs text-trio-cyan hover:underline flex items-center gap-1"
            >
              <span>Manage Discoveries</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent_discoveries.map((cand, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-trio-secondary/80 border border-trio-border hover:border-trio-cyan/30 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-white text-sm">{cand.candidate_id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    cand.status === 'Confirmed' 
                      ? 'bg-emerald-500/10 text-trio-green border border-trio-green/30'
                      : 'bg-amber-500/10 text-trio-amber border border-trio-amber/30'
                  }`}>
                    {cand.status}
                  </span>
                </div>
                <p className="text-trio-muted text-[11px] leading-relaxed mb-3">
                  {cand.explanation}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-trio-border/60 pt-2">
                  <span>Evidence: {cand.observation_count} points</span>
                  <span>Mean Contradiction: {cand.mean_contradiction_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

