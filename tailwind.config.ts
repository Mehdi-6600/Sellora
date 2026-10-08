import type { Config } from "tailwindcss";

/**
 * Sellora design tokens.
 *
 * The palette is sampled directly from the official brand artwork
 * (public/og.jpg + public/icons/icon-512.png):
 *
 *   deep wine      #8E0F39 / #A70B37  (gradient shadow side, mark bottom)
 *   crimson        #C02454 / #D6255C  (mark body, primary action colour)
 *   rose highlight #ED436E / #F0567F  (gradient light side, glow)
 *   canvas         #FBF4F6            (very light rose-tinted page background)
 *
 * Every value below is a tint/shade of that same hue family so the logo and
 * the interface never disagree. Deliberately no arbitrary purple/blue.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        persian: ["var(--font-persian)", "Tahoma", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff1f5",
          100: "#ffe3ec",
          200: "#ffc9d8",
          300: "#ffa0b9",
          400: "#f9709a",
          500: "#ed436e",
          600: "#d6255c",
          700: "#b01447",
          800: "#8e0f39",
          900: "#730d2f",
          950: "#43061b",
        },
        ink: {
          50: "#f7f7fa",
          100: "#eeeef4",
          200: "#dcdee8",
          300: "#b9becd",
          400: "#8d93a8",
          500: "#6a7189",
          600: "#545b73",
          700: "#434a5f",
          800: "#363c4f",
          900: "#1d2033",
          950: "#0e1020",
        },
        /** Page backgrounds — rose-tinted whites, never a grey canvas. */
        canvas: {
          DEFAULT: "#fbf4f6",
          soft: "#fdf8f9",
          deep: "#f7ebef",
          /** Frosted surface used by sticky bars. */
          glass: "rgba(253, 248, 249, 0.82)",
        },
      },
      boxShadow: {
        /** Resting card: hairline lift, wide and very soft. */
        card: "0 1px 2px rgba(38, 12, 24, 0.04), 0 12px 30px -20px rgba(38, 12, 24, 0.18)",
        /** Hovered / active card. */
        "card-hover":
          "0 2px 4px rgba(38, 12, 24, 0.05), 0 22px 44px -24px rgba(38, 12, 24, 0.24)",
        /** Raised surface (sidebar, sheets, popovers). */
        raised: "0 4px 10px -4px rgba(38, 12, 24, 0.08), 0 28px 60px -32px rgba(38, 12, 24, 0.28)",
        /** Slightly raised buttons — tactile but never cartoonish. */
        soft: "0 1px 2px rgba(38, 12, 24, 0.06), 0 8px 20px -14px rgba(38, 12, 24, 0.22)",
        "brand-btn":
          "0 1px 2px rgba(120, 10, 45, 0.18), 0 10px 22px -12px rgba(214, 37, 92, 0.55)",
        /** Brand glow (character / hero moments). */
        glow: "0 24px 60px -26px rgba(214, 37, 92, 0.55)",
        glowSoft: "0 18px 50px -30px rgba(214, 37, 92, 0.45)",
        /** Subtle inset depth for fields. */
        inset: "inset 0 1px 2px rgba(38, 12, 24, 0.05)",
        /** Sticky bottom navigation. */
        nav: "0 -10px 30px -22px rgba(38, 12, 24, 0.35)",
        /** Desktop sidebar. */
        side: "1px 0 0 rgba(38, 12, 24, 0.06), 18px 0 50px -40px rgba(38, 12, 24, 0.25)",
      },
      borderRadius: {
        /** Cards use 18–24px per the design language. */
        xl2: "1.25rem",
        card: "1.375rem",
        sheet: "1.75rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #f0567f 0%, #d6255c 46%, #8e0f39 100%)",
        "brand-gradient-soft": "linear-gradient(160deg, #fff1f5 0%, #ffffff 62%)",
        "brand-gradient-sheen":
          "linear-gradient(135deg, #f9709a 0%, #ed436e 40%, #b01447 100%)",
        "canvas-aura":
          "radial-gradient(900px 520px at 88% -6%, rgba(237, 67, 110, 0.16), transparent 62%), radial-gradient(760px 460px at 4% 4%, rgba(255, 200, 216, 0.5), transparent 60%), radial-gradient(1100px 700px at 50% 120%, rgba(142, 15, 57, 0.08), transparent 65%)",
        "chip-sheen": "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))",
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
