import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'p1' | 'p2' | 'p3' | 'p4' | 'critical' | 'high' | 'elevated' | 'nominal' | 'success' | 'warning' | 'info' | 'neutral';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  pulse = false,
  className = ''
}) => {
  const variantStyles: Record<string, string> = {
    p1: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    p2: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    p3: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    p4: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    critical: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    elevated: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    nominal: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    neutral: 'bg-slate-800/60 text-slate-300 border-slate-700/60',
  };

  const dotColors: Record<string, string> = {
    p1: 'bg-rose-400',
    p2: 'bg-amber-400',
    p3: 'bg-blue-400',
    p4: 'bg-slate-400',
    critical: 'bg-rose-400',
    high: 'bg-amber-400',
    elevated: 'bg-violet-400',
    nominal: 'bg-emerald-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    info: 'bg-cyan-400',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md transition-colors ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant] || 'bg-blue-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant] || 'bg-blue-400'}`} />
        </span>
      )}
      {children}
    </span>
  );
};
