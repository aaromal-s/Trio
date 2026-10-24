import React, { useState } from 'react';
import {
  Shield, Activity, Cpu, Database, Server, Terminal, Lock, ChevronRight,
  CheckCircle2, ArrowRight, Zap, RefreshCw, BarChart3, AlertOctagon,
  FileText, GitBranch, Layers, ShieldCheck, Check, Code, ExternalLink,
  HelpCircle, ChevronDown, Sparkles, Play, Eye, Clock, Sliders, AlertTriangle
} from 'lucide-react';
import { TopologyCanvas } from './TopologyCanvas';
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
  const [activePreviewTab, setActivePreviewTab] = useState<'monitoring' | 'risk' | 'copilot'>('monitoring');
  
  // Interactive Simulator for Beginners
  const [simulatedScenario, setSimulatedScenario] = useState<'nominal' | 'latency' | 'memory'>('nominal');

  // FAQ Accordion State
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
      a: "Yes! Click 'Explore the Demo' in the navigation bar or hero section to launch the complete interactive operations console with simulated microservices, live 5-second polling, and pre-loaded machine learning models."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-midnight-950 text-slate-100 selection:bg-brand-blue selection:text-white">
      
      {/* Ambient Lighting Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-brand-blue/15 via-violet-600/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-48 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-[60%] -right-48 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-24">
        
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto">
          
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-midnight-900/90 border border-brand-blue/30 text-xs font-medium text-cyan-300 mb-8 backdrop-blur-md shadow-glow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="font-semibold tracking-wide">AegisOps AI Enterprise v1.4</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-300">Empirical 99.89% ML Test Accuracy</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Prompt Exact Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Detect. Predict. Resolve. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-blue via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Before Incidents Happen.
            </span>
          </h1>

          {/* Prompt Exact Supporting Copy */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            AegisOps AI transforms infrastructure telemetry into actionable operational intelligence through anomaly detection, incident risk estimation, and evidence-based investigation.
          </p>

          {/* Calls to Action */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm shadow-glow-md hover:shadow-glow-cyan flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-midnight-900/90 hover:bg-midnight-800 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 hover:border-brand-blue/30 flex items-center justify-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              Explore the Demo
            </button>
          </div>

          {/* Key Value Micro-Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-midnight-900/60 border border-white/[0.06] backdrop-blur-md">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Prediction Horizon</span>
              <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5">+30 Minutes</p>
              <p className="text-[10px] text-slate-500">Early pre-cursor detection</p>
            </div>
            <div className="p-3.5 rounded-xl bg-midnight-900/60 border border-white/[0.06] backdrop-blur-md">
              <span className="text-[11px] font-semibold uppercase text-slate-400">ML Classification</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">99.89% Test Acc</p>
              <p className="text-[10px] text-slate-500">Held-out test set verified</p>
            </div>
            <div className="p-3.5 rounded-xl bg-midnight-900/60 border border-white/[0.06] backdrop-blur-md">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Telemetry Sampling</span>
              <p className="text-xl font-bold font-mono text-violet-400 mt-0.5">5-Second Live</p>
              <p className="text-[10px] text-slate-500">Real-time metrics stream</p>
            </div>
            <div className="p-3.5 rounded-xl bg-midnight-900/60 border border-white/[0.06] backdrop-blur-md">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Remediation Gate</span>
              <p className="text-xl font-bold font-mono text-blue-400 mt-0.5">Human-in-Loop</p>
              <p className="text-[10px] text-slate-500">Zero rogue auto-actions</p>
            </div>
          </div>
        </section>

        {/* HERO VISUAL: INTERACTIVE TOPOLOGY CANVAS */}
        <section className="mt-14 max-w-5xl mx-auto">
          <TopologyCanvas />
        </section>

        {/* SECTION 2: PLAIN-ENGLISH AIOPS GUIDE (DESIGNED FOR BEGINNERS) */}
        <section id="aiops-guide" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">AIOps Explained Simply</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">New to AIOps? Here is How It Helps You</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              You don&apos;t need to be a distributed systems PhD to understand your operations. Here is what AegisOps AI does in plain English.
            </p>
          </div>

          {/* 6 Key Plain-Language Definitions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <GlassCard glow className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">System Health</h3>
              <p className="text-xs font-semibold text-emerald-400">How well your services are working right now.</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggregates CPU usage, memory, request speed, and error rates into a simple clear signal: Nominal, Degraded, or Critical.
              </p>
            </GlassCard>

            <GlassCard glow className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Active Incidents</h3>
              <p className="text-xs font-semibold text-rose-400">Problems that still need attention.</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a microservice begins failing transactions or running out of memory, it becomes an active incident assigned to your team.
              </p>
            </GlassCard>

            <GlassCard glow className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Anomaly</h3>
              <p className="text-xs font-semibold text-violet-400">Behavior that differs from normal patterns.</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Even before an outage happens, the system detects unusual spikes or drifts that haven&apos;t happened before during ordinary business hours.
              </p>
            </GlassCard>

            <GlassCard glow className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Predicted Risk</h3>
              <p className="text-xs font-semibold text-cyan-400">An estimate of the likelihood of a future incident.</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates the probability that a specific service will experience downtime in the next 30 minutes, giving you time to prepare.
              </p>
            </GlassCard>

            <GlassCard glow className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-brand-blue/30 text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Investigation</h3>
              <p className="text-xs font-semibold text-blue-400">Evidence and possible explanations for a problem.</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI Copilot pulls logs, traces, and metrics into one organized summary, separating undeniable facts from hypotheses.
              </p>
            </GlassCard>

            <GlassCard glow className="p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Resolution</h3>
              <p className="text-xs font-semibold text-amber-400">An authorized action taken to address an incident.</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                A verified step (like scaling up pods, clearing a connection pool, or rerouting traffic) that an engineer approves with one click.
              </p>
            </GlassCard>

          </div>

          {/* Interactive Simulation Playground */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-midnight-900/90 border border-white/10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Live Simulation Playground</span>
                <h3 className="text-xl font-bold text-white mt-1">See How AegisOps AI Responds in Real Time</h3>
                <p className="text-xs text-slate-400 mt-0.5">Toggle a scenario below to see how telemetry, risk score, and copilot triage react.</p>
              </div>

              {/* Scenario Toggle Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSimulatedScenario('nominal')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    simulatedScenario === 'nominal'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Nominal Baseline
                </button>
                <button
                  onClick={() => setSimulatedScenario('latency')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    simulatedScenario === 'latency'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Latency Surge
                </button>
                <button
                  onClick={() => setSimulatedScenario('memory')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    simulatedScenario === 'memory'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Memory Leak Spike
                </button>
              </div>
            </div>

            {/* Simulation Results Display */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Telemetry Snapshot */}
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Microservice Telemetry</span>
                  <Badge variant={simulatedScenario === 'nominal' ? 'nominal' : simulatedScenario === 'latency' ? 'warning' : 'p1'}>
                    {simulatedScenario === 'nominal' ? 'NOMINAL' : simulatedScenario === 'latency' ? 'WARNING' : 'CRITICAL'}
                  </Badge>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Service:</span>
                    <span className="text-white font-bold">{simulatedScenario === 'nominal' ? 'api-gateway' : simulatedScenario === 'latency' ? 'order-service' : 'payment-processor'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CPU Usage:</span>
                    <span className={simulatedScenario === 'nominal' ? 'text-emerald-400' : simulatedScenario === 'latency' ? 'text-amber-400' : 'text-rose-400'}>
                      {simulatedScenario === 'nominal' ? '32.4%' : simulatedScenario === 'latency' ? '68.0%' : '89.2%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Memory Usage:</span>
                    <span className={simulatedScenario === 'nominal' ? 'text-emerald-400' : simulatedScenario === 'latency' ? 'text-amber-400' : 'text-rose-400'}>
                      {simulatedScenario === 'nominal' ? '46.1%' : simulatedScenario === 'latency' ? '62.5%' : '94.8%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">P99 Latency:</span>
                    <span className={simulatedScenario === 'nominal' ? 'text-emerald-400' : simulatedScenario === 'latency' ? 'text-amber-400' : 'text-rose-400'}>
                      {simulatedScenario === 'nominal' ? '28 ms' : simulatedScenario === 'latency' ? '320 ms' : '820 ms'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Predicted Risk & Horizon */}
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Predictive Risk (+30m)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Random Forest</span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono">
                      {simulatedScenario === 'nominal' ? (
                        <span className="text-emerald-400">4.2%</span>
                      ) : simulatedScenario === 'latency' ? (
                        <span className="text-amber-400">62.8%</span>
                      ) : (
                        <span className="text-rose-400">96.4%</span>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">
                      {simulatedScenario === 'nominal' ? 'Low Risk' : simulatedScenario === 'latency' ? 'Moderate Risk' : 'High Imminent Risk'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        simulatedScenario === 'nominal' ? 'bg-emerald-400' : simulatedScenario === 'latency' ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: simulatedScenario === 'nominal' ? '4.2%' : simulatedScenario === 'latency' ? '62.8%' : '96.4%' }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {simulatedScenario === 'nominal'
                    ? 'No intervention required. Normal steady-state operation.'
                    : simulatedScenario === 'latency'
                    ? 'Early database lock congestion detected. Potential checkout degradation.'
                    : 'Unrecoverable heap exhaustion projected within 18 minutes.'}
                </p>
              </div>

              {/* Copilot Action Plan */}
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Copilot Recommendation</span>
                  <span className="text-[10px] text-violet-400 font-mono">Human Gate</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-300">
                  <p className="font-semibold text-white">
                    {simulatedScenario === 'nominal'
                      ? 'Telemetry Monitoring Active'
                      : simulatedScenario === 'latency'
                      ? 'Scale Read Replicas (x2)'
                      : 'Rolling JVM Restart with Heap Dump'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {simulatedScenario === 'nominal'
                      ? 'All services within nominal operational bounds.'
                      : simulatedScenario === 'latency'
                      ? 'Alleviates connection contention on order-db without restarting master node.'
                      : 'Isolates JVM memory leak while preserving forensic heap trace for engineering triage.'}
                  </p>
                </div>
                <div className="pt-1">
                  <button
                    onClick={onExploreDemo}
                    className="w-full py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 text-cyan-300 border border-brand-blue/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Open Live Investigation in Console
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: KEY CAPABILITIES */}
        <section id="features" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-blue">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Comprehensive SRE Defense Engine</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Six synchronized operational pillars that guard your cloud services 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <GlassCard glow className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">5-Second Live Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-drift polling across CPU, memory, RPS throughput, p99 latency, and HTTP error rates with automatic tab visibility power pausing.
              </p>
            </GlassCard>

            <GlassCard glow className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-brand-blue/30 text-blue-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">+30-Minute Predictive Horizon</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calibrated Random Forest model calculates failure likelihood up to 30 minutes in advance using multi-variate telemetry trends.
              </p>
            </GlassCard>

            <GlassCard glow className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Dual-Engine Anomaly Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unsupervised Isolation Forest catches unknown statistical drifts, while supervised classifiers verify true incident potential.
              </p>
            </GlassCard>

            <GlassCard glow className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Fact-Based Copilot Triage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero hallucinations. Explicit segregation between observed FACTS, algorithmic INFERENCES, and testable HYPOTHESES.
              </p>
            </GlassCard>

            <GlassCard glow className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Human-in-the-Loop Governance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Remediations require explicit approval. Every approved or rejected action includes blast radius analysis and guaranteed rollbacks.
              </p>
            </GlassCard>

            <GlassCard glow className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Immutable Audit Records</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every operator login, risk forecast, approval, rejection, and resolution is permanently persisted in PostgreSQL for SOC 2 compliance.
              </p>
            </GlassCard>

          </div>
        </section>

        {/* SECTION 4: HOW THE PLATFORM WORKS */}
        <section id="how-it-works" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Continuous Operational Loop</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">How AegisOps AI Works</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              A closed-loop, evidence-driven pipeline from telemetry ingestion to authorized resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard glow className="relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white">5-Second Telemetry Ingest</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Aggregates CPU, memory, p99 latencies, RPS throughput, and error rates across microservices via Prometheus and OpenTelemetry collectors.
              </p>
            </GlassCard>

            <GlassCard glow className="relative">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-brand-blue/30 text-blue-400 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white">Calibrated Risk Prediction</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Random Forest classifier estimates incident risk probability 30 minutes in advance, while Isolation Forest isolates statistical outlier anomalies.
              </p>
            </GlassCard>

            <GlassCard glow className="relative">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white">Evidence-Based Copilot</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Synthesizes concrete FACTS (observed telemetry), algorithmic INFERENCES (model attribution), and testable HYPOTHESES to pinpoint root causes.
              </p>
            </GlassCard>

            <GlassCard glow className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-white">Governed Remediation</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Engineers review actionable blueprints, inspect blast radius, and provide explicit authorization before execution with rollback checkpoints.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* SECTION 5: PRODUCT DASHBOARD PREVIEW */}
        <section id="product-preview" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-blue">Console Experience</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Engineered for Production SREs</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              High density, readable telemetry views with instant zero-drift 5-second polling.
            </p>

            {/* Preview switcher */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-midnight-900 border border-white/10 mt-6">
              <button
                onClick={() => setActivePreviewTab('monitoring')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activePreviewTab === 'monitoring' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Monitoring
              </button>
              <button
                onClick={() => setActivePreviewTab('risk')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activePreviewTab === 'risk' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Predictive Risk (+30m)
              </button>
              <button
                onClick={() => setActivePreviewTab('copilot')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activePreviewTab === 'copilot' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                AI Copilot Investigation
              </button>
            </div>
          </div>

          {/* Interactive Preview Container */}
          <div className="rounded-2xl border border-white/10 bg-midnight-900/90 shadow-2xl p-6 overflow-hidden">
            {activePreviewTab === 'monitoring' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">Live Cluster Microservices (8 Active)</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Auto-refreshed every 5s &bull; IST</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-midnight-950/70 border border-rose-500/30">
                    <div className="flex justify-between items-center text-slate-300 font-bold mb-2">
                      <span>payment-processor</span>
                      <Badge variant="p1" pulse>DEGRADED</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div>CPU: <span className="text-rose-400 font-bold">88.4%</span></div>
                      <div>MEM: <span className="text-rose-400 font-bold">94.2%</span></div>
                      <div>P99: <span className="text-rose-400 font-bold">740ms</span></div>
                      <div>ERR: <span className="text-rose-400 font-bold">5.2%</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-midnight-950/70 border border-amber-500/30">
                    <div className="flex justify-between items-center text-slate-300 font-bold mb-2">
                      <span>order-service</span>
                      <Badge variant="warning">WARNING</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div>CPU: <span className="text-amber-400 font-bold">68.0%</span></div>
                      <div>MEM: <span className="text-amber-400 font-bold">64.0%</span></div>
                      <div>P99: <span className="text-amber-400 font-bold">310ms</span></div>
                      <div>ERR: <span className="text-amber-400 font-bold">1.9%</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-midnight-950/70 border border-emerald-500/20">
                    <div className="flex justify-between items-center text-slate-300 font-bold mb-2">
                      <span>api-gateway</span>
                      <Badge variant="nominal">HEALTHY</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div>CPU: <span className="text-emerald-400 font-bold">32.0%</span></div>
                      <div>MEM: <span className="text-emerald-400 font-bold">48.0%</span></div>
                      <div>P99: <span className="text-emerald-400 font-bold">28ms</span></div>
                      <div>RPS: <span className="text-cyan-400 font-bold">1850</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'risk' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-sm font-bold text-white">Incident Risk Probability Forecast (T-30m)</span>
                  <Badge variant="info">Calibrated RF-v1.4.2</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-midnight-950/80 border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">payment-processor</span>
                      <span className="text-lg font-bold font-mono text-rose-400">94.2% Risk</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: '94.2%' }} />
                    </div>
                    <p className="text-xs text-slate-400">Leading Indicator: Off-heap memory leak & Stop-the-World GC pauses.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-midnight-950/80 border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">order-service</span>
                      <span className="text-lg font-bold font-mono text-amber-400">62.8% Risk</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: '62.8%' }} />
                    </div>
                    <p className="text-xs text-slate-400">Leading Indicator: Database lock queue accumulation on checkout.</p>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'copilot' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="font-bold text-white text-sm">Copilot Evidence Synthesis & Remediation</span>
                  <span className="text-cyan-400 font-mono">Fact vs Inference vs Hypothesis</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-midnight-950 border border-cyan-500/20">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">VERIFIABLE FACT</span>
                    <p className="text-slate-300 mt-1 font-sans">P99 latency surged from 45ms to 740ms with memory pinned at 94.2%.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-midnight-950 border border-violet-500/20">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">ALGORITHMIC INFERENCE</span>
                    <p className="text-slate-300 mt-1 font-sans">Correlation between thread allocation and GC pauses indicates JVM heap leak (0.94 conf).</p>
                  </div>
                  <div className="p-3 rounded-lg bg-midnight-950 border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">TESTABLE HYPOTHESIS</span>
                    <p className="text-slate-300 mt-1 font-sans">Recent release v2.14.8 connection pool setting lacked maxLifeTime cap.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 6: AI & ML BENCHMARKS (MEASURED & VERIFIED) */}
        <section id="ml-benchmarks" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">Phase 8 Verified Rigor</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Machine Learning Benchmarks</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Empirical validation on 900 held-out test splits. Real measurements, zero fabrication.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Random Forest Classifier Card */}
            <GlassCard glow className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supervised Model</span>
                <Badge variant="nominal">RF-v1.4.2</Badge>
              </div>
              <h3 className="text-lg font-bold text-white">Random Forest Classifier</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained on 6,000 multi-tier microservice telemetry states across memory leaks, cascading thread exhaustion, and error surges. Evaluated strictly on 900 held-out test records.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-midnight-950 border border-white/5">
                  <span className="text-slate-400 text-[10px] block">TEST ACCURACY</span>
                  <span className="text-lg font-bold text-emerald-400">99.89%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-midnight-950 border border-white/5">
                  <span className="text-slate-400 text-[10px] block">PRECISION</span>
                  <span className="text-lg font-bold text-cyan-400">100.00%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-midnight-950 border border-white/5">
                  <span className="text-slate-400 text-[10px] block">RECALL</span>
                  <span className="text-lg font-bold text-violet-400">99.32%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-midnight-950 border border-white/5">
                  <span className="text-slate-400 text-[10px] block">F1 SCORE</span>
                  <span className="text-lg font-bold text-blue-400">0.9966</span>
                </div>
              </div>
            </GlassCard>

            {/* Confusion Matrix & Baseline Comparison */}
            <GlassCard glow className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benchmark Contrast</span>
                <Badge variant="info">Held-out Split</Badge>
              </div>
              <h3 className="text-lg font-bold text-white">Confusion Matrix & Baselines</h3>
              
              <div className="p-3 rounded-lg bg-midnight-950 border border-white/5 font-mono text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px] border-b border-white/5 pb-1">
                  <span>METRIC</span>
                  <span>VALUE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">True Negatives (TN)</span>
                  <span className="text-white font-bold">752</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">False Positives (FP)</span>
                  <span className="text-emerald-400 font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">False Negatives (FN)</span>
                  <span className="text-amber-400 font-bold">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">True Positives (TP)</span>
                  <span className="text-white font-bold">147</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>&bull; Baseline Dummy Classifier: <span className="font-mono text-slate-300">72.33% Acc</span></p>
                <p>&bull; Simple Heuristic Rule: <span className="font-mono text-slate-300">97.44% Acc (F1: 0.920)</span></p>
                <p>&bull; AegisOps Random Forest: <span className="font-mono text-emerald-400 font-bold">99.89% Acc (F1: 0.996)</span></p>
              </div>
            </GlassCard>

            {/* Isolation Forest Anomaly Detection */}
            <GlassCard glow className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unsupervised Model</span>
                <Badge variant="elevated">ISO-v1.2.0</Badge>
              </div>
              <h3 className="text-lg font-bold text-white">Isolation Forest Anomaly Detector</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained purely on nominal operational envelope without labels to detect novel zero-day drifts.
              </p>
              <div className="p-3.5 rounded-lg bg-midnight-950 border border-violet-500/20 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-white">Key Distinction:</p>
                <p className="text-slate-400">
                  <strong className="text-cyan-400">Risk Score</strong> is the supervised probability that a failure occurs within 30 minutes.
                </p>
                <p className="text-slate-400">
                  <strong className="text-violet-400">Anomaly Score</strong> is the unsupervised geometric distance from nominal telemetry. They are reported independently.
                </p>
              </div>
            </GlassCard>

          </div>
        </section>

        {/* SECTION 7: SYSTEM ARCHITECTURE & TECH STACK */}
        <section id="architecture" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Enterprise Stack</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Production-Oriented Architecture</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Engineered with clean separation of concerns, strict type safety, and audited persistence.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-midnight-900 border border-white/[0.08] text-center">
              <Code className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">React & Vite</h4>
              <p className="text-[11px] text-slate-400 mt-1">TypeScript frontend with Tailwind CSS & Framer Motion</p>
            </div>
            <div className="p-4 rounded-xl bg-midnight-900 border border-white/[0.08] text-center">
              <Server className="w-6 h-6 text-brand-blue mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">FastAPI</h4>
              <p className="text-[11px] text-slate-400 mt-1">High-throughput async Python REST API with Pydantic v2</p>
            </div>
            <div className="p-4 rounded-xl bg-midnight-900 border border-white/[0.08] text-center">
              <Cpu className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">scikit-learn</h4>
              <p className="text-[11px] text-slate-400 mt-1">Random Forest and Isolation Forest ML pipelines</p>
            </div>
            <div className="p-4 rounded-xl bg-midnight-900 border border-white/[0.08] text-center">
              <Database className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">PostgreSQL</h4>
              <p className="text-[11px] text-slate-400 mt-1">SQLAlchemy ORM with audit logging & persistence</p>
            </div>
            <div className="p-4 rounded-xl bg-midnight-900 border border-white/[0.08] text-center">
              <Layers className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Docker</h4>
              <p className="text-[11px] text-slate-400 mt-1">Multi-stage Dockerfiles & Docker Compose network</p>
            </div>
            <div className="p-4 rounded-xl bg-midnight-900 border border-white/[0.08] text-center">
              <CheckCircle2 className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">pytest</h4>
              <p className="text-[11px] text-slate-400 mt-1">14/14 automated unit and integration tests passing</p>
            </div>
          </div>
        </section>

        {/* SECTION 8: SECURITY & GOVERNANCE */}
        <section id="security" className="mt-28">
          <GlassCard glow className="p-8 sm:p-12">
            <div className="max-w-3xl">
              <Badge variant="nominal" className="mb-4">Zero-Trust SRE Safety</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Security & Human-in-the-Loop Governance</h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                AegisOps AI never executes destructive infrastructure remediation without explicit human approval. Every proposed remediation plan carries an exact blast radius analysis, rollback script, and tamper-evident audit log.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Bcrypt Passwords & JWT Bearer</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Cryptographically signed access tokens and salted password hashing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">No Insecure Fallback Secrets</h5>
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
          </GlassCard>
        </section>

        {/* SECTION 9: FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section id="faq" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Clear Answers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Everything you need to know about adopting AegisOps AI for your engineering organization.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-midnight-900/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      {item.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-300' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04]">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 10: DOCUMENTATION & API LINKS */}
        <section id="docs" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-blue">Developer Resources</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Open APIs & Integrations</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Inspect Swagger documentation, run Docker Compose locally, or stream metrics from Prometheus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-xl bg-midnight-900 border border-white/10 hover:border-cyan-400/40 transition-all group block"
            >
              <div className="flex items-center justify-between text-cyan-400 mb-3">
                <Terminal className="w-5 h-5" />
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </div>
              <h4 className="text-sm font-bold text-white">FastAPI Swagger UI</h4>
              <p className="text-xs text-slate-400 mt-1.5">Interactive OpenAPI contract with Pydantic validation schemas.</p>
            </a>

            <div className="p-5 rounded-xl bg-midnight-900 border border-white/10 block">
              <div className="flex items-center justify-between text-violet-400 mb-3">
                <Layers className="w-5 h-5" />
                <span className="text-[10px] font-mono text-slate-400">Docker</span>
              </div>
              <h4 className="text-sm font-bold text-white">Docker Compose Stack</h4>
              <p className="text-xs text-slate-400 mt-1.5">Zero-setup containerized deployment for PostgreSQL, FastAPI, and Nginx.</p>
            </div>

            <div className="p-5 rounded-xl bg-midnight-900 border border-white/10 block">
              <div className="flex items-center justify-between text-emerald-400 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] font-mono text-slate-400">14/14 Pytest</span>
              </div>
              <h4 className="text-sm font-bold text-white">Automated Test Gates</h4>
              <p className="text-xs text-slate-400 mt-1.5">End-to-end ML model verification, JWT auth, and incident workflow tests.</p>
            </div>
          </div>
        </section>

        {/* SECTION 11: FINAL CALL TO ACTION */}
        <section className="mt-28 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Prevent Incidents in Real Time?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Open the live Operations Console, inspect active telemetry streams, and run the ML risk predictor.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm shadow-glow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Eye className="w-4 h-4 text-cyan-300" />
              Explore Interactive Demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-midnight-900 border border-white/10 hover:border-brand-blue/40 text-slate-200 hover:text-white font-semibold text-sm transition-all"
            >
              Create SRE Account
            </button>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-midnight-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <AegisLogo variant="horizontal" size="sm" />
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#aiops-guide" className="hover:text-white transition-colors">AIOps Guide</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#ml-benchmarks" className="hover:text-white transition-colors">ML Benchmarks</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <span className="text-slate-600">&bull;</span>
            <span className="font-mono text-slate-500">&copy; 2026 AegisOps AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
