import React from 'react';

export interface AegisLogoProps {
  variant?: 'full' | 'horizontal' | 'icon';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const AegisLogo: React.FC<AegisLogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  // Size metrics for the icon
  const iconDimensions = {
    sm: { width: 28, height: 28, viewBox: '0 0 64 64' },
    md: { width: 36, height: 36, viewBox: '0 0 64 64' },
    lg: { width: 48, height: 48, viewBox: '0 0 64 64' },
    xl: { width: 64, height: 64, viewBox: '0 0 64 64' },
  }[size];

  const textSizes = {
    sm: 'text-sm tracking-wider',
    md: 'text-base tracking-widest',
    lg: 'text-xl tracking-widest',
    xl: 'text-2xl tracking-widest',
  }[size];

  const badgeSizes = {
    sm: 'text-[9px] px-1 py-0.2',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
    xl: 'text-sm px-2.5 py-1',
  }[size];

  const uniqueId = React.useId().replace(/:/g, '');

  const iconSvg = (
    <svg
      width={iconDimensions.width}
      height={iconDimensions.height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`shieldGrad-${uniqueId}`} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={`facetLeft-${uniqueId}`} x1="14" y1="14" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`facetRight-${uniqueId}`} x1="50" y1="14" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
        </linearGradient>
        <filter id={`logoGlow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Protective Shield Shell */}
      <path
        d="M32 7L52 16V33C52 45 44 54 32 58C20 54 12 45 12 33V16L32 7Z"
        fill={theme === 'dark' ? '#091024' : '#f8fafc'}
        stroke={`url(#shieldGrad-${uniqueId})`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Geometric 'A' Apex Left Facet */}
      <path
        d="M32 13L20 40H27L32 28V13Z"
        fill={`url(#facetLeft-${uniqueId})`}
        filter={`url(#logoGlow-${uniqueId})`}
      />

      {/* Geometric 'A' Apex Right Facet */}
      <path
        d="M32 13L44 40H37L32 28V13Z"
        fill={`url(#facetRight-${uniqueId})`}
        filter={`url(#logoGlow-${uniqueId})`}
      />

      {/* Central Intelligence Core Node */}
      <circle cx="32" cy="27" r="3.5" fill="#ffffff" filter={`url(#logoGlow-${uniqueId})`} />
      <circle cx="32" cy="27" r="1.5" fill={theme === 'dark' ? '#060913' : '#0f172a'} />

      {/* Telemetry Bridge Crossbar */}
      <line x1="24" y1="36" x2="40" y2="36" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="36" r="1.5" fill="#00f0ff" />
      <circle cx="40" cy="36" r="1.5" fill="#a855f7" />

      {/* Lower Pulse Node */}
      <circle cx="32" cy="48" r="2" fill="#00f0ff" />
      <line x1="32" y1="39" x2="32" y2="46" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} aria-label="AegisOps AI Icon">
        {iconSvg}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 select-none group ${className}`}
      aria-label="AegisOps AI"
    >
      <div className="relative flex items-center justify-center p-0.5 rounded-xl bg-gradient-to-tr from-brand-blue/30 via-cyan-500/20 to-violet-500/30 shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
        {iconSvg}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black font-sans leading-none ${textSizes} ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent'
                : 'text-slate-900'
            }`}
          >
            AEGISOPS
          </span>
          <span
            className={`font-bold font-mono rounded bg-brand-blue/20 text-cyan-400 border border-brand-blue/40 tracking-wider ${badgeSizes}`}
          >
            AI
          </span>
        </div>

        {(variant === 'full' || showTagline) && (
          <span
            className={`text-[9px] font-semibold tracking-wider uppercase mt-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Autonomous Cloud Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
