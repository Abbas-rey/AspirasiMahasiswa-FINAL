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
        primary: {
          DEFAULT: "#18181B",
          hover: "#27272A",
          dark: "#18181B",
          light: "#E4E4E7",
          tint: "#F4F4F5",
        },
        accent: {
          DEFAULT: "#52525B",
          light: "#E4E4E7",
        },
        ink: {
          DEFAULT: "#18181B",
          soft: "#3F3F46",
          muted: "#52525B",
        },
        paper: "#FAFAFA",
        status: {
          diterima: "#A1A1AA",
          diproses: "#71717A",
          ditindaklanjuti: "#3F3F46",
          selesai: "#18181B",
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