import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  History, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { api, ModelStatus } from '../../services/api';

interface ModelLabPageProps {
  modelStatus: ModelStatus;
  onTrainingComplete: () => void;
  availableFeatures: string[];
}

export const ModelLabPage: React.FC<ModelLabPageProps> = ({
  modelStatus,
  onTrainingComplete,
  availableFeatures
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<'TRIO' | 'K-Means' | 'DBSCAN' | 'Isolation Forest' | 'ALL'>('TRIO');
  const [trainRatio, setTrainRatio] = useState<number>(0.7);
  const [alpha, setAlpha] = useState<number>(modelStatus.weights.alpha || 0.45);
  const [beta, setBeta] = useState<number>(modelStatus.weights.beta || 0.30);
  const [gamma, setGamma] = useState<number>(modelStatus.weights.gamma || 0.25);
  const [threshold, setThreshold] = useState<number>(modelStatus.contradiction_threshold || 0.48);

  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingStage, setTrainingStage] = useState<string>('');
  const [trainingSuccess, setTrainingSuccess] = useState<string>('');
  const [trainingError, setTrainingError] = useState<string>('');
  const [historyList, setHistoryList] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, [modelStatus.model_version]);

  const loadHistory = async () => {
    try {
      const res = await api.getTrainingHistory();
      setHistoryList(res.history);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingSuccess('');
    setTrainingError('');
    setTrainingStage('1. Enforcing chronological train/test partitioning...');

    try {
      // Realistic pipeline step notifications
      setTimeout(() => {
        setTrainingStage('2. Fitting zero-leakage StandardScalers on training data...');
      }, 300);

      setTimeout(() => {
        setTrainingStage('3. Computing LTM known-state prototype centroids & radii...');
      }, 600);

      setTimeout(() => {
        setTrainingStage('4. Streaming test partition through STM & computing C = αD + βT + γA...');
      }, 900);

      const res = await api.trainModel({
        algorithm: selectedAlgo,
        train_ratio: trainRatio,
        alpha: alpha,
        beta: beta,
        gamma: gamma,
        contradiction_threshold: threshold,
        feature_cols: modelStatus.selected_features
      });

      setTrainingStage('5. Clustering Contradiction Memory candidates via DBSCAN...');
      
      setTimeout(() => {
        setIsTraining(false);
        const version = res?.data?.version || res?.version || 'v3.0';
        const count = res?.data?.candidates_count ?? res?.candidates_count ?? 0;
        setTrainingSuccess(`Training complete! Created model ${version}. Discovered ${count} unknown-state candidates.`);
        onTrainingComplete();
        loadHistory();
      }, 1200);

    } catch (err: any) {
      setIsTraining(false);
      setTrainingError(err.message || 'Model training failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-trio-border gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-trio-cyan" />
            <span>Model Lab &bull; Unsupervised Learning Studio</span>
          </h2>
          <p className="text-xs text-trio-muted mt-1">
            Train the proposed TRIO method or benchmark against K-Means, DBSCAN, and Isolation Forest.
          </p>
        </div>

        <button
          onClick={handleTrain}
          disabled={isTraining}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-trio-cyan text-black font-semibold text-xs hover:bg-cyan-300 shadow-glow-cyan transition-all disabled:opacity-50 shrink-0"
        >
          {isTraining ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Training In Progress...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black" />
              <span>Train Model Now</span>
            </>
          )}
        </button>
      </div>

      {/* Progress & Alert Banners */}
      {isTraining && (
        <div className="p-4 rounded-xl bg-cyan-950/60 border border-trio-cyan/40 text-xs text-cyan-200">
          <div className="flex items-center justify-between font-mono mb-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-trio-cyan animate-ping" />
              <span>{trainingStage}</span>
            </span>
            <span className="text-trio-cyan">Active Engine</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-trio-cyan rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {trainingSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-trio-green/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-trio-green shrink-0" />
            <span>{trainingSuccess}</span>
          </div>
          <button onClick={() => setTrainingSuccess('')} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {trainingError && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{trainingError}</span>
          </div>
          <button onClick={() => setTrainingError('')} className="text-rose-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Algorithm Selection Cards */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-trio-muted mb-3">
          Select Target Algorithm Pipeline
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: TRIO */}
          <button
            onClick={() => setSelectedAlgo('TRIO')}
            className={`p-4 rounded-xl text-left border transition-all relative ${
              selectedAlgo === 'TRIO'
                ? 'bg-trio-card border-trio-cyan shadow-glow-cyan/20'
                : 'bg-trio-secondary/60 border-trio-border hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-trio-cyan" />
                <span>TRIO (Proposed)</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-trio-cyan border border-trio-cyan/30">
                Primary
              </span>
            </div>
            <p className="text-[11px] text-trio-muted leading-relaxed">
              Contradiction-guided tri-memory architecture with density clustering for persistent unknown discovery.
            </p>
          </button>

          {/* Card 2: K-Means */}
          <button
            onClick={() => setSelectedAlgo('K-Means')}
            className={`p-4 rounded-xl text-left border transition-all ${
              selectedAlgo === 'K-Means'
                ? 'bg-trio-card border-purple-400 shadow-glow-purple/20'
                : 'bg-trio-secondary/60 border-trio-border hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">K-Means Baseline</span>
              <span className="text-[10px] font-mono text-slate-500">Benchmark</span>
            </div>
            <p className="text-[11px] text-trio-muted leading-relaxed">
              Centroid clustering assigning test observations by distance threshold; vulnerable to non-spherical regimes.
            </p>
          </button>

          {/* Card 3: DBSCAN */}
          <button
            onClick={() => setSelectedAlgo('DBSCAN')}
            className={`p-4 rounded-xl text-left border transition-all ${
              selectedAlgo === 'DBSCAN'
                ? 'bg-trio-card border-trio-amber shadow-glow-amber/20'
                : 'bg-trio-secondary/60 border-trio-border hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">DBSCAN Density</span>
              <span className="text-[10px] font-mono text-slate-500">Benchmark</span>
            </div>
            <p className="text-[11px] text-trio-muted leading-relaxed">
              Density-based clustering tagging sparse points as noise (-1); computationally sensitive to varying density.
            </p>
          </button>

          {/* Card 4: Isolation Forest */}
          <button
            onClick={() => setSelectedAlgo('Isolation Forest')}
            className={`p-4 rounded-xl text-left border transition-all ${
              selectedAlgo === 'Isolation Forest'
                ? 'bg-trio-card border-emerald-400'
                : 'bg-trio-secondary/60 border-trio-border hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Isolation Forest</span>
              <span className="text-[10px] font-mono text-slate-500">Benchmark</span>
            </div>
            <p className="text-[11px] text-trio-muted leading-relaxed">
              Tree-based outlier detection isolating anomalies via random partitioning depth; misses coherent novel states.
            </p>
          </button>
        </div>
      </div>

      {/* Configuration Sliders: Contradiction Weights & Train Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contradiction Weights Config */}
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-trio-cyan" />
                <span>Contradiction Scoring Weight Configuration</span>
              </h3>
              <p className="text-xs text-trio-muted mt-0.5">
                Formula: C = &alpha;&bull;D + &beta;&bull;T + &gamma;&bull;A (Weights auto-normalize to 1.0)
              </p>
            </div>
            <span className="text-[11px] font-mono text-trio-cyan bg-cyan-950/50 px-2 py-0.5 rounded border border-trio-cyan/30">
              Sum: {(alpha + beta + gamma).toFixed(2)}
            </span>
          </div>

          {/* Slider Alpha */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">
                &alpha; — Prototype Distance Weight (D)
              </span>
              <span className="font-mono text-trio-cyan font-bold">{alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full accent-trio-cyan h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Measures normalized deviation from known LTM cluster centroids.
            </p>
          </div>

          {/* Slider Beta */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">
                &beta; — Temporal Inconsistency Weight (T)
              </span>
              <span className="font-mono text-trio-purple font-bold">{beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))}
              className="w-full accent-trio-purple h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Measures velocity jump and momentum deviation vs STM sliding window.
            </p>
          </div>

          {/* Slider Gamma */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">
                &gamma; — Anomaly Score Weight (A)
              </span>
              <span className="font-mono text-trio-amber font-bold">{gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={gamma}
              onChange={(e) => setGamma(parseFloat(e.target.value))}
              className="w-full accent-trio-amber h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Statistical baseline outlier density from unsupervised isolation forest.
            </p>
          </div>

          {/* Threshold Slider */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white font-medium">
                Contradiction Ingestion Threshold (&tau;)
              </span>
              <span className="font-mono text-emerald-400 font-bold">{threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="0.75"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Observations with score C &ge; &tau; are transferred to Contradiction Memory for candidate clustering.
            </p>
          </div>
        </div>

        {/* Partitioning and Model Status Card */}
        <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-trio-green" />
                <span>Temporal Splitting &amp; Active Parameters</span>
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-trio-green border border-trio-green/30">
                Leakage-Free
              </span>
            </div>

            {/* Train / Test Ratio Slider */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">
                  Chronological Split Ratio (Train : Test)
                </span>
                <span className="font-mono text-white font-bold">
                  {Math.round(trainRatio * 100)}% : {Math.round((1 - trainRatio) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.85"
                step="0.05"
                value={trainRatio}
                onChange={(e) => setTrainRatio(parseFloat(e.target.value))}
                className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5 leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-trio-green shrink-0" />
                <span>Strict time-ordered split without random shuffling. Models fit strictly on baseline training period.</span>
              </p>
            </div>

            {/* Active Model Snapshot Details */}
            <div className="space-y-2.5 font-mono text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Model Version:</span>
                <span className="text-trio-cyan font-bold">{modelStatus.model_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Training Status:</span>
                <span className="text-trio-green">{modelStatus.is_trained ? 'Trained & Active' : 'Idle'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Known LTM Clusters:</span>
                <span className="text-white">{modelStatus.ltm_prototypes_count} Prototypes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Discovered Candidates:</span>
                <span className="text-trio-amber font-bold">{modelStatus.candidates_count} Found</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-500">
            Training computation executes live on the Python backend using Scikit-learn and NumPy.
          </div>
        </div>
      </div>

      {/* Model Training History Table */}
      <div className="p-6 rounded-2xl bg-trio-card/80 border border-trio-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-trio-purple" />
            <h3 className="text-sm font-bold text-white">Model Training Run History</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {historyList.length} Iterations Logged
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-trio-border">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-trio-muted border-b border-trio-border">
              <tr>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Trained At</th>
                <th className="py-2.5 px-3">Train Samples</th>
                <th className="py-2.5 px-3">Weights (α, β, γ)</th>
                <th className="py-2.5 px-3">Candidates</th>
                <th className="py-2.5 px-3">F1-Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-trio-secondary/40">
              {historyList.map((run, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-trio-cyan font-bold">{run.model_version}</td>
                  <td className="py-2 px-3 text-slate-400">{run.trained_at}</td>
                  <td className="py-2 px-3 text-slate-300">{run.train_samples}</td>
                  <td className="py-2 px-3 text-slate-400">
                    {run.weights ? `${run.weights.alpha}, ${run.weights.beta}, ${run.weights.gamma}` : 'Default'}
                  </td>
                  <td className="py-2 px-3 text-trio-amber font-bold">{run.candidates_discovered}</td>
                  <td className="py-2 px-3 text-trio-green font-bold">
                    {run.trio_f1 !== undefined ? (run.trio_f1 * 100).toFixed(1) + '%' : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

