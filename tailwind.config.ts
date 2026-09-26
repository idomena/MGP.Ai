import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        "cozy-sm": "var(--cozy-shadow-sm)",
        "cozy-md": "var(--cozy-shadow-md)",
        "cozy-lg": "var(--cozy-shadow-lg)",
      },
      colors: {
        // Cozy design tokens (src/styles/cozy.css)
        cozy: {
          bg: "var(--cozy-bg)",
          "bg-deep": "var(--cozy-bg-deep)",
          surface: "var(--cozy-surface)",
          sunk: "var(--cozy-surface-sunk)",
          line: "var(--cozy-line)",
          ink: "var(--cozy-ink)",
          "ink-soft": "var(--cozy-ink-soft)",
          "ink-faint": "var(--cozy-ink-faint)",
          primary: "var(--cozy-primary)",
          "primary-deep": "var(--cozy-primary-deep)",
          "primary-soft": "var(--cozy-primary-soft)",
          "primary-line": "var(--cozy-primary-line)",
          sage: "var(--cozy-sage)",
          "sage-deep": "var(--cozy-sage-deep)",
          "sage-soft": "var(--cozy-sage-soft)",
          streak: "var(--cozy-streak)",
          "streak-deep": "var(--cozy-streak-deep)",
          "streak-soft": "var(--cozy-streak-soft)",
          sky: "var(--cozy-sky)",
          "sky-deep": "var(--cozy-sky-deep)",
          "sky-soft": "var(--cozy-sky-soft)",
          rest: "var(--cozy-rest)",
          "rest-deep": "var(--cozy-rest-deep)",
          "rest-soft": "var(--cozy-rest-soft)",
          stone: "var(--cozy-stone)",
          danger: "var(--cozy-danger)",
          "danger-soft": "var(--cozy-danger-soft)",
        },
        background: "var(--cozy-bg)",
        foreground: "var(--cozy-ink)",
        muted: {
          DEFAULT: "var(--cozy-surface-sunk)",
          foreground: "var(--cozy-ink-soft)",
        },
        accent: {
          DEFAULT: "var(--cozy-primary-soft)",
          foreground: "var(--cozy-primary-deep)",
          green: "var(--cozy-sage)",
          purple: "var(--cozy-primary)",
          "purple-light": "var(--cozy-primary-line)",
          blue: "var(--cozy-sky-deep)",
        },
        card: {
          DEFAULT: "var(--cozy-surface)",
          foreground: "var(--cozy-ink)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      backgroundImage: {
        // Kept for existing class names; the cozy direction uses flat primary instead of neon gradients.
        "gradient-primary": "linear-gradient(90deg, var(--cozy-primary) 0%, var(--cozy-primary) 100%)",
        "gradient-button": "linear-gradient(90deg, var(--cozy-primary) 0%, var(--cozy-primary) 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
