import React from 'react';
import { motion } from 'framer-motion';
import { TrioLogo } from '../brand/TrioLogo';
import { IndustrialHeroConsole } from '../common/IndustrialHeroConsole';
import { 
  ArrowRight, 
  Compass, 
  Database, 
  Layers, 
  Activity, 
  Zap, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Cpu,
  ShieldCheck
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
      {/* Top Enterprise Header */}
      <header className="sticky top-0 z-50 w-full h-18 bg-trio-bg/85 backdrop-blur-2xl border-b border-stone-800/80 px-6 sm:px-12 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <TrioLogo size="md" subtitle="Learn. Remember. Discover." />
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-trio-muted">
          <a href="#how-it-works" className="hover:text-orange-400 transition-colors">Methodology</a>
          <a href="#three-memories" className="hover:text-orange-400 transition-colors">Tri-Memory</a>
          <a href="#research" className="hover:text-orange-400 transition-colors">Formulation</a>
          <a href="#applications" className="hover:text-orange-400 transition-colors">Industrial Scope</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenViva}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-700/70 rounded-xl transition-all shadow-inner-specular"
            title="System Architecture & Mathematical Specifications"
          >
            <FileText className="w-3.5 h-3.5 text-orange-400" />
            <span>Architecture Specs</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="px-3.5 py-2 text-xs font-medium text-trio-muted hover:text-white transition-colors"
          >
            Sign In
          </button>

          <button
            onClick={onEnterDemo}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 rounded-xl shadow-[0_0_20px_-4px_rgba(249,115,22,0.55)] transition-all"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 sm:px-12 w-full overflow-hidden">
        {/* Architectural Coordinate Grid + Radial Mask */}
        <div
          className="absolute inset-0 bg-scada-grid pointer-events-none opacity-80"
          style={{ maskImage: 'radial-gradient(ellipse 75% 65% at 50% 25%, black 20%, transparent 100%)' }}
        />

        {/* Dual Ambient Spotlights */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[780px] h-[360px] bg-gradient-to-tr from-orange-500/15 via-amber-400/10 to-transparent blur-[110px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Enterprise System Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-stone-900/90 border border-stone-700/70 text-xs text-stone-300 mb-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-semibold text-stone-100 text-xs">TRIO Platform v3.0</span>
            <span className="text-stone-600 font-light">&bull;</span>
            <span className="text-amber-300/90 text-[11px] font-mono tracking-wide">Continuous Operational Intelligence</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-display text-4xl sm:text-5xl lg:text-[4rem] font-bold tracking-tight text-white max-w-4xl leading-[1.08] mb-6"
          >
            Discover What Your SCADA <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
              Has Never Seen Before.
            </span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-sm sm:text-base text-stone-400 max-w-2xl leading-relaxed mb-8 font-normal"
          >
            An unsupervised tri-memory intelligence platform designed to eliminate false alarm fatigue, 
            isolate baseline operating regimes, and characterize unknown physical states without labeled training data.
          </motion.p>

          {/* Capability Metric Chips */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-300 font-mono mb-9 py-2.5 px-5 rounded-2xl bg-stone-900/70 border border-stone-800 backdrop-blur-md shadow-inner-specular"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Training Leakage</span>
            </div>
            <span className="text-stone-700 hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span>0% False Discovery Rate</span>
            </div>
            <span className="text-stone-700 hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-yellow-400" />
              <span>DBSCAN Density Clustering</span>
            </div>
          </motion.div>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-14"
          >
            <button
              onClick={onEnterDemo}
              className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-stone-950 font-semibold text-sm hover:from-orange-400 hover:to-amber-300 shadow-[0_0_30px_-5px_rgba(249,115,22,0.55)] hover:shadow-[0_0_38px_-4px_rgba(249,115,22,0.75)] transition-all"
            >
              <span>Launch Live Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="#three-memories"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-900/80 text-stone-100 font-medium text-sm border border-stone-700/80 hover:border-orange-500/40 hover:bg-stone-800/80 shadow-inner-specular transition-all"
            >
              <span>Tri-Memory Architecture</span>
              <ChevronRight className="w-4 h-4 text-trio-muted" />
            </a>
          </motion.div>

          {/* Interactive SCADA & Discovery Console (High-Performance Industrial Visualizer) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="w-full max-w-5xl"
          >
            <IndustrialHeroConsole />
          </motion.div>
        </div>
      </section>

      {/* Three Memories Section */}
      <section id="three-memories" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-trio-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-trio-cyan mb-2 block">
            Core Tri-Memory Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Three Complementary Memory Subsystems
          </h2>
          <p className="text-trio-muted text-sm sm:text-base leading-relaxed">
            Conventional threshold detectors treat any unfamiliar sensor reading as an alarm.
            TRIO separates immediate momentum, verified historical prototypes, and accumulated contradiction evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: STM */}
          <div className="p-6 rounded-2xl bg-trio-card/60 border border-trio-border hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-trio-cyan flex items-center justify-center mb-5 border border-cyan-500/30">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. Short-Term Memory (STM)</h3>
              <p className="text-xs text-trio-muted leading-relaxed mb-4">
                Maintains a rolling sliding window (N=30) of the most recent physical observations. Computes instantaneous moving averages, rate-of-change velocity vectors (&Delta;v), and filters transient single-point sensor noise.
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-cyan" />
                <span>Rolling observation window (N=30)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-cyan" />
                <span>Calculates Temporal Inconsistency (T)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-cyan" />
                <span>Eliminates false alarms from momentary spikes</span>
              </li>
            </ul>
          </div>

          {/* Card 2: LTM */}
          <div className="p-6 rounded-2xl bg-trio-card/60 border border-trio-border hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-trio-purple flex items-center justify-center mb-5 border border-purple-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. Long-Term Memory (LTM)</h3>
              <p className="text-xs text-trio-muted leading-relaxed mb-4">
                Stores verified known operating regime prototypes learned unsupervised strictly from baseline historical partitions. Maintains centroid coordinates (&mu;k) and 95th-percentile cluster dispersion radii.
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-purple" />
                <span>Learned known-state prototype centroids</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-purple" />
                <span>Calculates Prototype Distance factor (D)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-purple" />
                <span>Zero leakage via chronological baseline fitting</span>
              </li>
            </ul>
          </div>

          {/* Card 3: CM */}
          <div className="p-6 rounded-2xl bg-trio-card/60 border border-trio-border hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-trio-amber flex items-center justify-center mb-5 border border-amber-500/30">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Contradiction Memory (CM)</h3>
              <p className="text-xs text-trio-muted leading-relaxed mb-4">
                The discovery core of TRIO. It ingests observations that contradict known prototypes (C &ge; &tau;). Using DBSCAN density grouping across time windows, it converts persistent contradictory points into validated novel regimes.
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-amber" />
                <span>Buffers high-contradiction observation points</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-amber" />
                <span>DBSCAN clustering of unknown operating regimes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trio-amber" />
                <span>Candidate progression: Pending &rarr; Confirmed</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Methodology Pipeline */}
      <section id="how-it-works" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-trio-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2 block">
            Operational Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            How TRIO Operates In Production
          </h2>
          <p className="text-trio-muted text-sm sm:text-base leading-relaxed">
            From raw multi-sensor SCADA streaming to explainable operational discoveries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl bg-trio-secondary/60 border border-trio-border">
            <span className="text-xl font-black text-cyan-400 font-mono block mb-2">01</span>
            <h4 className="text-sm font-bold text-white mb-2">Streaming Ingestion</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Industrial sensors (flow rates, pressures, tank levels, chemical pH) enter the STM sliding window with chronological scaling.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-secondary/60 border border-trio-border">
            <span className="text-xl font-black text-purple-400 font-mono block mb-2">02</span>
            <h4 className="text-sm font-bold text-white mb-2">Contradiction Scoring</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Each point is scored via C = &alpha;D + &beta;T + &gamma;A. Points exceeding &tau; enter Contradiction Memory for evidence accumulation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-secondary/60 border border-trio-border">
            <span className="text-xl font-black text-amber-400 font-mono block mb-2">03</span>
            <h4 className="text-sm font-bold text-white mb-2">DBSCAN Grouping</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Instead of flagging momentary spikes, CM clusters sustained anomalous points in feature space to identify dense novel operating regimes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-secondary/60 border border-trio-border">
            <span className="text-xl font-black text-emerald-400 font-mono block mb-2">04</span>
            <h4 className="text-sm font-bold text-white mb-2">Explainable Diagnosis</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Generates an unknown candidate showing exact sensor deviation deltas (+88% DPIT301 surge, -42% FIT101 drop) and plain-English diagnosis.
            </p>
          </div>
        </div>
      </section>

      {/* Mathematical Formulation */}
      <section id="research" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-trio-border/40">
        <div className="p-8 sm:p-10 rounded-2xl bg-trio-card/80 border border-trio-border flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-1/2">
            <span className="text-xs uppercase font-bold tracking-widest text-trio-cyan mb-2 block">
              Transparent Mathematical Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Contradiction Scoring Formulation
            </h3>
            <p className="text-sm text-trio-muted leading-relaxed mb-6">
              TRIO evaluates each observation using a transparent, normalized contradiction score balancing prototype distance, temporal velocity, and density:
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-center mb-6">
              <span className="text-lg sm:text-xl font-bold text-cyan-400">
                C = &alpha;&bull;D + &beta;&bull;T + &gamma;&bull;A
              </span>
              <div className="text-[11px] text-slate-400 mt-2">
                Default baseline weights: &alpha; = 0.45, &beta; = 0.30, &gamma; = 0.25 (&tau; = 0.48)
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p><strong className="text-purple-400">D (Prototype Distance):</strong> Normalized Euclidean distance to the nearest known LTM prototype centroid.</p>
              <p><strong className="text-cyan-400">T (Temporal Inconsistency):</strong> Deviation from STM sliding window moving average and velocity.</p>
              <p><strong className="text-amber-400">A (Anomaly Score):</strong> Normalized density score from unsupervised baseline estimator.</p>
            </div>
          </div>

          <div className="lg:w-1/2 w-full p-6 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-3">
            <div className="text-cyan-400 font-bold pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>// Mathematical Proof of Zero Data Leakage</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2 block">
            Target Deployments
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Critical Cyber-Physical Infrastructure
          </h2>
          <p className="text-trio-muted text-sm sm:text-base leading-relaxed">
            Tested on SWaT (Secure Water Treatment) architecture and architected for continuous industrial plants.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl bg-trio-card/60 border border-trio-border">
            <div className="text-cyan-400 mb-3"><Database className="w-5 h-5" /></div>
            <h4 className="text-sm font-bold text-white mb-2">Water Treatment (SWaT)</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Detects filtration membrane biofouling, pump cavitation, and multi-stage cyber-physical manipulation.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-card/60 border border-trio-border">
            <div className="text-purple-400 mb-3"><Zap className="w-5 h-5" /></div>
            <h4 className="text-sm font-bold text-white mb-2">Smart Power Grids</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Uncovers renewable microgrid synchronization drift, transformer overheating, and harmonic distortion regimes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-card/60 border border-trio-border">
            <div className="text-amber-400 mb-3"><Cpu className="w-5 h-5" /></div>
            <h4 className="text-sm font-bold text-white mb-2">Chemical Distillation</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Identifies unexpected catalyst degradation and multi-column thermal reflux anomalies before safety shutdowns.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-trio-card/60 border border-trio-border">
            <div className="text-emerald-400 mb-3"><Activity className="w-5 h-5" /></div>
            <h4 className="text-sm font-bold text-white mb-2">Automated Manufacturing</h4>
            <p className="text-xs text-trio-muted leading-relaxed">
              Discovers novel robotic actuator friction states and assembly line tolerances under thermal expansion.
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise Tech Stack Bar */}
      <div className="py-10 bg-slate-950/60 border-t border-trio-border px-6 sm:px-12 text-center">
        <p className="text-[11px] text-trio-muted uppercase tracking-widest font-semibold mb-4">
          Production Architecture &amp; Technology Stack
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 font-mono">
          <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800">React 19 + TypeScript</span>
          <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800">FastAPI + Python 3.14</span>
          <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800">Tailwind CSS</span>
          <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800">Scikit-Learn (DBSCAN + StandardScaler)</span>
          <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800">Recharts Telemetry Engine</span>
        </div>
      </div>

      {/* Clean Footer */}
      <footer className="py-6 px-6 sm:px-12 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-trio-muted border-t border-trio-border/40 gap-4">
        <div className="flex items-center gap-2">
          <TrioLogo size="xs" showText={false} />
          <span>TRIO AI &bull; Contradiction-Guided Tri-Memory Unsupervised Learning</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onOpenViva} className="hover:text-trio-cyan transition-colors">
            Architecture Specifications
          </button>
          <button onClick={onEnterDemo} className="hover:text-trio-cyan transition-colors">
            Platform Console
          </button>
          <a 
            href="https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/#swat" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-trio-cyan transition-colors flex items-center gap-1"
          >
            <span>iTrust SWaT Benchmark</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;