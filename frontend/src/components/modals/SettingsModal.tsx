import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Server, 
  RefreshCw, 
  Check, 
  Sun, 
  Moon, 
  Laptop, 
  Activity, 
  CheckCircle2, 
  Globe,
  Bell,
  Cpu
} from 'lucide-react';
import { api } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
  currentTheme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  refreshInterval?: number;
  onRefreshIntervalChange?: (seconds: number) => void;
  isPollingPaused?: boolean;
  onTogglePollingPaused?: (paused: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  refreshInterval = 5,
  onRefreshIntervalChange,
  isPollingPaused: propPollingPaused
}) => {
  const [activeSection, setActiveSection] = useState<'appearance' | 'telemetry' | 'backend' | 'regional'>('appearance');

  // Appearance
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('trio_theme_mode') as any) || currentTheme;
  });

  const [dashboardDensity, setDashboardDensity] = useState<'comfortable' | 'compact'>(() => {
    return (localStorage.getItem('trio_density') as any) || 'comfortable';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('trio_notifs') !== 'false';
  });

  // Telemetry
  const [pollingRate, setPollingRate] = useState<number>(() => {
    const saved = localStorage.getItem('trio_polling_interval');
    return saved ? parseInt(saved, 10) : refreshInterval;
  });
  const [isPollingPaused, setIsPollingPaused] = useState<boolean>(() => {
    if (propPollingPaused !== undefined) return propPollingPaused;
    return localStorage.getItem('trio_polling_paused') === 'true';
  });

  useEffect(() => {
    if (refreshInterval) {
      setPollingRate(refreshInterval);
    }
  }, [refreshInterval]);

  useEffect(() => {
    if (propPollingPaused !== undefined) {
      setIsPollingPaused(propPollingPaused);
    }
  }, [propPollingPaused]);

  // Backend diagnostics
  const [testResult, setTestResult] = useState<{ testing: boolean; ok?: boolean; latency?: number; message?: string } | null>(null);

  // Regional
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(() => {
    return (localStorage.getItem('trio_time_format') as any) || '24h';
  });
  const [timeZone, setTimeZone] = useState<string>(() => {
    return localStorage.getItem('trio_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  });

  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      onThemeChange(prefersDark ? 'dark' : 'light');
    } else {
      onThemeChange(themeMode);
    }
  }, [themeMode, onThemeChange]);

  if (!isOpen) return null;

  const handleSaveAll = () => {
    localStorage.setItem('trio_theme_mode', themeMode);
    localStorage.setItem('trio_density', dashboardDensity);
    localStorage.setItem('trio_notifs', String(notificationsEnabled));
    localStorage.setItem('trio_polling_paused', String(isPollingPaused));
    localStorage.setItem('trio_time_format', timeFormat);
    localStorage.setItem('trio_timezone', timeZone);

    if (onRefreshIntervalChange) {
      onRefreshIntervalChange(isPollingPaused ? 0 : pollingRate);
    }

    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 500);
  };

  const handleTestConnection = async () => {
    setTestResult({ testing: true });
    const res = await api.testConnection();
    setTestResult({
      testing: false,
      ok: res.ok,
      latency: res.latencyMs,
      message: res.ok ? `Connected to ${res.service} (${res.status})` : `Failed: ${res.status}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-trio-card border border-trio-border rounded-2xl shadow-2xl relative text-left overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-trio-border flex items-center justify-between bg-trio-secondary/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Platform Settings &amp; Preferences</h3>
              <p className="text-[11px] text-trio-muted">Enterprise configuration, telemetry cadence, and diagnostics</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-trio-muted hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-trio-border flex gap-6 bg-trio-bg/50">
          {[
            { id: 'appearance', label: 'Appearance', icon: Sun },
            { id: 'telemetry', label: 'Telemetry Stream', icon: Activity },
            { id: 'backend', label: 'Backend API', icon: Server },
            { id: 'regional', label: 'Regional', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-trio-muted hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {savedToast && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Settings successfully saved.</span>
            </div>
          )}

          {/* 1. APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">Theme Mode</label>
                <p className="text-[11px] text-trio-muted mb-3">Select your visual interface experience</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Dark Slate', icon: Moon, desc: 'High-contrast industrial' },
                    { id: 'light', label: 'Enterprise Light', icon: Sun, desc: 'Daylight clean view' },
                    { id: 'system', label: 'System Default', icon: Laptop, desc: 'Syncs with OS' },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = themeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setThemeMode(mode.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                            : 'bg-slate-900/40 border-slate-800 text-trio-muted hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <div className="text-xs font-bold text-white">{mode.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-trio-border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Dashboard Layout Density</div>
                    <div className="text-[11px] text-trio-muted">Adjust table row spacing and card compactness</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDashboardDensity('comfortable')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        dashboardDensity === 'comfortable' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      Comfortable
                    </button>
                    <button
                      type="button"
                      onClick={() => setDashboardDensity('compact')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        dashboardDensity === 'compact' ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      Compact
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Discovery Toast Alerts</div>
                    <div className="text-[11px] text-trio-muted">Display floating status badges for novel operational regimes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 w-4 h-4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. TELEMETRY STREAM */}
          {activeSection === 'telemetry' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">SCADA Ingestion Polling Interval</label>
                <p className="text-[11px] text-trio-muted mb-3">Rate at which live sensor observations are fetched from the backend</p>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { sec: 2, label: '2 Seconds', desc: 'Real-time High Frequency' },
                    { sec: 5, label: '5 Seconds', desc: 'Balanced (Standard)' },
                    { sec: 10, label: '10 Seconds', desc: 'Low Network Traffic' },
                    { sec: 30, label: '30 Seconds', desc: 'Periodic Audit' },
                  ].map((rate) => (
                    <button
                      key={rate.sec}
                      type="button"
                      onClick={() => {
                        setPollingRate(rate.sec);
                        setIsPollingPaused(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        !isPollingPaused && pollingRate === rate.sec
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-trio-muted hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{rate.label}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{rate.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-trio-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Stream Pause Control</div>
                  <div className="text-[11px] text-trio-muted">Temporarily suspend automatic background polling without disconnecting</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPollingPaused(!isPollingPaused)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isPollingPaused
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {isPollingPaused ? 'Stream Paused' : 'Stream Active'}
                </button>
              </div>
            </div>
          )}

          {/* 3. BACKEND DIAGNOSTICS */}
          {activeSection === 'backend' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold text-white block">FastAPI Backend Health</span>
                    <span className="text-[11px] text-trio-muted font-mono">http://127.0.0.1:8000/api/health</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testResult?.testing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testResult?.testing ? 'animate-spin' : ''}`} />
                    <span>{testResult?.testing ? 'Testing...' : 'Ping Server'}</span>
                  </button>
                </div>

                {testResult && !testResult.testing && (
                  <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                    testResult.ok ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}>
                    <span>{testResult.message}</span>
                    {testResult.latency !== undefined && (
                      <span className="font-bold">{testResult.latency} ms</span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="text-trio-muted mb-1 font-mono uppercase text-[10px]">Database Adapter</div>
                  <div className="text-white font-semibold">SQLite / PostgreSQL Dual Engine</div>
                  <div className="text-[10px] text-slate-500 mt-1">Automatic schema migrations enabled</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="text-trio-muted mb-1 font-mono uppercase text-[10px]">Rate Limiter</div>
                  <div className="text-white font-semibold">Sliding-Window Token Bucket</div>
                  <div className="text-[10px] text-slate-500 mt-1">DDoS &amp; brute-force protection active</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. REGIONAL */}
          {activeSection === 'regional' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">Time Display Format</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('24h')}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                      timeFormat === '24h' ? 'bg-cyan-950/40 border-cyan-500/60 text-white' : 'bg-slate-900/40 border-slate-800 text-trio-muted'
                    }`}
                  >
                    <div className="text-xs font-bold">24-Hour (18:30:00)</div>
                    <div className="text-[10px] text-slate-500">Standard for SCADA &amp; telemetry logs</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12h')}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                      timeFormat === '12h' ? 'bg-cyan-950/40 border-cyan-500/60 text-white' : 'bg-slate-900/40 border-slate-800 text-trio-muted'
                    }`}
                  >
                    <div className="text-xs font-bold">12-Hour (06:30:00 PM)</div>
                    <div className="text-[10px] text-slate-500">Standard civil time format</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Configured Timezone</label>
                <input
                  type="text"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-trio-border bg-trio-secondary/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-trio-muted hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-trio-cyan hover:bg-cyan-300 text-black font-semibold text-xs transition-all shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;