import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Database, 
  Cpu, 
  Brain, 
  Compass, 
  BarChart3, 
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  candidateCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  candidateCount,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Analytics & Real-time KPIs'
    },
    {
      id: 'datasets',
      label: 'Datasets',
      icon: Database,
      description: 'SWaT & Synthetic Generator'
    },
    {
      id: 'models',
      label: 'Model Lab',
      icon: Cpu,
      description: 'Train & Configure Algorithms'
    },
    {
      id: 'memory',
      label: 'Tri-Memory',
      icon: Brain,
      description: 'STM, LTM & CM Systems'
    },
    {
      id: 'discoveries',
      label: 'Discoveries',
      icon: Compass,
      description: 'Unknown Operational States',
      badge: candidateCount > 0 ? candidateCount : undefined
    },
    {
      id: 'evaluation',
      label: 'Evaluation',
      icon: BarChart3,
      description: 'Comparative Benchmarks'
    }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-trio-secondary/95 lg:bg-trio-secondary/60 backdrop-blur-xl border-r border-trio-border flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-trio-border">
            <span className="text-xs font-bold uppercase text-trio-muted">Navigation Menu</span>
            <button onClick={onCloseMobile} className="p-1 rounded text-trio-muted hover:text-trio-text">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Category Label */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-trio-muted flex items-center justify-between">
              <span>Industrial Telemetry</span>
              <span className="text-[10px] text-trio-cyan font-mono">v3.0 ENTERPRISE</span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative active:scale-[0.98] ${
                      isActive
                        ? 'liquid-glass-pill text-trio-text border-orange-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_-8px_rgba(249,115,22,0.3)]'
                        : 'text-trio-muted hover:text-trio-text hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-trio-cyan/20 text-trio-cyan shadow-[0_0_12px_rgba(249,115,22,0.28)]' 
                          : 'bg-stone-800/70 text-trio-muted group-hover:text-trio-cyan'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold leading-tight">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-trio-muted truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold font-mono tabular-nums rounded-full bg-trio-amber/20 text-trio-amber border border-trio-amber/30">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bar"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute right-0 w-1 h-6 bg-trio-cyan rounded-l-full shadow-[0_0_10px_#F97316]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Research Context Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-trio-card/90 to-stone-900/70 border border-trio-border shadow-inner-specular">
            <div className="flex items-center gap-2 text-xs font-semibold text-trio-cyan mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unsupervised Tri-Memory</span>
            </div>
            <p className="text-[11px] text-trio-muted leading-relaxed">
              Eliminates static anomaly thresholds. Discovers multi-sensor operational regimes via Contradiction Guidance:
            </p>
            <div className="mt-2 px-2.5 py-1 rounded-lg bg-stone-950/80 border border-stone-800/90 text-[11px] font-mono text-amber-300 text-center tracking-wide">
              C = &alpha;&middot;D + &beta;&middot;T + &gamma;&middot;A
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-trio-border/60 bg-trio-bg/40">
          <div className="flex items-center justify-between text-[11px] text-trio-muted">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-trio-green" />
              <span>Leakage-Free Split</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">MetroPT-3 &bull; SWaT</span>
          </div>
        </div>
      </aside>
    </>
  );
};
