import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#05070f",
        surface: "#0b0e1a",
        border: "rgba(255,255,255,0.08)",
        primary: { DEFAULT: "#6366f1", light: "#818cf8", dim: "#4338ca" },
        accent: { DEFAULT: "#22d3ee", light: "#67e8f9", dim: "#0e7490" },
        signal: "#a78bfa",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(99,102,241,0.55)",
        "glow-accent": "0 0 40px -10px rgba(34,211,238,0.45)",
        "glow-lg": "0 0 80px -15px rgba(99,102,241,0.5), 0 0 30px -10px rgba(34,211,238,0.3)",
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        pulseGlow: { "0%,100%": { opacity: "0.55", transform: "scale(1)" }, "50%": { opacity: "1", transform: "scale(1.06)" } },
        auroraShift: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(4%,-3%) scale(1.08)" },
          "66%": { transform: "translate(-3%,4%) scale(0.96)" },
        },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        shimmerSweep: { "0%": { transform: "translateX(-120%) skewX(-20deg)" }, "100%": { transform: "translateX(220%) skewX(-20deg)" } },
        spinSlow: { to: { transform: "rotate(360deg)" } },
        travel: { "0%": { offsetDistance: "0%", opacity: "0" }, "8%": { opacity: "1" }, "92%": { opacity: "1" }, "100%": { offsetDistance: "100%", opacity: "0" } },
        riseIn: { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        aurora: "auroraShift 14s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        sweep: "shimmerSweep 2.8s ease-in-out infinite",
        "spin-slow": "spinSlow 6s linear infinite",
        riseIn: "riseIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "radial-fade": "radial-gradient(circle at center, black 0%, transparent 75%)",
      },
    },
  },
  plugins: [],
};
export default config;