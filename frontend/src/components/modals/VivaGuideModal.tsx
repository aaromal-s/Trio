import React, { useState } from 'react';
import { BookOpen, X, ChevronRight, HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface VivaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VIVA_QUESTIONS = [
  {
    q: "1. What is TRIO?",
    a: "TRIO is an intelligent industrial sensor analytics platform built upon a Contradiction-Guided Tri-Memory unsupervised learning architecture. It continuously learns normal operations, remembers historical prototypes, identifies multi-sensor contradictions, and discovers novel unknown operational states."
  },
  {
    q: "2. What problem does it solve?",
    a: "In real-world cyber-physical systems (like water treatment, refineries, and power grids), processes evolve into new operating conditions that have never been seen in training data. Standard anomaly detectors produce false alarm storms because they cannot differentiate between an isolated transient sensor fault and a coherent new operational state."
  },
  {
    q: "3. Why unsupervised learning?",
    a: "By definition, 'unknown operational states' cannot have training labels before they occur. Supervised learning requires labeled anomalies, which are rare, expensive, or impossible to anticipate. TRIO learns solely from normal baseline operations and discovers novel states autonomously."
  },
  {
    q: "4. What is Short-Term Memory (STM)?",
    a: "STM is a rolling sliding window (e.g. 30 observations) that tracks immediate physical momentum, moving averages, and sensor velocity. It calculates Temporal Inconsistency (T) and prevents single-point high-frequency electrical noise from corrupting diagnosis."
  },
  {
    q: "5. What is Long-Term Memory (LTM)?",
    a: "LTM stores verified known operational-state prototypes learned unsupervised from baseline historical data. Each prototype contains multivariate centroid coordinates and dispersion radii. Incoming observations are compared to calculate Prototype Distance (D)."
  },
  {
    q: "6. What is Contradiction Memory (CM)?",
    a: "CM is TRIO's key innovation. It stores observations that conflict with known LTM prototypes or STM temporal continuity. Instead of raising an immediate alarm, CM accumulates contradictory evidence over time and clusters coherent points into candidate discoveries."
  },
  {
    q: "7. What is Contradiction Scoring?",
    a: "Contradiction score C combines three normalized factors: C = alpha * D + beta * T + gamma * A. D represents distance from known prototypes, T represents temporal inconsistency vs STM momentum, and A represents density-based anomaly likelihood. Default weights are alpha=0.45, beta=0.30, gamma=0.25."
  },
  {
    q: "8. What is an Unknown Operational State?",
    a: "An unknown state is a persistent, statistically cohesive regime in multi-sensor space (such as a novel pump cavitation cycle or biofouling stage) that differs significantly from all baseline prototypes but maintains internal consistency across multiple time steps."
  },
  {
    q: "9. Why use DBSCAN for discovery?",
    a: "DBSCAN is ideal because it does not require specifying the number of clusters (k) in advance, naturally handles arbitrary non-spherical shapes in high-dimensional sensor space, and automatically isolates transient noise points as unclustered outliers."
  },
  {
    q: "10. What is the difference between Anomaly Detection and Unknown-State Discovery?",
    a: "Anomaly detection only asks 'Is this single point abnormal?'. Unknown-state discovery asks 'Has the plant entered a sustainable, coherent operating condition that our models have never seen before, and what are its physical characteristics?'"
  },
  {
    q: "11. Why use the SWaT dataset?",
    a: "The Secure Water Treatment (SWaT) testbed by iTrust SUTD is the global gold standard for cyber-physical industrial control systems research, featuring 51 physical sensors and actuators spanning a realistic 6-stage purification process."
  },
  {
    q: "12. How do you evaluate the model without labels during training?",
    a: "Training enforces strict chronological splitting where the model NEVER sees test data or evaluation labels. Ground truth is used strictly during post-training benchmark evaluation to measure ARI, NMI, Precision, Recall, F1-Score, False Discovery Rate, and Detection Delay."
  },
  {
    q: "13. What is the research contribution?",
    a: "The formal tri-memory separation (STM for momentum, LTM for prototypes, CM for contradictions), the transparent three-factor contradiction scoring formula, zero temporal data leakage, and automated human-readable explanation of discovered regimes."
  },
  {
    q: "14. What are the current limitations?",
    a: "Candidate confirmation requires sufficient observation persistence (e.g. 15+ timesteps). Ultra-rapid catastrophic failures occurring in under 3 timesteps require immediate hardware interlocks rather than unsupervised memory clustering."
  },
  {
    q: "15. What future enhancements are possible?",
    a: "Online adaptive prototype assimilation (promoting Confirmed candidates directly into LTM), federated multi-plant memory sharing, and edge deployment onto industrial PLC microcontrollers."
  }
];

export const VivaGuideModal: React.FC<VivaGuideModalProps> = ({ isOpen, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[85vh] bg-trio-secondary border border-trio-border rounded-2xl p-6 shadow-2xl flex flex-col text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-trio-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>University Viva Defense Guide</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  15 Core Questions &amp; Answers
                </span>
              </h3>
              <p className="text-xs text-trio-muted mt-0.5">
                Comprehensive reference for oral examination and professor Q&amp;A.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-trio-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Layout: Questions list + Answer View */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Question List (1 Col) */}
          <div className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-2">
            {VIVA_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                  selectedIdx === idx
                    ? 'bg-purple-950/80 text-white border border-purple-500/50 shadow-glow-purple/20 font-semibold'
                    : 'text-trio-muted hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span className="truncate pr-2">{item.q}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
              </button>
            ))}
          </div>

          {/* Detailed Answer Card (2 Cols) */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-trio-card/90 border border-trio-border overflow-y-auto max-h-[60vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Question {selectedIdx + 1} of 15</span>
              </div>
              <h4 className="text-base font-bold text-white mb-4">
                {VIVA_QUESTIONS[selectedIdx].q}
              </h4>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans space-y-3">
                <p>{VIVA_QUESTIONS[selectedIdx].a}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-6 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">Academic Defense Reference</span>
              <div className="flex gap-2">
                <button
                  disabled={selectedIdx === 0}
                  onClick={() => setSelectedIdx(selectedIdx - 1)}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={selectedIdx === VIVA_QUESTIONS.length - 1}
                  onClick={() => setSelectedIdx(selectedIdx + 1)}
                  className="px-3 py-1 rounded bg-purple-900 hover:bg-purple-800 text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

