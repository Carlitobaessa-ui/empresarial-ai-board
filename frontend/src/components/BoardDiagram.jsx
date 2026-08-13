import AgentIcon from "./AgentIcon.jsx";

// Diagrama "hub-and-spoke" que representa o modelo do produto:
// um centro (voce / conselho) conectado por linhas finas a cada agente especialista.
// Puramente decorativo/explicativo - usado na Landing e no topo do Admin.

// Quebra o nome do agente em ate 3 linhas curtas para nao estourar a largura
// do SVG (nomes longos, como os que terminam em "#consultivo", nao cabem
// numa unica linha centralizada perto das bordas do diagrama).
function wrapLabel(name, maxCharsPerLine = 13) {
  const words = (name || "").split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines;
}

export default function BoardDiagram({ agents = [] }) {
  const radius = 145;
  const center = { x: 210, y: 175 };
  const nodes = agents.slice(0, 8);
  const angleStep = (2 * Math.PI) / Math.max(nodes.length, 1);

  return (
    <svg
      viewBox="0 0 420 380"
      className="w-full max-w-md mx-auto"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {/* Anel orbital externo - sugere um sistema/instrumento, nao so um grafico */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius + 40}
        fill="none"
        stroke="rgb(var(--color-ink) / 0.08)"
        strokeWidth="1"
        strokeDasharray="1.5 7"
      />
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill="none"
        stroke="rgb(var(--color-ink) / 0.06)"
        strokeWidth="1"
      />

      {nodes.map((agent, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        // Ponto de sinal a meio caminho da linha - reforca a leitura de
        // "conexao ativa" entre o centro e cada agente especialista.
        const midX = center.x + radius * 0.56 * Math.cos(angle);
        const midY = center.y + radius * 0.56 * Math.sin(angle);
        return (
          <g key={`line-${agent.id || i}`}>
            <line
              x1={center.x}
              y1={center.y}
              x2={x}
              y2={y}
              stroke="rgb(var(--color-ink) / 0.14)"
              strokeWidth="1"
            />
            <circle cx={midX} cy={midY} r="1.6" fill={agent.color || "#D97757"} />
          </g>
        );
      })}

      {/* Centro: "voce" / conselho */}
      <circle cx={center.x} cy={center.y} r="34" fill="rgb(var(--color-surface))" stroke="rgb(var(--color-ink))" strokeWidth="1" />
      <circle cx={center.x} cy={center.y} r="29.5" fill="none" stroke="rgb(var(--color-ink) / 0.10)" strokeWidth="1" />
      <foreignObject x={center.x - 16} y={center.y - 16} width="32" height="32">
        <div className="w-8 h-8 flex items-center justify-center text-ink">
          <AgentIcon icon="board" className="w-6 h-6" strokeWidth={1.2} />
        </div>
      </foreignObject>

      {nodes.map((agent, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        const lines = wrapLabel(agent.name);
        return (
          <g key={agent.id || i}>
            <circle
              cx={x}
              cy={y}
              r="26"
              fill="rgb(var(--color-surface))"
              stroke={agent.color || "#D97757"}
              strokeWidth="1.2"
            />
            <foreignObject x={x - 13} y={y - 13} width="26" height="26">
              <div
                className="w-[26px] h-[26px] flex items-center justify-center"
                style={{ color: agent.color || "#D97757" }}
              >
                <AgentIcon icon={agent.icon} className="w-5 h-5" strokeWidth={1.3} />
              </div>
            </foreignObject>
            <text
              x={x}
              y={y + 40}
              textAnchor="middle"
              fontSize="10"
              fill="rgb(var(--color-ink-muted))"
              fontFamily="Inter, sans-serif"
            >
              {lines.map((line, li) => (
                <tspan key={li} x={x} dy={li === 0 ? 0 : 11.5}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
