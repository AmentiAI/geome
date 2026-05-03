import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 24px hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 48px hsl(var(--primary) / 0.8)" },
        },
        "victory-pop": {
          "0%": { transform: "scale(0.6) rotate(-6deg)", opacity: "0" },
          "60%": { transform: "scale(1.08) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "victory-shine": {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "100%": { transform: "translateX(220%) skewX(-20deg)" },
        },
        "confetti-fall": {
          "0%": { transform: "translate3d(0,-10vh,0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translate3d(var(--cx,0), 110vh, 0) rotate(720deg)", opacity: "0.9" },
        },
        "ring-burst": {
          "0%": { transform: "scale(0.4)", opacity: "0.9" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
        "sparkle-float": {
          "0%": { transform: "translate3d(0,0,0) scale(0.4)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translate3d(var(--sx,0), var(--sy,-40vh), 0) scale(1.2)", opacity: "0" },
        },
        "title-glow": {
          "0%, 100%": { textShadow: "0 0 12px hsl(var(--primary) / 0.6), 0 0 24px hsl(var(--secondary) / 0.4)" },
          "50%": { textShadow: "0 0 24px hsl(var(--primary) / 1), 0 0 48px hsl(var(--secondary) / 0.7)" },
        },
        "next-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 hsl(var(--primary) / 0.6), 0 0 24px hsl(var(--primary) / 0.5)",
          },
          "50%": {
            boxShadow: "0 0 0 12px hsl(var(--primary) / 0), 0 0 48px hsl(var(--primary) / 0.9)",
          },
        },
        "backdrop-pulse": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.85" },
        },
        "coin-spin": {
          "0%": { transform: "rotateY(0deg) scale(1)" },
          "50%": { transform: "rotateY(180deg) scale(1.15)" },
          "100%": { transform: "rotateY(360deg) scale(1)" },
        },
        "fade-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "victory-pop": "victory-pop 600ms cubic-bezier(.2,1.4,.4,1) both",
        "victory-shine": "victory-shine 1.6s ease-in-out 400ms both",
        "confetti-fall": "confetti-fall 2.4s cubic-bezier(.2,.6,.2,1) forwards",
        "ring-burst": "ring-burst 900ms ease-out forwards",
        "sparkle-float": "sparkle-float 1.6s ease-out forwards",
        "title-glow": "title-glow 2.4s ease-in-out infinite",
        "next-pulse": "next-pulse 1.6s ease-in-out infinite",
        "backdrop-pulse": "backdrop-pulse 3s ease-in-out infinite",
        "coin-spin": "coin-spin 1.8s linear infinite",
        "fade-up": "fade-up 500ms ease-out both",
      },
    },
  },
  plugins: [animate],
};

export default config;
