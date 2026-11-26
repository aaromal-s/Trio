import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Database,
  Cpu,
  Brain,
  Compass,
  BarChart3,
  FileDown,
  BookOpen,
  Settings,
  RefreshCw,
  Home,
  X,
  CornerDownLeft
} from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  subtitle: string;
  category: 'Navigation' | 'Actions';
  icon: React.ComponentType<{ className?: string }>;
  onExecute: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onExportReport: () => void;
  onRefreshData: () => void;
  onOpenSettings: () => void;
  onOpenViva: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onExportReport,
  onRefreshData,
  onOpenSettings,
  onOpenViva,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    {
      id: 'nav-overview',
      label: 'Overview Dashboard',
      subtitle: 'Live KPIs, Anomaly Replay & Contradiction Stream',
      category: 'Navigation',
      icon: LayoutDashboard,
      onExecute: () => onNavigate('overview'),
    },
    {
      id: 'nav-discoveries',
      label: 'Discoveries & Root-Cause Attribution',
      subtitle: 'Inspect unknown operational state candidates',
      category: 'Navigation',
      icon: Compass,
      onExecute: () => onNavigate('discoveries'),
    },
    {
      id: 'nav-memory',
      label: 'Tri-Memory Inspector',
      subtitle: 'Short-Term, Long-Term & Contradiction Memory pools',
      category: 'Navigation',
      icon: Brain,
      onExecute: () => onNavigate('memory'),
    },
    {
      id: 'nav-models',
      label: 'Model Lab',
      subtitle: 'Tune \u03B1, \u03B2, \u03B3 weights & retrain engine',
      category: 'Navigation',
      icon: Cpu,
      onExecute: () => onNavigate('models'),
    },
    {
      id: 'nav-datasets',
      label: 'Datasets & CSV Ingestion',
      subtitle: 'MetroPT-3, Hydraulic Rig, SWaT & custom uploads',
      category: 'Navigation',
      icon: Database,
      onExecute: () => onNavigate('datasets'),
    },
    {
      id: 'nav-evaluation',
      label: 'Evaluation Benchmarks',
      subtitle: 'Compare TRIO vs K-Means, DBSCAN & Isolation Forest',
      category: 'Navigation',
      icon: BarChart3,
      onExecute: () => onNavigate('evaluation'),
    },
    {
      id: 'nav-landing',
      label: 'Platform Overview (Landing)',
      subtitle: 'Interactive SCADA oscilloscope & methodology',
      category: 'Navigation',
      icon: Home,
      onExecute: () => onNavigate('landing'),
    },
    {
      id: 'act-export',
      label: 'Export Incident & Shift Handover Report',
      subtitle: 'Download Markdown summary of KPIs & discovered candidates',
      category: 'Actions',
      icon: FileDown,
      onExecute: onExportReport,
    },
    {
      id: 'act-refresh',
      label: 'Refresh Telemetry Stream Now',
      subtitle: 'Fetch latest SCADA state from backend API',
      category: 'Actions',
      icon: RefreshCw,
      onExecute: onRefreshData,
    },
    {
      id: 'act-viva',
      label: 'Open Architecture & Mathematical Specs',
      subtitle: 'View formal Tri-Memory equations & zero-leakage split',
      category: 'Actions',
      icon: BookOpen,
      onExecute: onOpenViva,
    },
    {
      id: 'act-settings',
      label: 'Open Platform Settings',
      subtitle: 'Configure polling cadence, density & diagnostics',
      category: 'Actions',
      icon: Settings,
      onExecute: onOpenSettings,
    },
  ], [onNavigate, onExportReport, onRefreshData, onOpenViva, onOpenSettings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].onExecute();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, activeIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl liquid-glass-nav overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-4 h-4 text-orange-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Jump to view, export report, or run action..."
            className="w-full bg-transparent text-sm text-white placeholder:text-stone-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    item.onExecute();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-orange-500/15 border border-orange-500/40 text-white'
                      : 'border border-transparent text-stone-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-stone-800/80 text-stone-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate">{item.label}</div>
                      <div className="text-[10px] text-stone-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-stone-900/80 text-stone-400 border border-stone-800">
                      {item.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-orange-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-white/10 bg-stone-950/60 flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span>Navigate with &uarr; &darr; &bull; Execute with Enter</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
