import React, { useState, useEffect } from 'react';
import { TrioLogo } from '../brand/TrioLogo';
import { 
  Clock, 
  RefreshCw, 
  Play, 
  Pause, 
  Database, 
  Cpu, 
  Bell, 
  User, 
  Settings, 
  BookOpen, 
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  datasetName: string;
  isSimulated: boolean;
  modelTrained: boolean;
  modelVersion: string;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  lastUpdated: number;
  onManualRefresh: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenViva: () => void;
  onLogout: () => void;
  userEmail: string;
  currentTheme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  refreshInterval?: number;
  isFetching?: boolean;
  fetchError?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  datasetName,
  isSimulated,
  modelTrained,
  modelVersion,
  autoRefresh,
  onToggleAutoRefresh,
  lastUpdated,
  onManualRefresh,
  onOpenSettings,
  onOpenProfile,
  onOpenViva,
  onLogout,
  userEmail,
  currentTheme,
  onToggleTheme,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  refreshInterval = 5,
  isFetching = false,
  fetchError = null
}) => {
  // Digital Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Digital clock update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastUpdated * 1000) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-trio-secondary/90 backdrop-blur-md border-b border-trio-border px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-trio-muted hover:text-trio-text hover:bg-trio-card"
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <button 
          onClick={() => onNavigate('landing')}
          className="hover:opacity-90 transition-opacity focus:outline-none"
          title="Back to Landing Page"
        >
          <TrioLogo size="sm" subtitle="Tri-Memory Platform" />
        </button>

        {/* Dataset Status Tag */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-trio-border">
          <Database className="w-3.5 h-3.5 text-trio-muted" />
          <span className="text-xs text-trio-muted max-w-[150px] truncate" title={datasetName}>
            {datasetName}
          </span>
          {isSimulated ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-trio-amber border border-trio-amber/30">
              Demo Synthetic
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-trio-green border border-trio-green/30">
              Live CSV
            </span>
          )}
        </div>

        {/* Model Status Tag */}
        <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-trio-border">
          <Cpu className="w-3.5 h-3.5 text-trio-cyan" />
          <span className="text-xs text-trio-muted font-mono">
            {modelTrained ? modelVersion : 'Model Idle'}
          </span>
          <span className={`w-2 h-2 rounded-full ${modelTrained ? 'bg-trio-green animate-pulse' : 'bg-slate-500'}`} />
        </div>
      </div>

      {/* Right Controls: Digital Clock, Refresh, Theme Toggle, Viva Guide, User Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Digital Clock */}
        <div className="hidden sm:flex flex-col items-end pr-3 border-r border-trio-border">
          <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs font-semibold text-trio-text">
            <Clock className="w-3.5 h-3.5 text-trio-cyan" />
            <span>{formattedTime}</span>
          </div>
          <span className="text-[10px] text-trio-muted tracking-tight">{formattedDate}</span>
        </div>

        {/* Auto Refresh & Pause/Resume Control */}
        <div className="flex items-center gap-1.5 bg-trio-card px-2.5 py-1.5 rounded-lg border border-trio-border">
          <button
            onClick={onToggleAutoRefresh}
            className={`p-1 rounded text-xs transition-colors flex items-center gap-1 font-medium ${
              autoRefresh 
                ? 'text-trio-cyan hover:bg-cyan-950/40' 
                : 'text-trio-muted hover:bg-slate-800'
            }`}
            title={autoRefresh ? `Pause ${refreshInterval}s Auto-Refresh` : `Resume ${refreshInterval}s Auto-Refresh`}
          >
            {autoRefresh ? (
              <>
                <Pause className="w-3 h-3 text-trio-cyan" />
                <span className="hidden md:inline text-[11px] font-mono">{refreshInterval}s Active</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-trio-amber" />
                <span className="hidden md:inline text-[11px] font-mono text-trio-amber">Paused</span>
              </>
            )}
          </button>

          <button
            onClick={onManualRefresh}
            disabled={isFetching}
            className="p-1 text-trio-muted hover:text-trio-text hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-trio-cyan' : ''}`} />
          </button>

          <span className="hidden lg:inline text-[10px] text-trio-muted font-mono pl-1 border-l border-trio-border/60">
            {isFetching ? 'Updating...' : `${secondsAgo}s ago`}
          </span>

          {fetchError && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1" title={fetchError} />
          )}
        </div>

        {/* Light / Dark Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-trio-muted hover:text-trio-text hover:bg-trio-card rounded-lg transition-colors border border-trio-border"
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-trio-amber" />
          ) : (
            <Moon className="w-4 h-4 text-trio-purple" />
          )}
        </button>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative p-2 text-trio-muted hover:text-trio-text hover:bg-trio-card rounded-lg transition-colors border border-transparent hover:border-trio-border"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-trio-cyan animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-trio-cyan" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-trio-card border border-trio-border rounded-xl shadow-2xl p-4 z-50 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-trio-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-trio-text">
                  Discovery Alerts
                </span>
                <span className="text-[10px] text-trio-cyan font-mono">Live</span>
              </div>
              <div className="space-y-3 pt-3">
                <div className="p-2.5 rounded-lg bg-trio-secondary border border-trio-amber/20 text-xs">
                  <div className="flex items-center justify-between text-trio-amber font-medium">
                    <span>New Candidate CAND-2026-001</span>
                    <span className="text-[10px] text-trio-muted">Just now</span>
                  </div>
                  <p className="text-trio-muted text-[11px] mt-1">
                    Persistent correlation anomaly confirmed across 198 observations in stage-2 filtration.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-trio-secondary border border-trio-border text-xs">
                  <div className="flex items-center justify-between text-trio-cyan font-medium">
                    <span>LTM Baseline Synchronized</span>
                    <span className="text-[10px] text-trio-muted">2m ago</span>
                  </div>
                  <p className="text-trio-muted text-[11px] mt-1">
                    3 known operational prototype centroids calculated with 0% data leakage.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 hover:bg-trio-card rounded-lg transition-colors border border-transparent hover:border-trio-border"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-trio-cyan to-trio-purple flex items-center justify-center text-xs font-bold text-black shadow-glow-cyan/20">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-trio-card border border-trio-border rounded-xl shadow-2xl p-2 z-50 text-left">
              <div className="px-3 py-2 border-b border-trio-border mb-1">
                <p className="text-xs font-semibold text-trio-text truncate">{userEmail || 'Demo Guest'}</p>
                <p className="text-[10px] text-trio-muted">University Evaluator Access</p>
              </div>

              <button
                onClick={() => { onOpenProfile(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-trio-muted hover:text-trio-text hover:bg-trio-secondary rounded-lg transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile &amp; Password</span>
              </button>

              <button
                onClick={() => { onOpenSettings(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-trio-muted hover:text-trio-text hover:bg-trio-secondary rounded-lg transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Platform Settings</span>
              </button>

              <button
                onClick={() => { onOpenViva(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-lg transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Architecture &amp; Specs</span>
              </button>

              <div className="border-t border-trio-border my-1"></div>

              <button
                onClick={() => { onLogout(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
