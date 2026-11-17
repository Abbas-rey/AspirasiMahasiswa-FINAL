import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB", // Electric Slate Blue
          hover: "#1D4ED8",
          dark: "#1E40AF", // Deep Indigo
          light: "#DBEAFE",
        },
        indigo: {
          deep: "#1E40AF",
          accent: "#6366F1",
        },
        slate: {
          dark: "#0F172A", // Dark Slate Gray
          muted: "#64748B", // Muted Gray
          subtle: "#94A3B8",
        },
        bg: {
          ice: "#F8FAFC", // Ice Tint White
          clean: "#FFFFFF", // Clean Neutral
        },
        status: {
          diterima: "#ED8936", // Coral Orange
          diproses: "#F59E0B", // Amber Yellow
          ditindaklanjuti: "#6366F1", // Indigo/Purple
          selesai: "#10B981", // Mint Green
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
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.08)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)",
        "card-hover": "0 10px 25px -3px rgba(37, 99, 235, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
