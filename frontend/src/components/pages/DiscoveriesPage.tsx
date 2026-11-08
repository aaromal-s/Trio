import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  ShieldCheck,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { api, DiscoveryCandidateItem } from '../../services/api';

interface DiscoveriesPageProps {
  candidates: DiscoveryCandidateItem[];
  onRefresh: () => void;
}

export const DiscoveriesPage: React.FC<DiscoveriesPageProps> = ({
  candidates,
  onRefresh
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<DiscoveryCandidateItem | null>(
    candidates[0] || null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (candidates.length > 0 && (!selectedCandidate || !candidates.find(c => c.candidate_id === selectedCandidate.candidate_id))) {
      setSelectedCandidate(candidates[0]);
    }
  }, [candidates]);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    setUpdatingId(candidateId);
    try {
      await api.updateCandidateStatus(candidateId, newStatus);
      onRefresh();
      if (selectedCandidate && selectedCandidate.candidate_id === candidateId) {
        setSelectedCandidate({ ...selectedCandidate, status: newStatus as any });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-trio-green border border-trio-green/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed State</span>
          </span>
        );
      case 'Under Validation':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-trio-amber border border-trio-amber/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Under Validation</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-cyan-500/10 text-trio-cyan border border-trio-cyan/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Pending Evidence</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Transient / Noise</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-trio-border gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-trio-cyan" />
            <span>Unknown Operational-State Discoveries</span>
          </h2>
          <p className="text-xs text-trio-muted mt-1">
            DBSCAN density clustering converts isolated contradictory alarms into validated novel operational regimes.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-trio-muted bg-trio-card px-3 py-1.5 rounded-xl border border-trio-border">
          <span>Total Discovered:</span>
          <span className="text-white font-bold">{candidates.length}</span>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="p-12 text-center bg-trio-card/60 rounded-2xl border border-trio-border">
          <Compass className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Unknown Operational States Found Yet</h3>
          <p className="text-xs text-trio-muted mt-1 max-w-md mx-auto">
            The current operating data matches learned known LTM prototypes. Run the synthetic generator in Datasets or adjust threshold &tau; in Model Lab to inspect novel states.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Candidate List Cards (1 Col) */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-trio-muted block mb-2">
              Discovered Candidates
            </span>
            {candidates.map((cand) => {
              const isSelected = selectedCandidate?.candidate_id === cand.candidate_id;
              return (
                <div
                  key={cand.candidate_id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'bg-trio-card border-trio-cyan shadow-glow-cyan/25'
                      : 'bg-trio-secondary/60 border-trio-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-white">
                      {cand.candidate_id}
                    </span>
                    {getStatusBadge(cand.status)}
                  </div>

                  <p className="text-xs text-trio-muted line-clamp-2 mb-3">
                    {cand.explanation}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-trio-border/60 pt-2">
                    <span>{cand.observation_count} points</span>
                    <span className="text-trio-cyan">Score: {cand.mean_contradiction_score}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep-Dive Candidate Inspector (2 Cols) */}
          {selectedCandidate && (
            <div className="lg:col-span-2 p-6 rounded-2xl bg-trio-card/80 border border-trio-border space-y-6">
              {/* Candidate Inspector Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-trio-border/80 gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold font-mono text-white">
                      {selectedCandidate.candidate_id}
                    </h3>
                    {getStatusBadge(selectedCandidate.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-trio-muted mt-1 font-mono">
                    <span>First: {selectedCandidate.first_detected.slice(-8)}</span>
                    <span>&bull;</span>
                    <span>Last: {selectedCandidate.last_detected.slice(-8)}</span>
                    <span>&bull;</span>
                    <span>Evidence: {selectedCandidate.observation_count} observations</span>
                  </div>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedCandidate.candidate_id, 'Confirmed')}
                    disabled={updatingId === selectedCandidate.candidate_id || selectedCandidate.status === 'Confirmed'}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-trio-green border border-trio-green/30 text-xs font-semibold transition-all disabled:opacity-40"
                  >
                    Confirm State
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCandidate.candidate_id, 'Under Validation')}
                    disabled={updatingId === selectedCandidate.candidate_id || selectedCandidate.status === 'Under Validation'}
                    className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-trio-amber border border-trio-amber/30 text-xs font-semibold transition-all disabled:opacity-40"
                  >
                    Hold Validation
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCandidate.candidate_id, 'Rejected')}
                    disabled={updatingId === selectedCandidate.candidate_id || selectedCandidate.status === 'Rejected'}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Crucial University Prompt Section: "Why did TRIO identify this pattern?" */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-trio-secondary to-slate-900 border border-trio-cyan/30">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-trio-cyan mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Why Did TRIO Identify This Pattern?</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed mb-3">
                  {selectedCandidate.explanation}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-3 border-t border-slate-800">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Cluster Density:</span>
                    <span className="text-trio-green font-bold">{selectedCandidate.cluster_density} (High cohesion)</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Mean Contradiction (C):</span>
                    <span className="text-trio-amber font-bold">{selectedCandidate.mean_contradiction_score}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Duration / Persistence:</span>
                    <span className="text-purple-300 font-bold">{selectedCandidate.observation_count} Timesteps</span>
                  </div>
                </div>
              </div>

              {/* Sensor Deviation Deltas vs Known LTM Baseline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-trio-purple" />
                  <span>Multivariate Sensor Shift Relative to Nearest Known State (&Delta; Standard Deviations)</span>
                </h4>

                <div className="space-y-3">
                  {Object.entries(selectedCandidate.feature_deltas || {}).map(([sensor, delta]) => {
                    const absVal = Math.min(3.0, Math.abs(delta));
                    const isPositive = delta >= 0;
                    const pct = (absVal / 3.0) * 100;

                    return (
                      <div key={sensor} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300 font-semibold">{sensor}</span>
                          <span className={isPositive ? "text-trio-amber font-bold" : "text-trio-cyan font-bold"}>
                            {isPositive ? `+${delta.toFixed(2)} σ` : `${delta.toFixed(2)} σ`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                          <div 
                            className={`h-full rounded-full ${isPositive ? 'bg-trio-amber' : 'bg-trio-cyan'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Candidate Centroid Prototype Vector Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                  Candidate Centroid Coordinates (Feature Space Prototype)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  {Object.entries(selectedCandidate.prototype_vector || {}).map(([feat, val]) => (
                    <div key={feat} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                      <span className="text-slate-500">{feat}:</span>
                      <span className="text-white font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

