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
          bg: "#0B1120",
          secondary: "#111C30",
          card: "#16243A",
          cardHover: "#1E304D",
          cyan: "#22D3EE",
          purple: "#8B5CF6",
          green: "#34D399",
          amber: "#F59E0B",
          rose: "#F43F5E",
          text: "#F8FAFC",
          muted: "#94A3B8",
          border: "#1E293B",
          glow: "rgba(34, 211, 238, 0.15)"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(34, 211, 238, 0.3)',
        'glow-purple': '0 0 20px -5px rgba(139, 92, 246, 0.3)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}

