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
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  Layers, 
  Compass, 
  CheckCircle2, 
  Database, 
  Cpu, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldAlert,
  Server,
  Zap,
  Info
} from 'lucide-react';
import { OverviewData } from '../../services/api';

interface OverviewPageProps {
  data: OverviewData;
  onNavigate: (view: string) => void;
}

const STATE_COLORS = ['#22D3EE', '#8B5CF6', '#34D399', '#F59E0B', '#F43F5E'];

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

  return (
    <div className="space-y-6">
      {/* Top Banner / Disclaimer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-trio-card/80 border border-trio-border gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-trio-cyan/30 text-trio-cyan">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Operational Sensor Health &amp; Discovery Stream</span>
              {is_simulated ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-trio-amber border border-trio-amber/30 uppercase tracking-wider">
                  Simulated Demo Data &bull; Not Real Factory Data
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-trio-green border border-trio-green/30 uppercase tracking-wider">
                  Live Custom Data
                </span>
              )}
            </h2>
            <p className="text-xs text-trio-muted mt-0.5">
              Current Dataset: <strong className="text-slate-300">{dataset_name}</strong> &bull; Zero temporal data leakage enforced
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('discoveries')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-trio-cyan/10 hover:bg-trio-cyan/20 text-trio-cyan text-xs font-semibold border border-trio-cyan/30 transition-all shrink-0"
        >
          <span>View All Discoveries</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-trio-card/90 border border-trio-border hover:border-trio-cyan/40 transition-all">
          <div className="flex items-center justify-between text-xs text-trio-muted mb-2">
            <span>Observations Processed</span>
            <Activity className="w-4 h-4 text-trio-cyan" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis.observations_processed.toLocaleString()}
          </div>
          <div className="text-[11px] text-trio-muted mt-1.5 flex items-center gap-1">
            <span className="text-trio-green font-medium">&bull; 100% streamed</span>
            <span>through STM sliding buffer</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-trio-card/90 border border-trio-border hover:border-trio-purple/40 transition-all">
          <div className="flex items-center justify-between text-xs text-trio-muted mb-2">
            <span>Known Operational States</span>
            <Layers className="w-4 h-4 text-trio-purple" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis.known_operational_states}
          </div>
          <div className="text-[11px] text-trio-muted mt-1.5 flex items-center gap-1">
            <span className="text-purple-300 font-medium">LTM Prototypes</span>
            <span>learned from baseline</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-trio-card/90 border border-trio-border hover:border-trio-amber/40 transition-all">
          <div className="flex items-center justify-between text-xs text-trio-muted mb-2">
            <span>Unknown Candidates</span>
            <Compass className="w-4 h-4 text-trio-amber" />
          </div>
          <div className="text-2xl font-extrabold text-trio-amber font-mono">
            {kpis.unknown_candidates}
          </div>
          <div className="text-[11px] text-trio-muted mt-1.5 flex items-center gap-1">
            <span className="text-amber-400 font-medium">CM Clustered</span>
            <span>via DBSCAN density</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-trio-card/90 border border-trio-border hover:border-trio-green/40 transition-all">
          <div className="flex items-center justify-between text-xs text-trio-muted mb-2">
            <span>Confirmed Discoveries</span>
            <CheckCircle2 className="w-4 h-4 text-trio-green" />
          </div>
          <div className="text-2xl font-extrabold text-trio-green font-mono">
            {kpis.confirmed_discoveries}
          </div>
          <div className="text-[11px] text-trio-muted mt-1.5 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Statistically verified</span>
            <span>novel operational regime</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Multi-Sensor Activity Timeline + State Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Sensor Activity Timeline (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-trio-card/90 border border-trio-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Multi-Sensor Physical Dynamics Timeline
              </h3>
              <p className="text-[11px] text-trio-muted">
                Inflow (FIT101), Differential Pressure (DPIT301), and Dosing (FIT201)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-trio-cyan">
                <span className="w-2 h-2 rounded-full bg-trio-cyan inline-block" />
                FIT101
              </span>
              <span className="flex items-center gap-1 text-trio-amber">
                <span className="w-2 h-2 rounded-full bg-trio-amber inline-block" />
                DPIT301
              </span>
              <span className="flex items-center gap-1 text-trio-purple">
                <span className="w-2 h-2 rounded-full bg-trio-purple inline-block" />
                FIT201
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensor_trends}>
                <defs>
                  <linearGradient id="colorFit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDpit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C30', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="FIT101" stroke="#22D3EE" strokeWidth={2} fillOpacity={1} fill="url(#colorFit)" name="FIT101 (Inflow m3/h)" />
                <Area type="monotone" dataKey="DPIT301" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorDpit)" name="DPIT301 (Pressure bar)" />
                <Line type="monotone" dataKey="FIT201" stroke="#8B5CF6" strokeWidth={1.5} dot={false} name="FIT201 (Dosing L/min)" />
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
                  {state_distribution.map((entry, index) => (
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
              Tri-Memory Throughput
            </h3>
            <p className="text-[11px] text-trio-muted mb-4">
              Real-time buffer capacity and accumulated evidence.
            </p>

            <div className="space-y-4">
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

