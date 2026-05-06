import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        neutral: {
          50: "#F8F8F8",
          100: "#EDEDED",
          200: "#C9CBCF",
          300: "#AEB0B7",
          400: "#9E9EA5",
          500: "#8C8C92",
          600: "#6C6C71",
          700: "#535257",
          800: "#2A2A2F",
          900: "#18191B",
        },
        "bv-blue": {
          100: "#E9EEFF",
          200: "#ABBBFF",
          300: "#7383FF",
          400: "#4A3AFF",
          500: "#3F31DE",
          600: "#3528BE",
          700: "#201B80",
          800: "#171063",
          900: "#06042E",
          DEFAULT: "#4A3AFF",
        },
        "bv-red": {
          100: "#FFDADA",
          400: "#EC4343",
          700: "#C85E3C",
        },
        "bv-yellow": {
          100: "#FFECAA",
          400: "#FFCC17",
          700: "#CC9300",
        },
        "bv-green": {
          100: "#B2FFDA",
          400: "#16DA7C",
          700: "#0B864B",
        },
        "bv-purple": {
          100: "#F3E8FF",
          400: "#CC98F6",
          700: "#6B21A8",
        },
      },
      fontSize: {
        h1: ["64px", { lineHeight: "88px" }],
        h2: ["56px", { lineHeight: "72px" }],
        h3: ["48px", { lineHeight: "56px" }],
        h4: ["36px", { lineHeight: "48px" }],
        h5: ["24px", { lineHeight: "32px" }],
        "body-lg": ["24px", { lineHeight: "38px" }],
        "body-md": ["18px", { lineHeight: "28px" }],
        "body-sm": ["16px", { lineHeight: "22px" }],
        detail: ["14px", { lineHeight: "18px" }],
        micro: ["12px", { lineHeight: "16px" }],
      },
    },
  },
  plugins: [],
};

export default config;
