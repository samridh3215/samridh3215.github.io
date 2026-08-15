/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./themes/nike/layouts/**/*.html",
    "./content/**/*.{md,html}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        muted: "var(--color-text-muted)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["Barlow", "sans-serif"],
      },
      maxWidth: {
        "3xl": "48rem",
      },
      borderRadius: {
        DEFAULT: "0px",
        full: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
