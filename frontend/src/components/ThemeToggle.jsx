import { useTheme } from "../lib/theme.jsx";

// Botao de alternancia entre modo claro/escuro, no mesmo traco fino usado
// nos icones de agente (viewBox 24x24, stroke=currentColor, sem
// preenchimento). Fica fixo no canto superior direito em todas as telas do
// app, sempre visivel, com rotulo de texto ao lado do icone (mesmo criterio
// de "descricao sempre visivel" adotado no resto do produto).
export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={
        isDark
          ? "Modo escuro ativado. Clique para mudar para o modo claro."
          : "Modo claro ativado. Clique para mudar para o modo escuro."
      }
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className={`fixed top-4 right-4 z-50 flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full hairline bg-surface text-ink-muted hover:text-ink hover:bg-accent-soft/20 transition shadow-soft ${className}`}
    >
      {isDark ? (
        // Lua: linha fina, sem preenchimento, mesmo padrao do AgentIcon.
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.2 14.6A8.5 8.5 0 1 1 9.4 3.8a6.7 6.7 0 0 0 10.8 10.8Z" />
        </svg>
      ) : (
        // Sol: circulo central + raios finos.
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.3M12 19.1v2.3M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.6 12h2.3M19.1 12h2.3M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" />
        </svg>
      )}
      <span className="text-[11px] font-medium leading-none">
        {isDark ? "Escuro" : "Claro"}
      </span>
    </button>
  );
}
