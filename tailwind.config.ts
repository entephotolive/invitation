import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        primary: "hsl(var(--theme-primary))",
        secondary: "hsl(var(--theme-secondary))",
        accent: "hsl(var(--theme-accent))"
      },
      borderRadius: {
        xl: "1rem"
      },
      boxShadow: {
        soft: "0 10px 35px rgba(0,0,0,.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
