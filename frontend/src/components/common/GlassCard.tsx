import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  interactive = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl p-5
        bg-midnight-900/80 backdrop-blur-xl
        border border-white/[0.08] shadow-glass
        ${glow ? 'before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-brand-blue/50 before:to-transparent' : ''}
        ${interactive ? 'hover:border-brand-blue/40 hover:shadow-glow-sm hover:-translate-y-0.5 cursor-pointer transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
