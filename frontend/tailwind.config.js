/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Modo escuro por classe (".dark" na tag <html>), controlado pelo
  // ThemeProvider (src/lib/theme.jsx) em vez de seguir automaticamente a
  // preferencia do sistema - assim o usuario pode ligar/desligar manualmente.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Paleta alinhada ao design do Claude AI: creme quente de fundo,
        // superficie branca para elevacao sutil de cards, tinta neutra
        // quente para texto, e o terracota da marca como acento.
        // Os valores reais vivem em variaveis CSS (src/index.css, blocos
        // :root e .dark) como trincas "R G B" - isso permite que o modo
        // escuro troque a paleta inteira e mantem o suporte a modificadores
        // de opacidade do Tailwind (ex: bg-accent-soft/30).
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        line: "var(--color-line)",
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          dark: "rgb(var(--color-accent-dark) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)",
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
