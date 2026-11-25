/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trio: {
          bg: "var(--trio-bg)",
          secondary: "var(--trio-secondary)",
          card: "var(--trio-card)",
          cardHover: "var(--trio-card-hover)",
          cyan: "#F97316",
          purple: "#FACC15",
          green: "#34D399",
          amber: "#FB923C",
          rose: "#F43F5E",
          text: "var(--trio-text)",
          muted: "var(--trio-muted)",
          border: "var(--trio-border)",
          glow: "var(--trio-glow)"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 24px -4px rgba(249, 115, 22, 0.4)',
        'glow-purple': '0 0 24px -4px rgba(250, 204, 21, 0.35)',
        'glow-amber': '0 0 24px -4px rgba(251, 146, 60, 0.35)',
        'glow-emerald': '0 0 24px -4px rgba(52, 211, 153, 0.3)',
        'inner-specular': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
