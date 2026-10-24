import React from 'react';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'blue' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'blue',
  className = ''
}) => {
  const accentBorder: Record<string, string> = {
    blue: 'border-blue-500/30',
    cyan: 'border-cyan-500/30',
    violet: 'border-violet-500/30',
    emerald: 'border-emerald-500/30',
    amber: 'border-amber-500/30',
    rose: 'border-rose-500/30'
  };

  const accentText: Record<string, string> = {
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400'
  };

  return (
    <GlassCard glow className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">{title}</span>
        {icon && (
          <div className={`p-2 rounded-lg bg-midnight-800/80 border ${accentBorder[accentColor]} ${accentText[accentColor]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3 my-1">
        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{value}</span>
        {trend && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trend.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </GlassCard>
  );
};
