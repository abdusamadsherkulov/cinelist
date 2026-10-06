import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#0a0a0f", panel: "#14141d", line: "#262633", accent: "#ffb703" },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
