import React, { useState } from 'react';
import {
  X, ChevronRight, ChevronLeft, Activity, Clock, ShieldAlert,
  Sparkles, GitBranch, BarChart3, Settings, CheckCircle2, Zap
} from 'lucide-react';
import { AegisLogo } from './AegisLogo';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to AegisOps AI Operations Console",
      tab: "overview",
      icon: <Activity className="w-6 h-6 text-cyan-400" />,
      tagline: "High-level cluster health at a glance",
      description: "The Overview tab aggregates your overall cluster health, active incidents, high-risk services, and 5-second telemetry streams. The live clock in the top bar uses browser system time in IST.",
      highlight: "Watch the green/amber health badge at the top left to see your cluster's current state."
    },
    {
      title: "5-Second Live Telemetry Stream",
      tab: "monitoring",
      icon: <Clock className="w-6 h-6 text-brand-blue" />,
      tagline: "Real-time metrics with zero-drift polling",
      description: "Inspect CPU utilization, heap memory usage, p99 API latencies, and request throughput across all active microservices. Polling automatically pauses when your browser tab is in the background.",
      highlight: "Use the Refresh Now, Pause, and Resume buttons in the header to control your polling stream."
    },
    {
      title: "+30-Minute Predictive Risk Engine",
      tab: "risk",
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      tagline: "Early warning before incidents breach thresholds",
      description: "Powered by a calibrated Random Forest model (99.89% verified test accuracy), this tab calculates incident risk 30 minutes in advance using multi-variate telemetry trends.",
      highlight: "Try the 'What-If Incident Stress Tester' at the bottom of the Predictive Risk tab to simulate custom telemetry spikes!"
    },
    {
      title: "Incident Workbench & Lifecycles",
      tab: "incidents",
      icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
      tagline: "Search, filter, and track incidents across their lifecycle",
      description: "Sort by severity (P1 to P4), filter by status (Investigating, Mitigating, Resolved), and review time-aligned telemetry. Authenticated engineers can approve or reject proposed remediation blueprints.",
      highlight: "Every approved or rejected action generates an immutable cryptographic audit record."
    },
    {
      title: "AI Investigation Copilot",
      tab: "copilot",
      icon: <Sparkles className="w-6 h-6 text-violet-400" />,
      tagline: "Evidence synthesis with zero hallucinations",
      description: "The Copilot breaks down any incident into three strict categories: FACTS (direct telemetry readings), INFERENCES (statistically attributed models), and HYPOTHESES (unproven diagnostic tests).",
      highlight: "Click 'Run Copilot Investigation' on any degraded service to see real-time root-cause analysis."
    },
    {
      title: "Service Dependency Topology",
      tab: "infrastructure",
      icon: <GitBranch className="w-6 h-6 text-emerald-400" />,
      tagline: "Interactive microservice relationship mapping",
      description: "Visualize dependency cascades from api-gateway through payment-processor and database nodes. Degraded services are highlighted in glowing amber or red to instantly reveal blast radius.",
      highlight: "Click any node in the topology canvas to inspect its direct dependencies and latency health."
    },
    {
      title: "Historical Analytics & ML Matrix",
      tab: "analytics",
      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
      tagline: "Incident frequency, MTTR trends, and empirical metrics",
      description: "Review MTTR trends, export incident reports in JSON or CSV, and inspect the empirical confusion matrix from our 900 held-out test evaluations.",
      highlight: "Click 'Export JSON Report' to generate compliance audits for your engineering leadership."
    },
    {
      title: "Operator Account & Security",
      tab: "settings",
      icon: <Settings className="w-6 h-6 text-slate-300" />,
      tagline: "Profile persistence, bcrypt passwords, and RBAC",
      description: "Update your engineer profile, change your password securely, and configure notification preferences. In demo mode, sign in with lead@aegisops.ai / AegisOps@2026 to unlock lead permissions.",
      highlight: "You are ready to explore! Click 'Finish Tour' to begin operating the console."
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onNavigateTab) onNavigateTab(steps[nextStep].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onNavigateTab) onNavigateTab(steps[prevStep].tab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="relative w-full max-w-xl rounded-2xl bg-midnight-950 border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 z-10 space-y-6"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <AegisLogo variant="icon" size="sm" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Interactive Guided Tour &bull; Step {currentStep + 1} of {steps.length}
              </span>
              <h3 id="tour-title" className="text-lg font-bold text-white mt-0.5">{current.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-midnight-900 border border-white/[0.06]">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 shrink-0">
              {current.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{current.tagline}</h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{current.description}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-xs text-cyan-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed"><strong className="text-white">Pro Tip:</strong> {current.highlight}</p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                if (onNavigateTab) onNavigateTab(steps[idx].tab);
              }}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-lg border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-glow-sm flex items-center gap-1 transition-all"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Finish Tour
                  <CheckCircle2 className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next Module
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
