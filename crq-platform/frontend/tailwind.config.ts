import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aegis: {
          ice: "#E3FDFD",
          frost: "#CBF1F5",
          aqua: "#A6E3E9",
          teal: "#71C9CE",
        },
        ice: "#E3FDFD",
        frost: "#CBF1F5",
        aqua: "#A6E3E9",
        teal: "#71C9CE",
        accent: "#71C9CE",
        canvas: "#E3FDFD",
        surface: "#CBF1F5",
        border: "#A6E3E9",
      },
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
