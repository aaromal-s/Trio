import React, { useState } from 'react';
import {
  ShieldAlert, Activity, Sliders, Cpu, CheckCircle2, AlertTriangle,
  Play, RefreshCw, Sparkles, Layers, Info
} from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { api } from '../../services/api';
import { RiskPrediction } from '../../types';

export const PredictiveRiskTab: React.FC = () => {
  const { predictions } = useLiveData();

  // What-If Simulator inputs
  const [simService, setSimService] = useState<string>('custom-service');
  const [simCpu, setSimCpu] = useState<number>(75);
  const [simMem, setSimMem] = useState<number>(85);
  const [simLat, setSimLat] = useState<number>(450);
  const [simRps, setSimRps] = useState<number>(1200);
  const [simErr, setSimErr] = useState<number>(3.5);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<RiskPrediction | null>(null);

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const res = await api.predictRisk({
        service_name: simService,
        cpu_utilization: simCpu,
        memory_utilization: simMem,
        latency_ms: simLat,
        request_throughput: simRps,
        error_rate: simErr
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Explainer */}
      <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Calibrated Incident Risk Estimation (+30m)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Estimates incident probability 30 minutes before SLA breach using verified Random Forest classifier (rf-v1.4.2).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-midnight-950 px-3 py-1.5 rounded-lg border border-white/5">
          <span>Prediction Horizon:</span>
          <span className="text-cyan-400 font-bold">+30 Minutes</span>
        </div>
      </div>

      {/* Grid: Active Service Predictions & What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Service Risk Predictions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>ACTIVE MONITORED FLEET FORECASTS</span>
            <span>MODEL: RF-v1.4.2</span>
          </div>

          <div className="space-y-3">
            {predictions.map((pred, i) => {
              const isCrit = pred.severity === 'CRITICAL';
              const isHigh = pred.severity === 'HIGH';

              return (
                <GlassCard key={i} glow className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">{pred.service_name}</span>
                        <Badge
                          variant={isCrit ? 'p1' : isHigh ? 'warning' : 'nominal'}
                          pulse={isCrit}
                        >
                          {pred.severity}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Calibrated Probability: <strong className="text-white">{(pred.risk_score * 100).toFixed(1)}%</strong> &bull; Horizon: +{pred.horizon_minutes}m
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-white">
                        {(pred.risk_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Risk Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCrit ? 'bg-rose-500' : isHigh ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.max(5, pred.risk_score * 100)}%` }}
                    />
                  </div>

                  {/* Feature Attribution & Anomaly distinction */}
                  <div className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Top Attributed Drivers</span>
                      {Object.entries(pred.feature_importances || {}).slice(0, 3).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px] text-slate-400">
                          <span className="truncate max-w-[140px]">{k}</span>
                          <span className="text-slate-200">{v}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-lg bg-midnight-950 border border-white/5 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Isolation Forest:</span>
                        <span className={pred.anomaly_detected ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {pred.anomaly_detected ? 'ANOMALY FLAGGED' : 'NOMINAL DISTANCE'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Geometry Score:</span>
                        <span className="text-slate-200">{pred.anomaly_score}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 italic mt-0.5">
                        *Anomaly score reflects statistical outlier distance, distinct from predicted failure probability.
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Interactive What-If Simulator (5 cols) */}
        <div className="lg:col-span-5">
          <GlassCard glow className="space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-blue" />
                <h3 className="text-sm font-bold text-white">What-If Telemetry Stress Tester</h3>
              </div>
              <Badge variant="info">Live Model API</Badge>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust telemetry parameters to test how the trained Random Forest classifier estimates risk under custom operational loads.
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Target Service Name</span>
                </div>
                <input
                  type="text"
                  value={simService}
                  onChange={e => setSimService(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>CPU Utilization: {simCpu}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={simCpu}
                  onChange={e => setSimCpu(Number(e.target.value))}
                  className="w-full accent-brand-blue"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Memory Utilization: {simMem}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={simMem}
                  onChange={e => setSimMem(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Latency P99: {simLat}ms</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="2500"
                  step="25"
                  value={simLat}
                  onChange={e => setSimLat(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Error Rate: {simErr}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={simErr}
                  onChange={e => setSimErr(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Throughput: {simRps} RPS</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="4000"
                  step="50"
                  value={simRps}
                  onChange={e => setSimRps(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <button
                onClick={runSimulation}
                disabled={simLoading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {simLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Evaluate Risk with Backend Model
              </button>
            </div>

            {/* Simulation Result Callout */}
            {simResult && (
              <div className="p-4 rounded-xl bg-midnight-950 border border-brand-blue/30 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Prediction Result</span>
                  <Badge variant={simResult.severity === 'CRITICAL' ? 'p1' : simResult.severity === 'HIGH' ? 'warning' : 'nominal'}>
                    {simResult.severity}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {(simResult.risk_score * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-400">Calibrated Incident Risk</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Confidence: {(simResult.confidence * 100).toFixed(0)}% &bull; Anomaly Detected: {simResult.anomaly_detected ? 'YES' : 'NO'}
                </p>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
