/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta alinhada ao design do Claude AI: creme quente de fundo,
        // superficie branca para elevacao sutil de cards, tinta neutra
        // quente para texto, e o terracota da marca como acento.
        cream: "#FAF9F5",
        surface: "#FFFFFF",
        ink: "#262624",
        "ink-muted": "#6B665D",
        line: "rgba(38, 38, 36, 0.10)",
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
