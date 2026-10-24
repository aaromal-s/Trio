import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Pause, Play, Clock, User as UserIcon, LogOut,
  Activity, Menu, X, ChevronRight, Zap
} from 'lucide-react';
import { useLiveData } from '../../context/LiveDataContext';
import { useAuth } from '../../context/AuthContext';
import { AegisLogo } from './AegisLogo';

interface HeaderProps {
  currentView: 'landing' | 'dashboard';
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  onExploreDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  openAuthModal,
  onExploreDemo
}) => {
  const {
    clock,
    isRefreshing,
    isPaused,
    lastUpdatedRelative,
    refreshError,
    refreshNow,
    togglePause,
    overview
  } = useLiveData();

  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Product', href: '#preview' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-midnight-950/90 backdrop-blur-xl transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
            aria-label="AegisOps AI Home"
          >
            <AegisLogo variant="horizontal" size="sm" />
          </button>

          {/* Desktop Navigation Links (Compact) */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={currentView === 'landing' ? link.href : '#'}
                onClick={(e) => {
                  if (currentView !== 'landing') {
                    e.preventDefault();
                    setCurrentView('landing');
                    setTimeout(() => {
                      const el = document.querySelector(link.href);
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className="hover:text-cyan-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                currentView === 'dashboard'
                  ? 'bg-brand-blue text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Console</span>
              {overview?.overall_health === 'DEGRADED' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              )}
            </button>
          </nav>
        </div>

        {/* Right: Live Clock, 5s Auto-Refresh & Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Live 12-Hour Browser Clock with IST timezone (Compact) */}
          <div 
            className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-midnight-900/90 border border-white/[0.06] text-xs font-mono"
            title="System Time in IST (UTC+5:30)"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-bold tracking-wider">{clock.timeString}</span>
              <span className="text-[10px] text-slate-400 font-sans">IST</span>
            </div>
          </div>

          {/* 5-Second Auto-Refresh Widget (Compact) */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-midnight-900/90 border border-white/[0.06] text-xs">
            <span className="relative flex h-2 w-2 mr-1" title={refreshError || 'Auto-refreshing every 5 seconds'}>
              {!isPaused && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  refreshError ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isPaused ? 'bg-slate-500' : refreshError ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
            </span>

            <button
              onClick={refreshNow}
              disabled={isRefreshing}
              title="Manual Refresh (5s stream)"
              aria-label="Refresh Now"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-blue' : ''}`} />
            </button>

            <button
              onClick={togglePause}
              title={isPaused ? "Resume 5s auto-refresh" : "Pause 5s auto-refresh"}
              aria-label={isPaused ? "Resume Auto-refresh" : "Pause Auto-refresh"}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          </div>

          {/* User Account / Auth Actions */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-blue to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user.full_name.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-white">{user.full_name}</span>
                  <span className="text-[9px] text-cyan-400 font-mono uppercase mt-0.5">{user.role}</span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out of AegisOps"
                aria-label="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-blue via-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-glow-sm transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-cyan-300" />
                <span>Get Started</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs bg-midnight-950 border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <AegisLogo variant="horizontal" size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View Switcher Mobile */}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCurrentView('landing');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-left text-xs font-semibold transition-all ${
                    currentView === 'landing' ? 'bg-brand-blue text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  Public Overview
                </button>
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    currentView === 'dashboard' ? 'bg-brand-blue text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Operations Console
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              {/* Anchor Navigation */}
              <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-2 text-xs">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      setCurrentView('landing');
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-5 border-t border-white/10 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{clock.timeString} (IST)</span>
              </div>

              {user ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04]">
                  <div>
                    <p className="text-xs font-bold text-white">{user.full_name}</p>
                    <p className="text-[10px] text-cyan-400 uppercase">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-full py-2 rounded-lg border border-white/10 text-xs font-semibold text-slate-200 text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="w-full py-2 rounded-lg bg-brand-blue text-xs font-semibold text-white text-center shadow-glow-sm"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
