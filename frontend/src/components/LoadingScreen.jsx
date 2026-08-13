import AgentIcon from "./AgentIcon.jsx";

// Tela de carregamento do app: mesma linguagem visual dos icones de linha
// fina e do BoardDiagram (orbita/atomo = o "modelo" do produto - governanca
// colegiada). Aneis orbitais e pontos de sinal em rotacao lenta, sem
// gradiente/sombra, no traco fino e sofisticado do restante do produto.
// Use fullScreen (padrao) para o carregamento inicial do app/rotas
// protegidas, ou fullScreen={false} para embutir dentro de um painel/card.
export default function LoadingScreen({ label = "Carregando...", fullScreen = true }) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-5"
    >
      <div className="relative w-28 h-28" aria-hidden="true">
        <div
          className="absolute inset-0 rounded-full animate-[spin_14s_linear_infinite_reverse]"
          style={{ border: "1px dashed rgb(var(--color-ink) / 0.14)" }}
        />
        <div
          className="absolute inset-[10px] rounded-full animate-[spin_10s_linear_infinite]"
          style={{ border: "1px solid rgb(var(--color-ink) / 0.10)" }}
        />

        <div className="absolute inset-[6px] animate-[spin_4.5s_linear_infinite]">
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full bg-accent" />
        </div>
        <div className="absolute inset-[6px] animate-[spin_6.5s_linear_infinite_reverse]">
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-accent-dark" />
        </div>
        <div className="absolute inset-[18px] animate-[spin_3.2s_linear_infinite]">
          <span
            className="absolute -top-[2.5px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full"
            style={{ background: "rgb(var(--color-ink-muted))" }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-surface hairline flex items-center justify-center animate-[spin_18s_linear_infinite]">
            <AgentIcon icon="board" className="w-8 h-8 text-ink" strokeWidth={1.2} />
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="font-serif text-lg text-ink">Advisory &amp; Governança</p>
        <p className="text-xs text-ink-muted mt-1 tracking-wide">{label}</p>
      </div>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      {content}
    </div>
  );
}
