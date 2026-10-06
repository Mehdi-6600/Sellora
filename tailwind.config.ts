import type { Config } from "tailwindcss";

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
          100: "#ffe4ec",
          200: "#fecdd9",
          300: "#fda4bb",
          400: "#fb7197",
          500: "#f43f74",
          600: "#e01d5a",
          700: "#bd1249",
          800: "#9c1240",
          900: "#82133a",
          950: "#48061c",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e2",
          300: "#b0b8c7",
          400: "#8590a6",
          500: "#66728a",
          600: "#515a72",
          700: "#42495d",
          800: "#393e4e",
          900: "#1f2230",
          950: "#0e1018",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 6px 24px -12px rgba(15,23,42,0.12)",
        soft: "0 1px 3px rgba(0,0,0,0.05), 0 8px 24px -16px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
