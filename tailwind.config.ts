import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        azure: {
          DEFAULT: "#00638E",
          dark: "#004A6B",
          light: "#BFD8E3",
          sky: "#8CB9CC",
          50: "#F0F7FA",
          100: "#E0EFF5",
          200: "#BFD8E3",
          300: "#8CB9CC",
          400: "#4D93B3",
          500: "#00638E",
          600: "#00567C",
          700: "#004A6B",
          800: "#00364E",
          900: "#002333",
        },
        primary: {
          DEFAULT: "#00638E",
          hover: "#004A6B",
          dark: "#004A6B",
          light: "#BFD8E3",
          tint: "#F0F7FA",
        },
        onyx: {
          DEFAULT: "#000000",
          surface: "#141414",
        },
        charcoal: "#2B2B2B",
        accent: {
          DEFAULT: "#00638E",
          hover: "#004A6B",
          light: "#BFD8E3",
        },
        ink: {
          DEFAULT: "#141414",
          soft: "#2B2B2B",
          muted: "#64748B",
        },
        paper: "#FFFFFF",
        canvas: "#F8FAFC",
        status: {
          diterima: "#64748B",
          diproses: "#D97706",
          ditindaklanjuti: "#00638E",
          selesai: "#059669",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(24, 24, 27, 0.05), 0 2px 6px -1px rgba(24, 24, 27, 0.02)",
        "card-hover": "0 10px 25px -3px rgba(24, 24, 27, 0.12), 0 4px 10px -2px rgba(24, 24, 27, 0.04)",
      },
    },
  },
  plugins: [animate],
};

export default config;