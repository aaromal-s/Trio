import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap, 
  HelpCircle,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { api, BenchmarkMetric } from '../../services/api';

interface EvaluationPageProps {
  datasetName: string;
  isSimulated: boolean;
}

export const EvaluationPage: React.FC<EvaluationPageProps> = ({
  datasetName,
  isSimulated
}) => {
  const [metrics, setMetrics] = useState<BenchmarkMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadBenchmark();
  }, [datasetName]);

  const loadBenchmark = async () => {
    setLoading(true);
    try {
      const res = await api.getEvaluationBenchmark();
      setMetrics(res.metrics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open(api.getExportCsvUrl(), '_blank');
  };

  // Prepare chart data for comparative visualization
  const chartData = metrics.map(m => ({
    name: m.model_name,
    F1_Score: Math.round(m.f1_score * 100),
    Precision: Math.round(m.precision * 100),
    Recall: Math.round(m.recall * 100),
    False_Discovery_Rate: Math.round(m.false_discovery_rate * 100),
    Delay_Timesteps: m.detection_delay_timesteps,
    Runtime_ms: m.runtime_ms
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-trio-border gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-trio-cyan" />
            <span>Benchmark Evaluation &amp; Model Comparison</span>
          </h2>
          <p className="text-xs text-trio-muted mt-1">
            Comparing TRIO against K-Means, DBSCAN, and Isolation Forest on ground-truth industrial test partitions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-trio-card hover:bg-slate-800 text-white border border-trio-border hover:border-trio-cyan/40 text-xs font-semibold transition-all shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-trio-cyan" />
          <span>Export Benchmark CSV</span>
        </button>
      </div>

      {/* Anomaly Detection vs Unknown-State Discovery Explanation Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-trio-secondary to-trio-card border border-trio-border">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Fundamental Research Distinction: Anomaly Detection vs. Unknown-State Discovery
            </h3>
            <p className="text-xs text-trio-muted leading-relaxed mb-3">
              Traditional anomaly detectors (e.g., Isolation Forest, standard distance thresholds) treat <em>any</em> unusual sensor reading as an isolated fault or alarm. In complex continuous processes, this generates massive alarm fatigue and fails to recognize when the plant has entered a <strong>new, cohesive, sustainable operational regime</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-rose-300 block mb-1">Conventional Anomaly Detection:</span>
                <span className="text-slate-400 text-[11px]">
                  Point-wise outlier classification. Flags temporary electrical spikes and persistent cavitation identically as single errors. High False Discovery Rate (FDR).
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-trio-cyan block mb-1">TRIO Unknown-State Discovery:</span>
                <span className="text-slate-400 text-[11px]">
                  Tri-Memory density arbitration. Filters isolated transient spikes via STM momentum, accumulates evidence in CM, and discovers clustered unknown operating states with verified persistence.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Evaluation Table */}
      <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-trio-cyan" />
            <h3 className="text-sm font-bold text-white">Comparative Algorithmic Performance Table</h3>
          </div>
          <span className="text-xs font-mono text-trio-muted">
            Evaluation on Test Partition ({isSimulated ? 'Simulated SWaT' : 'Uploaded Testbed'})
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-trio-border">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-trio-muted border-b border-trio-border">
              <tr>
                <th className="py-3 px-3.5">Algorithm</th>
                <th className="py-3 px-3">F1-Score</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall</th>
                <th className="py-3 px-3">ARI</th>
                <th className="py-3 px-3">NMI</th>
                <th className="py-3 px-3">FDR (%)</th>
                <th className="py-3 px-3">Delay (steps)</th>
                <th className="py-3 px-3">Runtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-trio-secondary/40">
              {metrics.map((row, idx) => {
                const isTrio = row.model_name.includes('TRIO');
                return (
                  <tr 
                    key={idx} 
                    className={`transition-colors ${
                      isTrio ? 'bg-cyan-950/20 font-semibold text-white' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3.5 flex items-center gap-2">
                      {isTrio && <span className="w-2 h-2 rounded-full bg-trio-cyan animate-pulse" />}
                      <span className={isTrio ? 'text-trio-cyan font-bold' : 'text-white'}>
                        {row.model_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-trio-green">
                      {(row.f1_score * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3">{(row.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3">{(row.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-purple-300">{row.ari.toFixed(3)}</td>
                    <td className="py-3 px-3 text-purple-300">{row.nmi.toFixed(3)}</td>
                    <td className="py-3 px-3 text-rose-300 font-bold">
                      {(row.false_discovery_rate * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-trio-amber">
                      {row.detection_delay_timesteps} steps
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {row.runtime_ms} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 flex flex-wrap gap-4">
          <span><strong>ARI:</strong> Adjusted Rand Index (-1 to 1)</span>
          <span><strong>NMI:</strong> Normalized Mutual Information (0 to 1)</span>
          <span><strong>FDR:</strong> False Discovery Rate [FP / (FP + TP)]</span>
          <span><strong>Delay:</strong> Timesteps from true state onset to discovery</span>
        </div>
      </div>

      {/* Visual Benchmark Charts: F1-Score vs False Discovery Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* F1-Score & Precision Comparison Bar Chart */}
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Accuracy &amp; F1-Score Benchmark (%)
              </h3>
              <p className="text-[11px] text-trio-muted">
                Higher is better. TRIO combines high precision with complete novel state recall.
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C30', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="F1_Score" fill="#34D399" radius={[4, 4, 0, 0]} name="F1-Score (%)" />
                <Bar dataKey="Precision" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Precision (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* False Discovery Rate (FDR) & Delay Chart */}
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                False Discovery Rate (%) &bull; Alarm Fatigue Suppression
              </h3>
              <p className="text-[11px] text-trio-muted">
                Lower is better. TRIO eliminates the false alarms typical of Isolation Forest and K-Means.
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[0, 50]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C30', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="False_Discovery_Rate" fill="#F43F5E" radius={[4, 4, 0, 0]} name="False Discovery Rate (%)" />
                <Bar dataKey="Delay_Timesteps" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Detection Delay (Timesteps)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

