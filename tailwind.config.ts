import type { Config } from "tailwindcss";

/**
 * Sellora design tokens — Purple Premium edition.
 *
 * Canvas: a deep, luxurious, soft purple (not neon, not too dark) with violet
 * aura gradients, inspired by the deep violet-wine shadows of the official
 * brand artwork (public/og.jpg). Surfaces are layered glass on top of it.
 *
 * The BRAND rose scale keeps the exact hues of the original Sellora character
 * (public/icons/icon-512.png): the logo/character colors never change — only
 * the environment around them became Purple Premium. The scale is arranged
 * for dark surfaces: low steps are deep rose tints (tiles/borders), high
 * steps are light rose (text on dark).
 *
 *   canvas base    #150E2E  (deep premium purple page background)
 *   canvas soft    #1E1442  (raised purple surface)
 *   violet aura    #8B5CF6 / #A78BFA (soft depth highlights)
 *   brand rose     #ED436E / #D6255C / #F0567F (character + primary actions)
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
        /**
         * Brand rose — the original character hues, arranged for dark
         * surfaces: 50–300 are deep rose tints (tiles, borders), 500–600 are
         * the untouched brand core, 700–950 are light rose for text on dark.
         */
        brand: {
          50: "#3a1129",
          100: "#5c1a40",
          200: "#93295e",
          300: "#c04a7d",
          400: "#e0608c",
          500: "#ed436e",
          600: "#d6255c",
          700: "#f0567f",
          800: "#ff7fa3",
          900: "#ffadc6",
          950: "#ffd9e5",
        },
        /**
         * Ink — purple-tinted neutrals for the dark premium canvas.
         * Low steps are dark surfaces/borders, high steps are light text.
         */
        ink: {
          50: "#221a45",
          100: "#2c2356",
          200: "#453680",
          300: "#645a97",
          400: "#7f76ad",
          500: "#9c93c4",
          600: "#b3abd6",
          700: "#c9c2e6",
          800: "#ddd8f0",
          900: "#f1eefb",
          950: "#fbfaff",
        },
        /** Page backgrounds — deep Purple Premium, never a grey canvas. */
        canvas: {
          DEFAULT: "#150e2e",
          soft: "#1e1442",
          deep: "#0e0920",
          /** Frosted surface used by sticky bars. */
          glass: "rgba(21, 14, 46, 0.72)",
        },
      },
      boxShadow: {
        /** Resting card: glass top-light, wide and very soft purple depth. */
        card: "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 1px 2px rgba(6, 3, 20, 0.5), 0 14px 34px -20px rgba(6, 3, 20, 0.6)",
        /** Hovered / active card. */
        "card-hover":
          "inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 2px 4px rgba(6, 3, 20, 0.5), 0 24px 48px -24px rgba(6, 3, 20, 0.7)",
        /** Raised surface (sidebar, sheets, popovers). */
        raised: "inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 4px 10px -4px rgba(6, 3, 20, 0.55), 0 28px 60px -30px rgba(6, 3, 20, 0.75)",
        /** Slightly raised buttons — tactile but never cartoonish. */
        soft: "0 1px 2px rgba(6, 3, 20, 0.5), 0 8px 20px -12px rgba(6, 3, 20, 0.6)",
        "brand-btn":
          "0 1px 2px rgba(60, 6, 32, 0.35), 0 10px 24px -10px rgba(214, 37, 92, 0.6)",
        /** Brand glow (character / hero moments) — the rose of the artwork. */
        glow: "0 24px 70px -24px rgba(237, 67, 110, 0.5)",
        glowSoft: "0 18px 50px -28px rgba(237, 67, 110, 0.45)",
        /** Violet glow for premium hero panels. */
        premium: "0 24px 70px -28px rgba(124, 58, 237, 0.45)",
        /** Subtle inset depth for fields. */
        inset: "inset 0 1px 2px rgba(6, 3, 20, 0.6)",
        /** Sticky bottom navigation. */
        nav: "0 -10px 30px -18px rgba(6, 3, 20, 0.7)",
        /** Desktop sidebar. */
        side: "1px 0 0 rgba(255, 255, 255, 0.06), 18px 0 50px -40px rgba(6, 3, 20, 0.7)",
      },
      borderRadius: {
        /** Cards use 18–24px per the design language. */
        xl2: "1.25rem",
        card: "1.375rem",
        sheet: "1.75rem",
      },
      backgroundImage: {
        /** Brand rose gradient — exact colors of the original artwork. */
        "brand-gradient": "linear-gradient(135deg, #f0567f 0%, #d6255c 46%, #8e0f39 100%)",
        /** Soft violet glass panel on the premium canvas. */
        "brand-gradient-soft":
          "linear-gradient(160deg, rgba(139, 92, 246, 0.16) 0%, rgba(167, 139, 250, 0.05) 60%, rgba(255, 255, 255, 0.02) 100%)",
        "brand-gradient-sheen":
          "linear-gradient(135deg, #f9709a 0%, #ed436e 40%, #b01447 100%)",
        /** Purple Premium hero/CTA panels: deep, luxurious, soft violet. */
        "premium-gradient":
          "linear-gradient(135deg, #2e1760 0%, #3b1d7e 46%, #1d0f45 100%)",
        /** Ambient violet aura behind every screen (fixed, never scrolls). */
        "canvas-aura":
          "radial-gradient(900px 520px at 88% -6%, rgba(139, 92, 246, 0.16), transparent 62%), radial-gradient(760px 460px at 4% 4%, rgba(167, 139, 250, 0.10), transparent 60%), radial-gradient(1100px 700px at 50% 120%, rgba(109, 40, 217, 0.18), transparent 65%)",
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
