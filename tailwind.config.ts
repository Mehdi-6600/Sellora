import type { Config } from "tailwindcss";

/**
 * Sellora design tokens.
 *
 * Two colour sources, deliberately kept apart:
 *
 * 1. THE ARTWORK (untouched). public/brand/sellora-mark-*.webp and
 *    public/brand/sellora-wordmark*.webp are the original Sellora artwork.
 *    Its own colours — deep wine #8E0F39, crimson #D6255C, rose #F0567F — are
 *    kept verbatim in the `rose` scale and are never re-tinted, so the
 *    character always looks exactly like the reference image.
 *
 * 2. THE ENVIRONMENT (purple premium). The page canvas, panels, borders,
 *    shadows, focus rings and hover states all use the violet `brand` scale
 *    below: deep, soft and modern rather than neon. Violet + the artwork's
 *    magenta sit next to each other on the colour wheel, so the crimson
 *    character reads as the brand signature on a purple stage.
 *
 *   violet 50  #F4F1FE     violet 500 #7C4CE4    violet 900 #331468
 *   violet 100 #EAE4FD     violet 600 #6733D0    violet 950 #1F0A45
 *   violet 200 #D6C9FB     violet 700 #5525AE
 *   violet 300 #B9A2F6     violet 800 #431C88
 *
 * Every value is a tint/shade of that same violet family so the interface,
 * the gradients and the soft-3D lighting never disagree.
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
         * The interface accent — Sellora violet. Used by buttons, links,
         * badges, focus rings and every active state.
         */
        brand: {
          50: "#f4f1fe",
          100: "#eae4fd",
          200: "#d6c9fb",
          300: "#b9a2f6",
          400: "#9874ef",
          500: "#7c4ce4",
          600: "#6733d0",
          700: "#5525ae",
          800: "#431c88",
          900: "#331468",
          950: "#1f0a45",
        },
        /**
         * The colours of the original artwork itself (character, wordmark,
         * speech-bubble lockup). Reserved for brand moments — the character's
         * light pool, the signature chat bubble, avatars — so the artwork's
         * palette is never confused with the interface accent.
         */
        rose: {
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
        /** Violet-tinted neutrals: text, hairlines, muted surfaces. */
        ink: {
          50: "#f8f7fc",
          100: "#f1eff8",
          200: "#e3dfef",
          300: "#bdb7d3",
          400: "#837c9e",
          500: "#6b6489",
          600: "#575173",
          700: "#433e5c",
          800: "#302c47",
          900: "#201d33",
          950: "#131120",
        },
        /** Page backgrounds — soft lavender, never a grey canvas. */
        canvas: {
          DEFAULT: "#f1ecfc",
          soft: "#faf8ff",
          deep: "#e7dffa",
          /** Frosted lavender surface used by sticky bars. */
          glass: "rgba(247, 244, 254, 0.82)",
        },
      },
      boxShadow: {
        /** Resting card: hairline lift, wide and very soft, violet-tinted. */
        card: "0 1px 2px rgba(31, 16, 66, 0.04), 0 14px 32px -22px rgba(31, 16, 66, 0.30)",
        /** Hovered / active card. */
        "card-hover":
          "0 2px 6px rgba(31, 16, 66, 0.06), 0 26px 48px -26px rgba(31, 16, 66, 0.38)",
        /** Raised surface (sidebar, sheets, popovers). */
        raised:
          "0 4px 12px -4px rgba(31, 16, 66, 0.10), 0 30px 64px -34px rgba(31, 16, 66, 0.42)",
        /** Slightly raised buttons — tactile but never cartoonish. */
        soft: "0 1px 2px rgba(31, 16, 66, 0.06), 0 10px 22px -14px rgba(31, 16, 66, 0.30)",
        /** Primary (violet) button. */
        "brand-btn":
          "0 1px 2px rgba(38, 10, 92, 0.20), 0 12px 24px -12px rgba(103, 51, 208, 0.55)",
        /** Violet glow for purple surfaces and interactive highlights. */
        glow: "0 24px 60px -26px rgba(124, 76, 228, 0.60)",
        glowSoft: "0 18px 50px -30px rgba(124, 76, 228, 0.50)",
        /**
         * Rose glow from the original artwork — only ever used around the
         * character itself, so the mark keeps its own light.
         */
        "rose-glow": "0 22px 54px -26px rgba(214, 37, 92, 0.55)",
        /** Subtle inset depth for fields and soft-3D tiles. */
        inset: "inset 0 1px 2px rgba(31, 16, 66, 0.06)",
        "inset-light": "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        /** Sticky bottom navigation. */
        nav: "0 -10px 30px -20px rgba(31, 16, 66, 0.40)",
        /** Desktop sidebar. */
        side: "1px 0 0 rgba(31, 16, 66, 0.06), 22px 0 60px -46px rgba(31, 16, 66, 0.45)",
      },
      borderRadius: {
        /** Cards use 18–24px per the design language. */
        xl2: "1.25rem",
        card: "1.375rem",
        sheet: "1.75rem",
      },
      backgroundImage: {
        /** Deep violet stage for hero surfaces that carry the character. */
        "brand-gradient":
          "linear-gradient(140deg, #7a4ce6 0%, #5a2bc0 46%, #2e1266 100%)",
        /** Airy lavender wash for light panels. */
        "brand-gradient-soft": "linear-gradient(160deg, #f4f1fe 0%, #ffffff 62%)",
        /** Interactive violet sheen (buttons, badges, tiles). */
        "brand-gradient-sheen":
          "linear-gradient(135deg, #9874ef 0%, #6733d0 46%, #431c88 100%)",
        /** The artwork's own gradient, verbatim — signature brand moments. */
        "rose-gradient": "linear-gradient(135deg, #f0567f 0%, #d6255c 46%, #8e0f39 100%)",
        /** The ambient purple aura behind every screen. */
        "canvas-aura":
          "radial-gradient(900px 520px at 88% -6%, rgba(124, 76, 228, 0.20), transparent 62%), radial-gradient(780px 480px at 2% 2%, rgba(185, 162, 246, 0.42), transparent 60%), radial-gradient(1100px 700px at 50% 118%, rgba(67, 28, 136, 0.16), transparent 66%), radial-gradient(700px 420px at 96% 96%, rgba(237, 67, 110, 0.07), transparent 62%)",
        "chip-sheen": "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))",
        /** Soft-3D top light: a whisper of violet on the top edge of every
            card, so panels read as layered glass on the purple canvas. */
        "surface-sheen":
          "linear-gradient(180deg, rgba(244,241,254,0.9), rgba(255,255,255,0) 78%)",
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
};

export default config;
