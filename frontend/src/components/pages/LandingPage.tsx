import React from 'react';
import { motion } from 'framer-motion';
import { TrioLogo } from '../brand/TrioLogo';
import { 
  ArrowRight, 
  Brain, 
  Compass, 
  Database, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Zap, 
  CheckCircle, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  BarChart2
} from 'lucide-react';

interface LandingPageProps {
  onEnterDemo: () => void;
  onOpenLogin: () => void;
  onOpenViva: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDemo,
  onOpenLogin,
  onOpenViva
}) => {
  return (
    <div className="min-h-screen bg-trio-bg text-trio-text flex flex-col selection:bg-trio-cyan selection:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full h-20 bg-trio-bg/80 backdrop-blur-xl border-b border-trio-border/60 px-6 sm:px-12 flex items-center justify-between">
        <TrioLogo size="md" subtitle="Learn. Remember. Discover." />
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-trio-muted">
          <a href="#how-it-works" className="hover:text-trio-cyan transition-colors">How It Works</a>
          <a href="#three-memories" className="hover:text-trio-cyan transition-colors">Tri-Memory</a>
          <a href="#research" className="hover:text-trio-cyan transition-colors">Research Formulation</a>
          <a href="#applications" className="hover:text-trio-cyan transition-colors">Industrial Scope</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenViva}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 rounded-lg transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Viva Defense Guide</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="px-4 py-2 text-xs font-medium text-trio-muted hover:text-white transition-colors"
          >
            Sign In
          </button>

          <button
            onClick={onEnterDemo}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-trio-cyan hover:bg-cyan-300 rounded-lg shadow-glow-cyan transition-all"
          >
            <span>Live Platform Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Ambient background glowing orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-trio-cyan/15 via-trio-purple/10 to-transparent blur-[120px] pointer-events-none" />

        {/* Research Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-trio-cyan/30 text-trio-cyan text-xs font-medium mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-trio-cyan animate-pulse" />
          <span>University Research Project &bull; Unsupervised Industrial Intelligence</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight mb-6"
        >
          Discover What Your Data <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-trio-cyan via-purple-300 to-trio-purple bg-clip-text text-transparent">
            Has Never Seen Before.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-trio-muted max-w-3xl leading-relaxed mb-10 font-normal"
        >
          An intelligent tri-memory learning platform that identifies familiar patterns, 
          detects multi-sensor contradictions, and helps uncover unknown operational states 
          before costly industrial downtime.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={onEnterDemo}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-trio-cyan text-black font-semibold text-sm hover:bg-cyan-300 shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
          >
            <span>Explore Live Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#three-memories"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-trio-card/80 text-white font-medium text-sm border border-trio-border hover:border-trio-cyan/40 hover:bg-trio-card transition-all"
          >
            <span>Discover How It Works</span>
            <ChevronRight className="w-4 h-4 text-trio-muted" />
          </a>
        </motion.div>

        {/* Interactive Animated Tri-Memory Flow Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl rounded-2xl p-6 sm:p-8 bg-trio-secondary/70 border border-trio-border shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-trio-border/60 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs text-trio-muted font-mono ml-2">TRIO Dynamic Memory Engine Simulation</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-trio-cyan bg-cyan-950/40 px-2.5 py-1 rounded border border-trio-cyan/30">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>C = &alpha;&bull;D + &beta;&bull;T + &gamma;&bull;A</span>
            </div>
          </div>

          {/* Three Connected Memory Visual Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* STM Node */}
            <div className="p-5 rounded-xl bg-trio-card/90 border border-trio-cyan/30 relative">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-trio-cyan mb-3 border border-trio-cyan/40">
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-trio-cyan mb-1">
                Short-Term Memory (STM)
              </div>
              <p className="text-xs text-trio-muted leading-relaxed mb-3">
                Sliding buffer tracking local momentum and transient sensor gradients.
              </p>
              <div className="space-y-1.5 font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Sliding Window:</span>
                  <span className="text-white">30 observations</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Temporal Factor T:</span>
                  <span className="text-trio-cyan">0.24 (Consistent)</span>
                </div>
              </div>
            </div>

            {/* LTM Node */}
            <div className="p-5 rounded-xl bg-trio-card/90 border border-trio-purple/30 relative">
              <div className="w-8 h-8 rounded-lg bg-purple-950 flex items-center justify-center text-trio-purple mb-3 border border-trio-purple/40">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-trio-purple mb-1">
                Long-Term Memory (LTM)
              </div>
              <p className="text-xs text-trio-muted leading-relaxed mb-3">
                Learned cluster centroids representing normal baseline operating regimes.
              </p>
              <div className="space-y-1.5 font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Known Prototypes:</span>
                  <span className="text-white">3 Regimes</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Distance Factor D:</span>
                  <span className="text-trio-purple">0.86 (Novel Regime)</span>
                </div>
              </div>
            </div>

            {/* CM Node */}
            <div className="p-5 rounded-xl bg-trio-card/90 border border-trio-amber/30 relative">
              <div className="w-8 h-8 rounded-lg bg-amber-950 flex items-center justify-center text-trio-amber mb-3 border border-trio-amber/40">
                <Compass className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-trio-amber mb-1">
                Contradiction Memory (CM)
              </div>
              <p className="text-xs text-trio-muted leading-relaxed mb-3">
                Accumulates contradictory observations and clusters persistent novel states.
              </p>
              <div className="space-y-1.5 font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>DBSCAN Discovery:</span>
                  <span className="text-trio-amber">Novel Cluster #1</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Candidate Status:</span>
                  <span className="text-emerald-400 font-bold">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Three Memories Section */}
      <section id="three-memories" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-trio-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-trio-cyan mb-2 block">
            Core Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            The Tri-Memory Architecture
          </h2>
          <p className="text-trio-muted text-sm sm:text-base leading-relaxed">
            Standard anomaly detectors fail when an industrial process shifts into a valid but previously unseen state.
            TRIO separates immediate dynamics, historical prototypes, and contradictory evidence into three complementary memories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-trio-card/60 border border-trio-border hover:border-trio-cyan/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/60 text-trio-cyan flex items-center justify-center mb-5 border border-trio-cyan/30">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Short-Term Memory (STM)</h3>
              <p className="text-xs text-trio-muted leading-relaxed mb-4">
                Maintains a rolling sliding window of the most recent physical observations. It computes running sensor momentum, velocity vectors, and prevents single-point transient spikes from corrupting state assessments.
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-cyan" />
                <span>Sliding observation buffer (N=30)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-cyan" />
                <span>Calculates Temporal Inconsistency (T)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-cyan" />
                <span>Filters high-frequency electrical noise</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-trio-card/60 border border-trio-border hover:border-trio-purple/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 text-trio-purple flex items-center justify-center mb-5 border border-trio-purple/30">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Long-Term Memory (LTM)</h3>
              <p className="text-xs text-trio-muted leading-relaxed mb-4">
                Encapsulates verified normal operational regimes discovered unsupervised during baseline training. Each prototype stores multivariate centroid coordinates, covariance dispersion, and historical activation frequency.
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-purple" />
                <span>Learned known-state prototype centroids</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-purple" />
                <span>Calculates Prototype Distance (D)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-purple" />
                <span>Zero leakage via chronological training</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-trio-card/60 border border-trio-border hover:border-trio-amber/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 text-trio-amber flex items-center justify-center mb-5 border border-trio-amber/30">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Contradiction Memory (CM)</h3>
              <p className="text-xs text-trio-muted leading-relaxed mb-4">
                The core innovation of TRIO. It collects observations that contradict learned LTM prototypes or STM temporal continuity. Using DBSCAN density grouping, it converts isolated alarms into confirmed unknown states.
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-amber" />
                <span>Stores multivariate contradiction evidence</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-amber" />
                <span>DBSCAN clustering of novel regimes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-trio-amber" />
                <span>Candidate progression: Pending &rarr; Confirmed</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How TRIO Works Pipeline */}
      <section id="how-it-works" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-trio-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-trio-purple mb-2 block">
            End-To-End Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            How TRIO Operates
          </h2>
          <p className="text-trio-muted text-sm sm:text-base leading-relaxed">
            From raw multi-sensor streaming to explainable operational discoveries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-trio-secondary/60 border border-trio-border">
            <span className="text-2xl font-black text-trio-cyan font-mono block mb-2">01</span>
            <h4 className="text-sm font-bold text-white mb-2">Streaming Ingestion</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Industrial sensors (flow rates, pressures, tank levels, chemical pH) enter the STM sliding window with chronological scaling.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-secondary/60 border border-trio-border">
            <span className="text-2xl font-black text-purple-400 font-mono block mb-2">02</span>
            <h4 className="text-sm font-bold text-white mb-2">Contradiction Scoring</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Each point is scored via $C = \alpha D + \beta T + \gamma A$. Points exceeding $\tau$ enter Contradiction Memory.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-secondary/60 border border-trio-border">
            <span className="text-2xl font-black text-trio-amber font-mono block mb-2">03</span>
            <h4 className="text-sm font-bold text-white mb-2">DBSCAN Grouping</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Instead of flagging momentary spikes, CM clusters sustained anomalous points in feature space to identify dense novel operating regimes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-secondary/60 border border-trio-border">
            <span className="text-2xl font-black text-trio-green font-mono block mb-2">04</span>
            <h4 className="text-sm font-bold text-white mb-2">Explainable Discovery</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Generates an unknown candidate showing exact sensor deviation deltas (+88% DPIT301 surge, -42% FIT101 drop) and plain-English diagnosis.
            </p>
          </div>
        </div>
      </section>

      {/* Research Formulation */}
      <section id="research" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-trio-border/40">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-trio-secondary via-trio-card to-trio-secondary border border-trio-border flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-1/2">
            <span className="text-xs uppercase font-bold tracking-widest text-trio-cyan mb-2 block">
              Mathematical Foundation
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Contradiction Scoring Formula
            </h3>
            <p className="text-sm text-trio-muted leading-relaxed mb-6">
              TRIO balances prototype divergence, temporal continuity, and local density into a transparent, normalized formula:
            </p>

            <div className="p-4 rounded-xl bg-trio-bg/80 border border-trio-cyan/30 font-mono text-center mb-6">
              <span className="text-lg sm:text-xl font-bold text-trio-cyan">
                C = &alpha;&bull;D + &beta;&bull;T + &gamma;&bull;A
              </span>
              <div className="text-[11px] text-trio-muted mt-2">
                Default baseline weights: &alpha; = 0.45, &beta; = 0.30, &gamma; = 0.25
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p><strong className="text-trio-purple">D (Prototype Distance):</strong> Normalized Euclidean distance to the nearest known LTM prototype centroid.</p>
              <p><strong className="text-trio-cyan">T (Temporal Inconsistency):</strong> Instantaneous deviation from STM sliding window moving average and velocity.</p>
              <p><strong className="text-trio-amber">A (Anomaly Score):</strong> Normalized density score from unsupervised baseline estimator.</p>
            </div>
          </div>

          <div className="lg:w-1/2 w-full p-6 rounded-xl bg-trio-bg/90 border border-trio-border font-mono text-xs text-slate-400 space-y-3">
            <div className="text-trio-cyan font-bold pb-2 border-b border-slate-800">
              // Mathematical Proof of No Data Leakage
            </div>
            <div><span className="text-purple-400">dataset</span> = chronological_split(T_train, T_test)</div>
            <div><span className="text-purple-400">scaler</span> = fit(T_train); X_test = scaler.transform(T_test)</div>
            <div><span className="text-purple-400">LTM_prototypes</span> = fit_unsupervised(X_train, k=3)</div>
            <div className="text-emerald-400">// Ground truth evaluation labels NEVER used in training</div>
            <div><span className="text-purple-400">candidates</span> = DBSCAN(CM_points).filter(len &gt;= 15)</div>
            <div className="pt-2 text-[11px] text-slate-500">Strict temporal split guarantees zero future information leakage.</div>
          </div>
        </div>
      </section>

      {/* Industrial Applications */}
      <section id="applications" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-trio-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-trio-green mb-2 block">
            Real-World Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Industrial Cyber-Physical Systems
          </h2>
          <p className="text-trio-muted text-sm sm:text-base leading-relaxed">
            Tested on SWaT (Secure Water Treatment) architecture and applicable to safety-critical infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-trio-card/60 border border-trio-border">
            <div className="text-trio-cyan mb-3"><Database className="w-6 h-6" /></div>
            <h4 className="text-sm font-bold text-white mb-2">Water Treatment (SWaT)</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Detects filtration membrane biofouling, pump cavitation, and multi-stage cyber-physical manipulation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-card/60 border border-trio-border">
            <div className="text-trio-purple mb-3"><Zap className="w-6 h-6" /></div>
            <h4 className="text-sm font-bold text-white mb-2">Smart Power Grids</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Uncovers renewable microgrid synchronization drift, transformer overheating, and harmonic distortion regimes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-card/60 border border-trio-border">
            <div className="text-trio-amber mb-3"><Cpu className="w-6 h-6" /></div>
            <h4 className="text-sm font-bold text-white mb-2">Chemical Distillation</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Identifies unexpected catalyst degradation and multi-column thermal reflux anomalies before safety shutdowns.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-card/60 border border-trio-border">
            <div className="text-trio-green mb-3"><Activity className="w-6 h-6" /></div>
            <h4 className="text-sm font-bold text-white mb-2">Automated Manufacturing</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Discovers novel robotic actuator friction states and assembly line tolerances under thermal expansion.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Footer Bar */}
      <div className="py-12 bg-trio-secondary/40 border-t border-trio-border/60 px-6 sm:px-12 text-center">
        <p className="text-xs text-trio-muted uppercase tracking-widest font-semibold mb-6">
          Built With World-Class Open Technologies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-trio-card border border-trio-border">React 19 + TypeScript</span>
          <span className="px-3 py-1.5 rounded-lg bg-trio-card border border-trio-border">Tailwind CSS + Framer Motion</span>
          <span className="px-3 py-1.5 rounded-lg bg-trio-card border border-trio-border">FastAPI + Python 3.13</span>
          <span className="px-3 py-1.5 rounded-lg bg-trio-card border border-trio-border">Scikit-Learn + NumPy</span>
          <span className="px-3 py-1.5 rounded-lg bg-trio-card border border-trio-border">Recharts Analytical Engine</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 sm:px-12 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-trio-muted border-t border-trio-border/40 gap-4">
        <div className="flex items-center gap-2">
          <TrioLogo size="xs" showText={false} />
          <span>TRIO AI &bull; Contradiction-Guided Tri-Memory Unsupervised Learning</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onOpenViva} className="hover:text-trio-cyan transition-colors">
            Viva Defense Q&A
          </button>
          <button onClick={onEnterDemo} className="hover:text-trio-cyan transition-colors">
            Interactive Demo
          </button>
          <a 
            href="https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/#swat" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-trio-cyan transition-colors flex items-center gap-1"
          >
            <span>iTrust SWaT Info</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
};

