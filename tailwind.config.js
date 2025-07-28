const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: ['class'],
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'arabic-quran': ['Amiri', 'Lateef', 'Scheherazade', 'serif'],
        'arabic-traditional': ['Lateef', 'Amiri', 'serif'],
        'arabic-modern': ['Scheherazade', 'Amiri', 'serif'],
          '3d': ['Bungee', 'cursive'],
    

      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        input: "var(--input)",
        border: "var(--border)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
