import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Cpu, 
  Brain, 
  Compass, 
  BarChart3, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  candidateCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  candidateCount
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

  return (
    <aside className="w-64 bg-trio-secondary/60 backdrop-blur-xl border-r border-trio-border flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6">
        {/* Navigation Category Label */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-trio-muted flex items-center justify-between">
            <span>Discovery Platform</span>
            <span className="text-[10px] text-trio-cyan font-mono">v1.0</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative ${
                    isActive
                      ? 'bg-trio-card text-trio-text shadow-glow-cyan/20 border border-trio-cyan/30'
                      : 'text-trio-muted hover:text-white hover:bg-trio-card/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-trio-cyan/20 text-trio-cyan' 
                        : 'bg-slate-800/60 text-trio-muted group-hover:text-trio-cyan'
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
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-trio-amber/20 text-trio-amber border border-trio-amber/30">
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute right-0 w-1 h-6 bg-trio-cyan rounded-l-full shadow-[0_0_8px_#22D3EE]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Research Context Box */}
        <div className="p-3 rounded-xl bg-trio-card/80 border border-trio-border/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-trio-cyan mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unsupervised Tri-Memory</span>
          </div>
          <p className="text-[11px] text-trio-muted leading-relaxed">
            Eliminates static anomaly thresholds. Discovers multi-sensor operational regimes via Contradiction Guidance ($C = \alpha D + \beta T + \gamma A$).
          </p>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-trio-border/60 bg-trio-bg/40">
        <div className="flex items-center justify-between text-[11px] text-trio-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-trio-green" />
            <span>Leakage-Free Split</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">SWaT Stage 1-6</span>
        </div>
      </div>
    </aside>
  );
};

