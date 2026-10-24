import React, { useState } from 'react';
import {
  Activity, Cpu, Database, Server, Terminal, Lock, ChevronRight,
  CheckCircle2, ArrowRight, Zap, RefreshCw, BarChart3, AlertOctagon,
  FileText, GitBranch, Layers, ShieldCheck, Check, Code, ExternalLink,
  HelpCircle, ChevronDown, Sparkles, Play, Eye, Clock, Sliders, AlertTriangle,
  PlayCircle, Shield, TrendingUp, MonitorSmartphone, Bell, CheckCircle,
  XCircle, Filter, Search, ArrowUpRight
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
      a: "Yes! Click 'Watch Demo' in the hero or 'Console' in the navigation bar to launch the complete interactive operations console with simulated microservices, live 5-second polling, and pre-loaded machine learning models."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-midnight-950 text-slate-100 selection:bg-brand-blue selection:text-white">
      
      {/* Ambient Lighting Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-brand-blue/15 via-cyan-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -right-32 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-[65%] -left-32 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-16">
        
        {/* ============================================================== */}
        {/* 1. HERO SECTION — TWO COLUMNS (48% Left / 52% Right on Desktop)*/}
        {/* ============================================================== */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6 py-4 sm:py-8">
          
          {/* LEFT SIDE: Approximately 48% Width */}
          <div className="w-full lg:w-[48%] flex flex-col items-start text-left space-y-4">
            
            {/* AI-POWERED IT OPERATIONS Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-midnight-900/90 border border-brand-blue/30 text-[10px] sm:text-[11px] font-semibold text-cyan-300 backdrop-blur-md shadow-glow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="tracking-wider uppercase">AI-POWERED IT OPERATIONS</span>
            </div>

            {/* Compact, Bold Headline (Approx 3-4 lines at 1440px desktop) */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-black tracking-tight leading-[1.12] text-white">
              Detect. Predict. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-blue via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Resolve.
              </span>{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-300 bg-clip-text text-transparent">
                Before Incidents Happen.
              </span>
            </h1>

            {/* Short Description (Max-width ~540px) */}
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-[540px]">
              AegisOps AI transforms infrastructure telemetry into actionable operational intelligence through anomaly detection, incident risk estimation, and evidence-based investigation.
            </p>

            {/* Side-by-Side Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => openAuthModal('register')}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-brand-blue via-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-glow-md hover:shadow-glow-cyan flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4 text-cyan-300" />
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={onExploreDemo}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-midnight-900/90 hover:bg-midnight-800 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/10 hover:border-brand-blue/40 flex items-center justify-center gap-2 transition-all"
              >
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                Watch Demo
              </button>
            </div>

            {/* Four Compact Metrics Below Buttons */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
              <div className="p-2.5 rounded-xl bg-midnight-900/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">ACCURACY</span>
                <p className="text-base font-extrabold font-mono text-emerald-400 mt-0.5">99.89%</p>
                <p className="text-[9px] text-slate-500 leading-none mt-0.5">Held-out split</p>
              </div>

              <div className="p-2.5 rounded-xl bg-midnight-900/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">LEAD TIME</span>
                <p className="text-base font-extrabold font-mono text-cyan-400 mt-0.5">+30m</p>
                <p className="text-[9px] text-slate-500 leading-none mt-0.5">Pre-cursor radar</p>
              </div>

              <div className="p-2.5 rounded-xl bg-midnight-900/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">SYNC RATE</span>
                <p className="text-base font-extrabold font-mono text-violet-400 mt-0.5">5 Sec</p>
                <p className="text-[9px] text-slate-500 leading-none mt-0.5">Zero-drift stream</p>
              </div>

              <div className="p-2.5 rounded-xl bg-midnight-900/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">GOVERNANCE</span>
                <p className="text-base font-extrabold font-mono text-blue-400 mt-0.5">100%</p>
                <p className="text-[9px] text-slate-500 leading-none mt-0.5">Human approved</p>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Approximately 52% Width (3D Globe with 3 Alert Cards) */}
          <div className="w-full lg:w-[52%] relative flex items-center justify-center">
            <DigitalGlobe />
          </div>

        </section>

        {/* ============================================================== */}
        {/* 2. COMPACT TECHNOLOGY & TRUST STRIP                            */}
        {/* ============================================================== */}
        <section className="mt-12 py-4 border-y border-white/[0.08] bg-midnight-900/40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
              SUPPORTED TELEMETRY & CLOUD ECOSYSTEM:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs font-mono text-slate-400">
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
        {/* 3. SIX PREMIUM FEATURE CARDS (3-Col Desktop Grid)              */}
        {/* ============================================================== */}
        <section id="features" className="mt-16 sm:mt-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400">Platform Features</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Autonomous Operations Intelligence
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              Continuous multi-dimensional telemetry analysis designed to protect modern cloud services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            
            {/* Card 1: Real-time Monitoring */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-cyan-400/40 transition-all group shadow-sm hover:shadow-glow-sm">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Real-Time Monitoring</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                5-second multi-metric streaming tracking CPU, memory, RPS, p99 latency, and error rates across all microservices.
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center text-[10px] text-cyan-400 font-medium">
                <span>5-Second Zero-Drift Stream</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* Card 2: Anomaly Detection */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-violet-500/40 transition-all group shadow-sm hover:shadow-glow-violet">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Anomaly Detection</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Unsupervised Isolation Forest isolating unknown multidimensional geometric deviations from nominal baseline operations.
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center text-[10px] text-violet-400 font-medium">
                <span>Isolation Forest (ISO-v1.2.0)</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* Card 3: Predictive Risk */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-blue-500/40 transition-all group shadow-sm hover:shadow-glow-sm">
              <div className="w-9 h-9 rounded-xl bg-brand-blue/15 border border-brand-blue/30 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Predictive Risk (+30m)</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Calibrated Random Forest classifier forecasting failure probabilities 30 minutes in advance, enabling early intervention.
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center text-[10px] text-blue-400 font-medium">
                <span>99.89% Verified Test Accuracy</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* Card 4: AI Investigation */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-amber-500/40 transition-all group shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Investigation Copilot</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Automated root cause synthesis strictly segregating undeniable FACTS, algorithmic INFERENCES, and testable HYPOTHESES.
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center text-[10px] text-amber-400 font-medium">
                <span>Zero Hallucination Protocol</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* Card 5: Incident Management */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-emerald-500/40 transition-all group shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Governed Remediation</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Human-in-the-loop authorization workbench with blast radius validation, rollback checkpoints, and zero rogue actions.
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center text-[10px] text-emerald-400 font-medium">
                <span>Zero-Downtime Rollbacks</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* Card 6: Analytics & Reports */}
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-white/10 hover:border-rose-500/40 transition-all group shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Analytics & Reports</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                MTTR trend metrics, empirical confusion matrices, and audit-ready JSON/CSV export capabilities for engineering compliance.
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center text-[10px] text-rose-400 font-medium">
                <span>SOC 2 & Audit Ready</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. FOUR-STEP WORKFLOW: Monitor -> Detect -> Predict -> Resolve */}
        {/* ============================================================== */}
        <section id="how-it-works" className="mt-16 sm:mt-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-brand-blue">Operational Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Four-Step Incident Prevention</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              From raw telemetry ingestion to authorized resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            
            <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/10 relative">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs mb-2.5">
                01
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Monitor</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Ingests CPU, memory, RPS throughput, p99 latency, and error rates every 5s across microservices.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/10 relative">
              <div className="w-7 h-7 rounded-lg bg-brand-blue/20 text-blue-400 border border-brand-blue/30 flex items-center justify-center font-bold text-xs mb-2.5">
                02
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Detect</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Unsupervised Isolation Forest flags statistical telemetry deviations without waiting for hard thresholds.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/10 relative">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-xs mb-2.5">
                03
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Predict</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Calibrated Random Forest projects incident failure probability 30 minutes in advance.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-midnight-900/80 border border-white/10 relative">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs mb-2.5">
                04
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Resolve</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                AI Copilot synthesizes forensic evidence and awaits operator approval before executing rollback-safe remediation.
              </p>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* 5. LARGE PRODUCT DASHBOARD PREVIEW                             */}
        {/* ============================================================== */}
        <section id="preview" className="mt-16 sm:mt-20">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400">Application Preview</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Production Enterprise Console
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              Engineered with high information density, dark glass panels, and real-time operational feeds.
            </p>

            {/* Sub-tab preview switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-midnight-900 border border-white/10 mt-5 text-xs">
              <button
                onClick={() => setActivePreviewTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activePreviewTab === 'overview' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActivePreviewTab('monitoring')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activePreviewTab === 'monitoring' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Metrics
              </button>
              <button
                onClick={() => setActivePreviewTab('risk')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activePreviewTab === 'risk' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Predictive Risk
              </button>
              <button
                onClick={() => setActivePreviewTab('copilot')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activePreviewTab === 'copilot' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Copilot Triage
              </button>
            </div>
          </div>

          {/* Detailed Dashboard Window with Sidebar, Metrics, Charts & Table */}
          <div className="rounded-2xl border border-white/15 bg-midnight-950 shadow-2xl overflow-hidden">
            
            {/* Window Header */}
            <div className="h-10 bg-midnight-900 border-b border-white/[0.08] px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 font-mono text-[11px] ml-2">aegisops.internal/console</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cluster Nominal
                </span>
                <span className="hidden sm:inline">5s Polling</span>
              </div>
            </div>

            {/* Window Content: Sidebar + Main Content */}
            <div className="grid grid-cols-12 min-h-[460px]">
              
              {/* Compact Dark Sidebar */}
              <div className="col-span-12 sm:col-span-3 lg:col-span-2 bg-midnight-900/60 border-r border-white/[0.06] p-3 space-y-1 text-xs font-medium">
                <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">CONSOLE</div>
                <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${activePreviewTab === 'overview' ? 'bg-brand-blue text-white font-semibold' : 'text-slate-400'}`}>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Overview</span>
                </div>
                <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${activePreviewTab === 'monitoring' ? 'bg-brand-blue text-white font-semibold' : 'text-slate-400'}`}>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Monitoring</span>
                </div>
                <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${activePreviewTab === 'risk' ? 'bg-brand-blue text-white font-semibold' : 'text-slate-400'}`}>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Risk (+30m)</span>
                </div>
                <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${activePreviewTab === 'copilot' ? 'bg-brand-blue text-white font-semibold' : 'text-slate-400'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Copilot</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg text-slate-400 flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Topology</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-lg text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </div>
              </div>

              {/* Main Area */}
              <div className="col-span-12 sm:col-span-9 lg:col-span-10 p-4 sm:p-5 space-y-4">
                
                {/* 4 KPI System Health Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-midnight-900 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">OVERALL HEALTH</span>
                    <p className="text-base font-bold text-emerald-400 mt-0.5 font-mono">99.4% NOMINAL</p>
                    <span className="text-[9px] text-slate-500">7/8 Services Optimal</span>
                  </div>
                  <div className="p-3 rounded-xl bg-midnight-900 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">ACTIVE INCIDENTS</span>
                    <p className="text-base font-bold text-rose-400 mt-0.5 font-mono">1 CRITICAL (P1)</p>
                    <span className="text-[9px] text-slate-500">payment-processor</span>
                  </div>
                  <div className="p-3 rounded-xl bg-midnight-900 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">PREDICTED HORIZON</span>
                    <p className="text-base font-bold text-cyan-400 mt-0.5 font-mono">+30 MINUTES</p>
                    <span className="text-[9px] text-slate-500">RF-v1.4.2 Model</span>
                  </div>
                  <div className="p-3 rounded-xl bg-midnight-900 border border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">MTTR REDUCTION</span>
                    <p className="text-base font-bold text-violet-400 mt-0.5 font-mono">-56.4% MTTR</p>
                    <span className="text-[9px] text-slate-500">28.5m &rarr; 12.4m</span>
                  </div>
                </div>

                {/* Microservice Live Table & Active Incident Panel */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-midnight-900 border border-rose-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        <span className="font-bold text-white text-xs">payment-processor: P99 Latency Surge & Thread Lock</span>
                        <Badge variant="p1">P1-CRITICAL</Badge>
                      </div>
                      <button
                        onClick={onExploreDemo}
                        className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-semibold hover:bg-rose-500/30 self-start sm:self-auto"
                      >
                        Open Live Triage &rarr;
                      </button>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[10px]">
                      <div>P99: <span className="text-rose-400 font-bold">740ms</span> (norm: 45ms)</div>
                      <div>MEM: <span className="text-rose-400 font-bold">94.2%</span> (limit: 90%)</div>
                      <div>RPS: <span className="text-amber-400 font-bold">840 req/s</span></div>
                      <div>ERR: <span className="text-rose-400 font-bold">5.2% 5xx</span></div>
                    </div>
                  </div>

                  {/* Microservice Health Indicators */}
                  <div className="rounded-xl border border-white/5 bg-midnight-900/60 overflow-hidden">
                    <div className="p-2.5 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                      <span>MICROSERVICE STATUS</span>
                      <span>CURRENT TELEMETRY</span>
                    </div>
                    <div className="divide-y divide-white/5 text-xs font-mono">
                      <div className="p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          api-gateway
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                          <span>CPU: 32.4%</span>
                          <span>MEM: 46.1%</span>
                          <span className="text-emerald-400 font-bold">P99: 28ms</span>
                        </div>
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          order-service
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                          <span>CPU: 68.0%</span>
                          <span>MEM: 62.5%</span>
                          <span className="text-amber-400 font-bold">P99: 310ms</span>
                        </div>
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          auth-service
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                          <span>CPU: 24.1%</span>
                          <span>MEM: 38.0%</span>
                          <span className="text-emerald-400 font-bold">P99: 18ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* 6. AI INVESTIGATION COPILOT PREVIEW                            */}
        {/* ============================================================== */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-[11px] font-bold tracking-widest uppercase text-violet-400">Zero-Hallucination AI</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              AI Investigation Copilot
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              Strictly segregated forensic breakdown between verifiable facts, algorithmic inferences, and testable hypotheses.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-midnight-900/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="font-bold text-white text-xs sm:text-sm">Active Incident Triage: payment-processor</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                EVIDENCE SYNTHESIS v1.4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* FACTS */}
              <div className="p-3.5 rounded-xl bg-midnight-950 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">VERIFIABLE FACTS</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Observed Telemetry Signals:</p>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li>P99 latency surged from 45ms to 740ms.</li>
                  <li>RSS memory consumption reached 94.2% limit.</li>
                  <li>Error rate: 5.2% HTTP 504 Gateway Timeout.</li>
                </ul>
              </div>

              {/* INFERENCES */}
              <div className="p-3.5 rounded-xl bg-midnight-950 border border-violet-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-violet-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">ALGORITHMIC INFERENCES</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Model Attribution (0.94 Conf):</p>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li>Thread pool starvation correlated with GC pauses.</li>
                  <li>Unrecoverable OOM kill projected within 18m.</li>
                  <li>Single service blast radius; order-service isolated.</li>
                </ul>
              </div>

              {/* HYPOTHESES */}
              <div className="p-3.5 rounded-xl bg-midnight-950 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">DIAGNOSTIC HYPOTHESES</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Testable Root Causes:</p>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li>Database connection leak in release v2.14.8.</li>
                  <li>Stuck HikariCP connection pool threads.</li>
                  <li>Action: `kubectl logs -n prod payment-processor`.</li>
                </ul>
              </div>

            </div>

            {/* Governed Action Plan Banner */}
            <div className="p-3.5 rounded-xl bg-midnight-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-emerald-400 block">Recommended Safe Remediation:</span>
                <span className="text-[11px] text-slate-300">
                  Scale pod replica count (2 &rarr; 4) + Rolling restart with heap dump forensics.
                </span>
              </div>
              <button
                onClick={onExploreDemo}
                className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold whitespace-nowrap"
              >
                Approve Remediation (Lead SRE)
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 7. INFRASTRUCTURE TOPOLOGY PREVIEW                             */}
        {/* ============================================================== */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400">Service Mesh Mapping</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Infrastructure Topology Preview
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              Live dependency visualization with automated degraded call-path highlighting and blast-radius tracing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-midnight-900/80 border border-white/10 shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-midnight-950 border border-emerald-500/30">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block mb-1" />
                <h4 className="text-xs font-bold text-white">api-gateway</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">28ms &bull; 1,850 RPS</p>
              </div>
              <div className="p-3.5 rounded-xl bg-midnight-950 border border-amber-500/30">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block mb-1" />
                <h4 className="text-xs font-bold text-white">order-service</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">310ms &bull; 620 RPS</p>
              </div>
              <div className="p-3.5 rounded-xl bg-midnight-950 border border-rose-500/40 shadow-glow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block mb-1" />
                <h4 className="text-xs font-bold text-white">payment-processor</h4>
                <p className="text-[10px] text-rose-400 font-mono font-bold mt-0.5">740ms &bull; DEGRADED</p>
              </div>
              <div className="p-3.5 rounded-xl bg-midnight-950 border border-emerald-500/30">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block mb-1" />
                <h4 className="text-xs font-bold text-white">postgres-db</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">14ms &bull; Pool 68%</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Upstream: api-gateway &rarr; payment-processor</span>
              <span className="text-rose-400 font-medium">Degraded Link (p99 &gt; 500ms)</span>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 8. SECURITY & GOVERNANCE SECTION                               */}
        {/* ============================================================== */}
        <section className="mt-16 sm:mt-20">
          <div className="p-6 sm:p-8 rounded-2xl bg-midnight-900/80 border border-white/10 relative overflow-hidden">
            <div className="max-w-3xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Zero-Trust SRE Safety</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Security & Human-in-the-Loop Governance
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                AegisOps AI never executes destructive infrastructure remediation without explicit human approval. Every proposed remediation plan carries an exact blast radius analysis, rollback script, and tamper-evident audit log.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Salted Bcrypt & JWT Bearer</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Cryptographically signed access tokens and salted password hashing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">No Insecure Fallbacks</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Strict environment-variable configuration; zero client-side credential exposure.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Immutable Audit Trails</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Every login, remediation approval, rejection, and resolution is permanently persisted.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
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
        {/* 9. FAQ ACCORDION                                               */}
        {/* ============================================================== */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400">Clear Answers</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              Everything you need to know about adopting AegisOps AI for your engineering organization.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-2.5">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-midnight-900/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {item.q}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-300' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 sm:px-4 pb-3.5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 10. FINAL CALL TO ACTION                                       */}
        {/* ============================================================== */}
        <section className="mt-16 sm:mt-20 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Prevent Incidents in Real Time?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Open the live Operations Console, inspect active telemetry streams, and run the ML risk predictor.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue via-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-glow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Eye className="w-4 h-4 text-cyan-300" />
              Explore Interactive Demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-midnight-900 border border-white/10 hover:border-brand-blue/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all"
            >
              Create SRE Account
            </button>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-midnight-950 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <AegisLogo variant="horizontal" size="sm" />
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
            <a href="#preview" className="hover:text-white transition-colors">Console Preview</a>
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
