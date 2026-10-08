import type { Config } from "tailwindcss";

// Light SaaS tokens. Brand artwork is preserved independently.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        persian: ["var(--font-persian)", "Tahoma", "sans-serif"],
      },
      colors: {
        brand: {50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#007aff", 600: "#0066d6", 700: "#0055b3", 800: "#164785", 900: "#15345e", 950: "#102744"},
        ink: {50: "#f8fafc", 100: "#e8edf2", 200: "#d3dce6", 300: "#a3afbf", 400: "#68788d", 500: "#566579", 600: "#465469", 700: "#334155", 800: "#243247", 900: "#182335", 950: "#101b2b"},
        canvas: {DEFAULT: "#f7f9fc", soft: "#f1f5f9", deep: "#e2e8f0", glass: "rgba(255,255,255,0.9)"},
      },
      boxShadow: {
        card: "0 2px 8px -4px rgba(24,39,65,.08), 0 12px 32px -24px rgba(24,39,65,.14)",
        "card-hover": "0 8px 24px -12px rgba(24,39,65,.16)",
        raised: "0 16px 48px -20px rgba(24,39,65,.2)",
        soft: "0 2px 4px rgba(24,39,65,.06)",
        "brand-btn": "0 3px 8px rgba(0,102,214,.16)",
        glow: "0 8px 24px -16px rgba(0,122,255,.2)",
        glowSoft: "0 4px 14px -10px rgba(0,122,255,.16)",
        premium: "0 12px 32px -24px rgba(24,39,65,.16)",
        inset: "inset 0 1px 2px rgba(24,39,65,.03)",
        nav: "0 -4px 24px -12px rgba(24,39,65,.12)",
        side: "1px 0 0 rgba(24,39,65,.04)",
      },
      borderRadius: {
        /** Cards use 18–24px per the design language. */
        xl2: "1.25rem",
        card: "1.375rem",
        sheet: "1.75rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(#0066d6, #0066d6)",
        "brand-gradient-soft": "linear-gradient(135deg, #f1f7ff, #ffffff)",
        "brand-gradient-sheen": "linear-gradient(#0066d6, #0066d6)",
        "premium-gradient": "linear-gradient(#eef5fc, #eef5fc)",
        "canvas-aura": "none",
        "chip-sheen": "linear-gradient(180deg, rgba(255,255,255,.2), transparent)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.65" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.34s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.24s ease-out both",
        pop: "pop 0.18s cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-up": "sheet-up 0.26s cubic-bezier(0.32, 0.72, 0, 1) both",
        shimmer: "shimmer 1.6s infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.2s ease-out infinite",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  /**
   * No plugins: direction handling uses Tailwind's built-in `rtl:` / `ltr:`
   * variants (the document sets dir on <html>), so nothing extra is needed.
   */
  plugins: [],
}

export default config;
