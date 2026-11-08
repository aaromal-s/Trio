import React from 'react';
import { motion } from 'framer-motion';

interface TrioLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animate?: boolean;
  subtitle?: string;
  className?: string;
}

export const TrioLogo: React.FC<TrioLogoProps> = ({
  size = 'md',
  showText = true,
  animate = true,
  subtitle,
  className = ''
}) => {
  const pixelSizes = {
    xs: 24,
    sm: 32,
    md: 44,
    lg: 64,
    xl: 88
  };

  const px = pixelSizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: px, height: px }}>
        <svg
          viewBox="0 0 100 100"
          width={px}
          height={px}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <radialGradient id={`logo-glow-${size}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.5" />
              <stop offset="60%" stop-color="#8B5CF6" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#0B1120" stop-opacity="0" />
            </radialGradient>
            <linearGradient id={`grad-stm-${size}`} x1="50" y1="50" x2="50" y2="20">
              <stop offset="0%" stop-color="#F8FAFC" />
              <stop offset="100%" stop-color="#22D3EE" />
            </linearGradient>
            <linearGradient id={`grad-ltm-${size}`} x1="50" y1="50" x2="24" y2="72">
              <stop offset="0%" stop-color="#F8FAFC" />
              <stop offset="100%" stop-color="#8B5CF6" />
            </linearGradient>
            <linearGradient id={`grad-cm-${size}`} x1="50" y1="50" x2="76" y2="72">
              <stop offset="0%" stop-color="#F8FAFC" />
              <stop offset="100%" stop-color="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Ambient Core Aura */}
          <circle cx="50" cy="50" r="44" fill={`url(#logo-glow-${size})`} />

          {/* Orbital Orbit Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="36"
            stroke="#1E293B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            animate={animate ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          />

          {/* Memory Interconnect Triangle */}
          <polygon
            points="50,20 24,72 76,72"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.7"
          />

          {/* Neural Connection Spines */}
          <line x1="50" y1="50" x2="50" y2="20" stroke={`url(#grad-stm-${size})`} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="24" y2="72" stroke={`url(#grad-ltm-${size})`} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="76" y2="72" stroke={`url(#grad-cm-${size})`} strokeWidth="2.5" strokeLinecap="round" />

          {/* Node 1: Short-Term Memory (Cyan) */}
          <g>
            <circle cx="50" cy="20" r="7.5" fill="#111C30" stroke="#22D3EE" strokeWidth="2" />
            <motion.circle
              cx="50"
              cy="20"
              r="3.5"
              fill="#22D3EE"
              animate={animate ? { scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] } : {}}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            />
          </g>

          {/* Node 2: Long-Term Memory (Purple) */}
          <g>
            <circle cx="24" cy="72" r="7.5" fill="#111C30" stroke="#8B5CF6" strokeWidth="2" />
            <motion.circle
              cx="24"
              cy="72"
              r="3.5"
              fill="#8B5CF6"
              animate={animate ? { scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] } : {}}
              transition={{ repeat: Infinity, duration: 2.7, delay: 0.4, ease: "easeInOut" }}
            />
          </g>

          {/* Node 3: Contradiction Memory (Amber) */}
          <g>
            <circle cx="76" cy="72" r="7.5" fill="#111C30" stroke="#F59E0B" strokeWidth="2" />
            <motion.circle
              cx="76"
              cy="72"
              r="3.5"
              fill="#F59E0B"
              animate={animate ? { scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] } : {}}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.8, ease: "easeInOut" }}
            />
          </g>

          {/* Central Intelligence Core */}
          <motion.circle
            cx="50"
            cy="50"
            r="6"
            fill="#F8FAFC"
            animate={animate ? { scale: [0.95, 1.15, 0.95] } : {}}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            filter="drop-shadow(0 0 8px #22D3EE)"
          />
          <circle cx="50" cy="50" r="2.5" fill="#0B1120" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wider text-white text-xl sm:text-2xl font-sans">
              TRIO
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-trio-cyan border border-trio-cyan/30">
              AI Core
            </span>
          </div>
          {subtitle && (
            <span className="text-xs text-trio-muted font-medium tracking-tight">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

