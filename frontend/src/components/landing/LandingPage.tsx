import React, { useState } from 'react';
import {
  Activity, Cpu, Database, Server, Terminal, Lock, ChevronRight,
  CheckCircle2, ArrowRight, Zap, RefreshCw, BarChart3, AlertOctagon,
  FileText, GitBranch, Layers, ShieldCheck, Check, Code, ExternalLink,
  HelpCircle, ChevronDown, Sparkles, Play, Eye, Clock, Sliders, AlertTriangle,
  PlayCircle, Shield, TrendingUp, MonitorSmartphone
} from 'lucide-react';
import { DigitalGlobe } from './DigitalGlobe';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { AegisLogo } from '../common/AegisLogo';

interface LandingPageProps {
  onLaunchConsole: () => void;
  onExploreDemo: () => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchConsole,
  onExploreDemo,
  openAuthModal
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'overview' | 'monitoring' | 'risk' | 'copilot'>('overview');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      q: "How does AegisOps AI predict incidents up to 30 minutes in advance?",
      a: "Rather than waiting for microservices to breach hard alerting thresholds (such as 90% CPU), AegisOps AI continuously analyzes multi-dimensional telemetry patterns. Subtle leading indicators—such as memory allocation rate divergence, thread lock queue growth, and latency variance shifts—are evaluated by our calibrated Random Forest model (+30m horizon), giving SRE teams time to intervene before downtime occurs."
    },
    {
      q: "Does the AI execute destructive commands on our infrastructure automatically?",
      a: "Never. AegisOps AI enforces a strict Human-in-the-Loop policy. The platform synthesizes verifiable facts, attributes root causes, and proposes remediation blueprints with exact blast radius analysis and zero-downtime rollback scripts. However, consequential actions require explicit authorization from an authenticated operator or lead engineer."
    },
    {
      q: "How does AegisOps AI prevent false positive alert fatigue?",
      a: "We address alert fatigue using dual-engine ML validation. First, an unsupervised Isolation Forest identifies true geometric outliers. Second, a calibrated Random Forest classifier determines whether that statistical anomaly corresponds to a high-probability incident. In our held-out test evaluation, this dual-engine approach achieved a 0.00% False Positive Rate across 752 nominal test periods."
    },
    {
      q: "What telemetry sources and infrastructure environments are supported?",
      a: "AegisOps AI ingests OpenTelemetry, Prometheus metrics, AWS CloudWatch, Datadog forwarders, and standard Kubernetes metrics-server streams. It runs seamlessly across AWS (App Runner, ECS, EKS), Google Cloud, Azure, and private on-premises Kubernetes clusters."
    },
    {
      q: "How does the AI Copilot distinguish facts from hypotheses?",
      a: "To maintain engineering credibility and eliminate hallucinations, the Copilot triages every investigation into three distinct tiers: FACTS (direct telemetry observations with timestamps), INFERENCES (statistically attributed models with confidence ratings), and HYPOTHESES (unproven causal theories that require manual diagnostic checks)."
    },
    {
      q: "Can I try AegisOps AI without providing cloud credentials?",
      a: "Yes! Click 'Watch Demo' in the hero or 'Explore the Demo' in the top bar to launch the complete interactive operations console with simulated microservices, live 5-second polling, and pre-loaded machine learning models."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-midnight-950 text-slate-100 selection:bg-brand-blue selection:text-white">
      
      {/* Ambient Radial Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-brand-blue/15 via-cyan-500/10 to-transparent blur-3xl opacity-75" />
        <div className="absolute top-[30%] -right-40 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-[65%] -left-40 w-[450px] h-[450px] bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20">
        
        {/* ============================================================== */}
        {/* SECTION 1: TWO-COLUMN HERO SECTION MATCHING REFERENCE LAYOUT   */}
        {/* ============================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 sm:py-10">
          
          {/* LEFT COLUMN: Content (~50% width on desktop) */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left space-y-5">
            
            {/* Small Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-midnight-900/90 border border-brand-blue/30 text-[11px] font-semibold text-cyan-300 backdrop-blur-md shadow-glow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="tracking-wider uppercase">AI-POWERED IT OPERATIONS</span>
            </div>

            {/* Large, Left-Aligned Headline with Controlled Line Breaks */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Detect. Predict. <br />
              <span className="bg-gradient-to-r from-brand-blue via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Resolve.
              </span> <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-300 bg-clip-text text-transparent">
                Before Incidents Happen.
              </span>
            </h1>

            {/* Compact Readable Paragraph */}
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
              AegisOps AI transforms infrastructure telemetry into actionable operational intelligence through anomaly detection, incident risk estimation, and evidence-based investigation.
            </p>

            {/* Two Horizontal Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => openAuthModal('register')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue via-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-glow-md hover:shadow-glow-cyan flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4 text-cyan-300" />
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={onExploreDemo}
                className="px-5 py-3 rounded-xl bg-midnight-900/90 hover:bg-midnight-800 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/10 hover:border-brand-blue/40 flex items-center justify-center gap-2 transition-all"
              >
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                Watch Demo
              </button>
            </div>

            {/* Four Compact Metric Blocks Below Buttons */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">ACCURACY</span>
                <p className="text-lg font-extrabold font-mono text-emerald-400 mt-0.5">99.89%</p>
                <p className="text-[9px] text-slate-500 leading-none mt-0.5">Held-out test set</p>
              </div>

              <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">LEAD TIME</span>
                <p className="text-lg font-extrabold font-mono text-cyan-400 mt-0.5">+30m</p>
                <p className="text-[9px] text-slate-500 leading-none mt-0.5">Pre-cursor warning</p>
              </div>

              <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">SYNC RATE</span>
                <p className="text-lg font-extrabold font-mono text-violet-400 mt-0.5">5 Sec</p>
                <p className="text-[9px] text-slate-500 leading-none mt-0.5">Zero-drift stream</p>
              </div>

              <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">GOVERNANCE</span>
                <p className="text-lg font-extrabold font-mono text-blue-400 mt-0.5">100%</p>
                <p className="text-[9px] text-slate-500 leading-none mt-0.5">Human approved</p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D Digital Globe with Floating Incident Cards (~50% width) */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center">
            <DigitalGlobe />
          </div>

        </section>

        {/* ============================================================== */}
        {/* SECTION 2: COMPACT TRUST & CLOUD INTEGRATION ECOSYSTEM STRIP   */}
        {/* ============================================================== */}
        <section className="mt-14 py-6 border-y border-white/[0.08] bg-midnight-900/40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
              SUPPORTED TELEMETRY & CLOUD ECOSYSTEM:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <CloudDot color="#00f0ff" /> AWS CloudWatch
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <CloudDot color="#3b82f6" /> Kubernetes
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <CloudDot color="#8b5cf6" /> Prometheus
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <CloudDot color="#06b6d4" /> OpenTelemetry
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <CloudDot color="#10b981" /> PostgreSQL
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <CloudDot color="#f59e0b" /> Docker
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: SIX DISTINCT FEATURE CARDS IN RESPONSIVE GRID       */}
        {/* ============================================================== */}
        <section id="features" className="mt-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">
              Intelligent Autonomous Operations
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Continuous multi-dimensional telemetry analysis designed to protect modern cloud services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Card 1: Real-time Monitoring */}
            <div className="p-6 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-cyan-400/40 transition-all group shadow-sm hover:shadow-glow-sm">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Monitoring</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                5-second multi-metric streaming tracking CPU, memory, RPS, p99 latency, and error rates across all microservices with visibility-aware pausing.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-cyan-400 font-medium">
                <span>5-Second Zero-Drift Stream</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 2: Anomaly Detection */}
            <div className="p-6 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-violet-500/40 transition-all group shadow-sm hover:shadow-glow-violet">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Anomaly Detection</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Unsupervised Isolation Forest isolating unknown multidimensional geometric deviations from nominal baseline operations without requiring labels.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-violet-400 font-medium">
                <span>Isolation Forest (ISO-v1.2.0)</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 3: Predictive Risk */}
            <div className="p-6 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-blue-500/40 transition-all group shadow-sm hover:shadow-glow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-brand-blue/30 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Predictive Risk (+30m)</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Calibrated Random Forest classifier forecasting failure probabilities 30 minutes in advance, providing time to intervene before SLA breach.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-blue-400 font-medium">
                <span>99.89% Verified Test Accuracy</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 4: AI Investigation */}
            <div className="p-6 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-amber-500/40 transition-all group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">AI Investigation Copilot</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Automated root cause synthesis strictly segregating undeniable FACTS, algorithmic INFERENCES, and testable diagnostic HYPOTHESES.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-amber-400 font-medium">
                <span>Zero Hallucination Protocol</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 5: Incident Management */}
            <div className="p-6 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-emerald-500/40 transition-all group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Governed Remediation</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Human-in-the-loop authorization workbench with blast radius validation, rollback checkpoints, and zero autonomous destructive commands.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-emerald-400 font-medium">
                <span>Guaranteed Zero-Downtime Rollbacks</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 6: Analytics & Reports */}
            <div className="p-6 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-rose-500/40 transition-all group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Analytics & Reports</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                MTTR trend metrics, empirical confusion matrices, and audit-ready JSON/CSV export capabilities for compliance and leadership review.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-[11px] text-rose-400 font-medium">
                <span>SOC 2 & ISO 27001 Audit Ready</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: HOW IT WORKS (FOUR CONNECTED STEPS)                 */}
        {/* ============================================================== */}
        <section id="how-it-works" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-blue">Operational Loop</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">How The Platform Works</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              From raw Prometheus telemetry to authorized remediation in four connected steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 relative">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs mb-3">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Monitor</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Ingests CPU, memory, RPS throughput, p99 latency, and error rates every 5 seconds across microservices.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 relative">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/20 text-blue-400 border border-brand-blue/30 flex items-center justify-center font-bold text-xs mb-3">
                02
              </div>
              <h3 className="text-sm font-bold text-white">Detect</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Unsupervised Isolation Forest flags statistical telemetry deviations without waiting for hard alerting thresholds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 relative">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-xs mb-3">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Predict</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Calibrated Random Forest model projects incident failure risk 30 minutes in advance with probability scoring.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs mb-3">
                04
              </div>
              <h3 className="text-sm font-bold text-white">Resolve</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                AI Copilot synthesizes forensic evidence and awaits operator approval before executing zero-downtime remediation.
              </p>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: DETAILED PRODUCT DASHBOARD PREVIEW                  */}
        {/* ============================================================== */}
        <section id="preview" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Live Console Preview</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">
              Production-Grade SRE Console
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Explore the real application layout below with live microservice telemetry and predictive risk gauges.
            </p>

            {/* Preview View Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-midnight-900 border border-white/10 mt-6 text-xs">
              <button
                onClick={() => setActivePreviewTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  activePreviewTab === 'overview' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                System Overview
              </button>
              <button
                onClick={() => setActivePreviewTab('monitoring')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  activePreviewTab === 'monitoring' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Telemetry Matrix
              </button>
              <button
                onClick={() => setActivePreviewTab('risk')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  activePreviewTab === 'risk' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Predictive Risk (+30m)
              </button>
              <button
                onClick={() => setActivePreviewTab('copilot')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  activePreviewTab === 'copilot' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Copilot Investigation
              </button>
            </div>
          </div>

          {/* Detailed Application Window Container */}
          <div className="rounded-2xl border border-white/15 bg-midnight-950/95 shadow-2xl overflow-hidden backdrop-blur-xl">
            
            {/* Top Fake Window Bar */}
            <div className="h-10 bg-midnight-900 border-b border-white/[0.08] px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 font-mono text-[11px] ml-2">aegisops-console.internal/overview</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Cluster Healthy
                </span>
                <span>5s Telemetry Stream</span>
              </div>
            </div>

            {/* Main Mockup Body with Sidebar & Content */}
            <div className="grid grid-cols-12 min-h-[480px]">
              
              {/* Fake Mini Sidebar */}
              <div className="col-span-12 sm:col-span-3 lg:col-span-2 bg-midnight-900/60 border-r border-white/[0.06] p-3 space-y-1 text-xs font-medium">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">NAVIGATION</div>
                <div className={`px-2.5 py-2 rounded-lg flex items-center gap-2 ${activePreviewTab === 'overview' ? 'bg-brand-blue text-white font-semibold' : 'text-slate-400'}`}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </div>
                <div className={`px-2.5 py-2 rounded-lg flex items-center gap-2 ${activePreviewTab === 'monitoring' ? 'bg-brand-blue text-white font-semibold' : 'text-slate-400'}`}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Monitoring</span>
                </div>
                <div className={`px-2.5 py-2 rounded-lg flex items-center gap-2 ${activePreviewTab === 'risk' ? 'bg-brand-blue text-white font-semibold' : 'text-slate-400'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Predictive Risk</span>
                </div>
                <div className={`px-2.5 py-2 rounded-lg flex items-center gap-2 ${activePreviewTab === 'copilot' ? 'bg-brand-blue text-white font-semibold' : 'text-slate-400'}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Copilot</span>
                </div>
                <div className="px-2.5 py-2 rounded-lg text-slate-400 flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Topology</span>
                </div>
                <div className="px-2.5 py-2 rounded-lg text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-12 sm:col-span-9 lg:col-span-10 p-5 space-y-5">
                
                {/* 4 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-midnight-900 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">CLUSTER STATUS</span>
                    <p className="text-lg font-bold text-emerald-400 mt-1 font-mono">99.4% Nominal</p>
                    <span className="text-[9px] text-slate-500">7/8 Services Optimal</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-midnight-900 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ACTIVE INCIDENTS</span>
                    <p className="text-lg font-bold text-rose-400 mt-1 font-mono">1 Critical (P1)</p>
                    <span className="text-[9px] text-slate-500">payment-processor</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-midnight-900 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">PREDICTED HORIZON</span>
                    <p className="text-lg font-bold text-cyan-400 mt-1 font-mono">+30 Minutes</p>
                    <span className="text-[9px] text-slate-500">Random Forest v1.4.2</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-midnight-900 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">MTTR REDUCTION</span>
                    <p className="text-lg font-bold text-violet-400 mt-1 font-mono">-56.4% MTTR</p>
                    <span className="text-[9px] text-slate-500">From 28.5m to 12.4m</span>
                  </div>
                </div>

                {/* Tab Dynamic Area */}
                {activePreviewTab === 'overview' && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-midnight-900 border border-rose-500/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                          <span className="font-bold text-white text-sm">payment-processor: P99 Latency Surge & Thread Lock</span>
                          <Badge variant="p1">P1-CRITICAL</Badge>
                        </div>
                        <button
                          onClick={onExploreDemo}
                          className="px-3 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-semibold hover:bg-rose-500/30 self-start sm:self-auto"
                        >
                          Triage in Operations Console
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[11px]">
                        <div>P99: <span className="text-rose-400 font-bold">740ms</span> (norm: 45ms)</div>
                        <div>MEM: <span className="text-rose-400 font-bold">94.2%</span> (limit: 90%)</div>
                        <div>RPS: <span className="text-amber-400 font-bold">840 req/s</span></div>
                        <div>ERR: <span className="text-rose-400 font-bold">5.2% 5xx</span></div>
                      </div>
                    </div>

                    {/* Microservice Live Table */}
                    <div className="rounded-xl border border-white/5 bg-midnight-900/60 overflow-hidden">
                      <div className="p-3 border-b border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                        <span>SERVICE INVENTORY</span>
                        <span>TELEMETRY METRICS</span>
                      </div>
                      <div className="divide-y divide-white/5 text-xs font-mono">
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            api-gateway
                          </div>
                          <div className="flex items-center gap-4 text-slate-400">
                            <span>CPU: 32.4%</span>
                            <span>MEM: 46.1%</span>
                            <span className="text-emerald-400 font-bold">P99: 28ms</span>
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            order-service
                          </div>
                          <div className="flex items-center gap-4 text-slate-400">
                            <span>CPU: 68.0%</span>
                            <span>MEM: 62.5%</span>
                            <span className="text-amber-400 font-bold">P99: 310ms</span>
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            auth-service
                          </div>
                          <div className="flex items-center gap-4 text-slate-400">
                            <span>CPU: 24.1%</span>
                            <span>MEM: 38.0%</span>
                            <span className="text-emerald-400 font-bold">P99: 18ms</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'monitoring' && (
                  <div className="space-y-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-midnight-900 border border-white/10">
                      <span className="text-slate-400 text-xs block mb-2 font-sans font-semibold">Live 5-Second Telemetry Ingestion</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-midnight-950 border border-white/5">
                          <span className="text-slate-500 text-[10px] block">THROUGHPUT</span>
                          <span className="text-cyan-400 text-xl font-bold">12,480 RPS</span>
                        </div>
                        <div className="p-3 rounded-lg bg-midnight-950 border border-white/5">
                          <span className="text-slate-500 text-[10px] block">P99 LATENCY MEDIAN</span>
                          <span className="text-emerald-400 text-xl font-bold">42.5 ms</span>
                        </div>
                        <div className="p-3 rounded-lg bg-midnight-950 border border-white/5">
                          <span className="text-slate-500 text-[10px] block">GLOBAL ERROR RATE</span>
                          <span className="text-amber-400 text-xl font-bold">0.42%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'risk' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-midnight-900 border border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-white text-sm">Supervised +30m Risk Model Attribution</span>
                        <Badge variant="nominal">RF-v1.4.2 (99.89% Acc)</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-mono">payment-processor</span>
                          <span className="text-rose-400 font-bold font-mono">94.2% Risk Score</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-rose-500 h-2 rounded-full" style={{ width: '94.2%' }} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                        Interaction term `cpu_latency_interaction` breached critical threshold. Heap allocation rate accelerating at +14MB/sec.
                      </p>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'copilot' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-midnight-900 border border-cyan-500/20">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">FACT (VERIFIED TELEMETRY)</span>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        P99 response latency surged from 45ms to 740ms. Process RSS memory reached 94.2% limit at timestamp 14:32:00.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-midnight-900 border border-violet-500/20">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1">INFERENCE (MODEL ATTRIBUTION)</span>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        Correlation between thread pool exhaustion and GC pauses indicates JVM heap leak (0.94 confidence).
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-midnight-900 border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">RECOMMENDED REMEDIATION (AWAITING SIGN-OFF)</span>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        Execute rolling container restart with heap dump extraction. Scale replica pool from 2 to 4 pods.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 6: ML BENCHMARKS & EMPIRICAL METRICS                   */}
        {/* ============================================================== */}
        <section id="about" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">Empirical Rigor</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">
              Verified Machine Learning Metrics
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Evaluated strictly on 900 held-out test records. Real measurements, zero fabrication.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">SUPERVISED MODEL</span>
              <h3 className="text-base font-bold text-white">Random Forest Classifier</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluated on 900 held-out test samples across memory leaks, cascading thread exhaustion, and error surges.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <div className="p-2 rounded-lg bg-midnight-950 border border-white/5">
                  <span className="text-slate-500 text-[10px] block">TEST ACCURACY</span>
                  <span className="text-emerald-400 font-bold text-base">99.89%</span>
                </div>
                <div className="p-2 rounded-lg bg-midnight-950 border border-white/5">
                  <span className="text-slate-500 text-[10px] block">F1 SCORE</span>
                  <span className="text-cyan-400 font-bold text-base">0.9966</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">HELD-OUT CONFUSION MATRIX</span>
              <h3 className="text-base font-bold text-white">Confusion Matrix (N = 900)</h3>
              <div className="p-2.5 rounded-lg bg-midnight-950 border border-white/5 font-mono text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>True Negatives (TN):</span>
                  <span className="text-white font-bold">752</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>False Positives (FP):</span>
                  <span className="text-emerald-400 font-bold">0</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>False Negatives (FN):</span>
                  <span className="text-amber-400 font-bold">1</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>True Positives (TP):</span>
                  <span className="text-white font-bold">147</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">UNSUPERVISED MODEL</span>
              <h3 className="text-base font-bold text-white">Isolation Forest Detector</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained purely on nominal operational envelopes without labels to detect novel zero-day drifts.
              </p>
              <div className="p-2.5 rounded-lg bg-midnight-950 border border-violet-500/20 text-xs text-slate-300">
                <p className="text-slate-400 leading-relaxed">
                  <strong className="text-cyan-400">Risk Score</strong> is the supervised probability that an incident breaches thresholds in 30m.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 7: SECURITY & GOVERNANCE                               */}
        {/* ============================================================== */}
        <section className="mt-28">
          <div className="p-8 sm:p-10 rounded-2xl bg-midnight-900/80 border border-white/10 relative overflow-hidden">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Zero-Trust SRE Safety</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
                Human-in-the-Loop Governance
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                AegisOps AI never executes destructive infrastructure remediation without explicit human approval. Every proposed remediation plan carries an exact blast radius analysis, rollback script, and tamper-evident audit log.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Salted Bcrypt & JWT Bearer</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Cryptographically signed access tokens and salted password hashing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">No Insecure Fallbacks</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Strict environment-variable configuration; zero client-side credential exposure.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Immutable Audit Trails</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Every login, remediation approval, rejection, and resolution is permanently persisted.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Rollback Checkpoints</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Every approved remediation action contains guaranteed zero-downtime rollback commands.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 8: FAQ ACCORDION                                       */}
        {/* ============================================================== */}
        <section className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Clear Answers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Everything you need to know about adopting AegisOps AI for your engineering organization.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-midnight-900/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      {item.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-300' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 9: FINAL CALL TO ACTION                                */}
        {/* ============================================================== */}
        <section className="mt-28 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Prevent Incidents in Real Time?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2.5">
            Open the live Operations Console, inspect active telemetry streams, and run the ML risk predictor.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue via-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-glow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Eye className="w-4 h-4 text-cyan-300" />
              Explore Interactive Demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-midnight-900 border border-white/10 hover:border-brand-blue/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all"
            >
              Create SRE Account
            </button>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-midnight-950 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <AegisLogo variant="horizontal" size="sm" />
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-[11px]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-white transition-colors">Console Preview</a>
            <a href="#about" className="hover:text-white transition-colors">ML Benchmarks</a>
            <span className="text-slate-600">&bull;</span>
            <span className="font-mono text-slate-500">&copy; 2026 AegisOps AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const CloudDot = ({ color }: { color: string }) => (
  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
);
