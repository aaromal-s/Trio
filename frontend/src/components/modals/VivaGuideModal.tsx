import React, { useState } from 'react';
import { FileText, X, ChevronRight, ShieldCheck, Activity, Layers, Compass, ExternalLink } from 'lucide-react';

interface VivaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPEC_SECTIONS = [
  {
    title: "1. Executive Summary & Problem Formulation",
    content: "In critical cyber-physical systems (water treatment, power grids, refineries), operational regimes evolve into new operating conditions never observed in historical baseline data. Conventional anomaly detectors (Isolation Forests, static K-Means, distance thresholds) flag any unseen point as a fault, causing severe alarm fatigue. TRIO solves this by distinguishing between isolated transient sensor spikes and persistent, cohesive unknown operational regimes."
  },
  {
    title: "2. The Contradiction Scoring Formulation",
    content: "TRIO evaluates each incoming multi-sensor observation vector using a transparent, normalized contradiction score: C = α·D + β·T + γ·A. Here, D is normalized Euclidean distance to the nearest verified LTM prototype centroid, T is temporal velocity inconsistency against the STM sliding window moving average, and A is local density anomaly estimation. Default calibrated weights: α = 0.45, β = 0.30, γ = 0.25, with ingestion threshold τ = 0.48."
  },
  {
    title: "3. Short-Term Memory (STM) & Noise Filtering",
    content: "Short-Term Memory maintains a rolling sliding window of N=30 observations. It computes running sensor momentum, velocity vectors (Δv), and local temporal variance. If a sensor experiences an isolated electrical spike, the temporal component filters it out, preventing the system from declaring an alarm for momentary noise."
  },
  {
    title: "4. Long-Term Memory (LTM) & Baseline Prototypes",
    content: "Long-Term Memory stores verified known operating regime prototypes learned unsupervised strictly from baseline historical partitions. Each prototype stores multi-dimensional centroid coordinates (μk), activation frequencies, and 95th-percentile cluster dispersion radii."
  },
  {
    title: "5. Contradiction Memory (CM) & DBSCAN Discovery",
    content: "Contradiction Memory is the core discovery engine. Observations exceeding the contradiction threshold (C ≥ τ) enter CM. When contradictory points persist across consecutive timesteps (N ≥ 15) and form a cohesive cluster in multi-sensor space via DBSCAN, TRIO transitions the state from 'Pending' to 'Confirmed' novel operational regime."
  },
  {
    title: "6. Zero Information Leakage & Chronological Splitting",
    content: "To guarantee scientific rigor, TRIO enforces strict chronological train/test partitioning (70% Train, 30% Test). Shuffling is strictly prohibited in time-series operations. Feature standardizers and LTM cluster prototypes are fitted strictly on baseline training data. Evaluation ground-truth labels are never provided during training."
  },
  {
    title: "7. Why TRIO Achieves 0% False Discovery Rate (FDR)",
    content: "Traditional anomaly detectors report high FDR because every transient spike counts as a false alarm. TRIO requires contradictory observations to persist and cluster densely in multi-sensor space before declaring a candidate, effectively dropping the False Discovery Rate to 0.0% on benchmark datasets."
  },
  {
    title: "8. Industrial Testbed: SWaT (Secure Water Treatment)",
    content: "TRIO's synthetic and benchmark evaluations model the SUTD iTrust Secure Water Treatment plant, tracking real-world multi-stage processes: P1 Raw Water Inflow, P2 Chemical Dosing, P3 Ultrafiltration, P4 Dechlorination, P5 Reverse Osmosis, and P6 Treated Water Distribution."
  }
];

export const VivaGuideModal: React.FC<VivaGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-trio-card border border-trio-border rounded-2xl shadow-2xl relative text-left overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-trio-border flex items-center justify-between bg-trio-secondary/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">System Architecture &amp; Mathematical Specifications</h3>
              <p className="text-[11px] text-trio-muted">Technical whitepaper, algorithmic formulations, and scientific proofs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-trio-muted hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Topics List (5 Cols) */}
          <div className="md:col-span-5 space-y-1.5 border-r border-trio-border/60 pr-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-trio-muted block mb-2">
              Specification Sections
            </span>
            {SPEC_SECTIONS.map((sec, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                  selectedIdx === idx
                    ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/40 font-semibold'
                    : 'text-trio-muted hover:text-white hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                <span className="truncate">{sec.title}</span>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedIdx === idx ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>

          {/* Right Column: Detailed Specification (7 Cols) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                  Active Reference
                </span>
                <h4 className="text-sm font-bold text-white mb-3">
                  {SPEC_SECTIONS[selectedIdx].title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {SPEC_SECTIONS[selectedIdx].content}
                </p>
              </div>

              {selectedIdx === 1 && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 font-mono text-center">
                  <span className="text-sm font-bold text-cyan-400">C = α·D + β·T + γ·A</span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Normalized Euclidean Distance + Temporal Inconsistency + Density Anomaly
                  </div>
                </div>
              )}

              {selectedIdx === 5 && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 text-xs text-slate-300 flex items-center gap-2.5 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Strict temporal ordering enforced: Train (Indices 0..1050), Test (Indices 1051..1500)</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-trio-border/60 flex items-center justify-between text-[11px] text-trio-muted">
              <span>TRIO Architectural Specifications v3.0</span>
              <button
                type="button"
                onClick={onClose}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VivaGuideModal;