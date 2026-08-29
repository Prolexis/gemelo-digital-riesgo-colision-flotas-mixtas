import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mining: {
          900: "#0f172a",
          700: "#1f2937",
          500: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
