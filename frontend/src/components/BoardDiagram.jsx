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
  const nodes = agents.slice(0, 6);
  const angleStep = (2 * Math.PI) / Math.max(nodes.length, 1);

  return (
    <svg
      viewBox="0 0 420 380"
      className="w-full max-w-md mx-auto"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {nodes.map((agent, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        return (
          <line
            key={`line-${agent.id || i}`}
            x1={center.x}
            y1={center.y}
            x2={x}
            y2={y}
            stroke="rgba(30,27,23,0.16)"
            strokeWidth="1"
          />
        );
      })}

      {/* Centro: "voce" / conselho */}
      <circle cx={center.x} cy={center.y} r="34" fill="#FCFBF7" stroke="#2B2823" strokeWidth="1" />
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
              fill="#FCFBF7"
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
              fill="#6B665D"
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
