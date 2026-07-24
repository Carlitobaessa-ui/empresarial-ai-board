/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F5F3EC",
        surface: "#FCFBF7",
        ink: "#2B2823",
        "ink-muted": "#6B665D",
        line: "rgba(30, 27, 23, 0.10)",
        accent: {
          DEFAULT: "#D97757",
          dark: "#BC5F42",
          soft: "#F1DFD3",
        },
      },
      fontFamily: {
        serif: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "14px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(43, 40, 35, 0.06)",
      },
    },
  },
  plugins: [],
};
