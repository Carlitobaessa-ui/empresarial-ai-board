// Icones de linha fina (thin-line), monocromaticos, um simbolo por tipo de agente.
// Todos usam stroke="currentColor" para herdar a cor do agente via CSS.
export default function AgentIcon({ icon, className = "w-6 h-6", strokeWidth = 1.4 }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (icon) {
    // Conselho: mesa redonda com pessoas ao redor (hub-and-spoke)
    case "board":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.4" />
          <circle cx="12" cy="4.5" r="1.6" />
          <circle cx="19.5" cy="12" r="1.6" />
          <circle cx="12" cy="19.5" r="1.6" />
          <circle cx="4.5" cy="12" r="1.6" />
          <line x1="12" y1="6.1" x2="12" y2="9.6" />
          <line x1="17.9" y1="12" x2="14.4" y2="12" />
          <line x1="12" y1="17.9" x2="12" y2="14.4" />
          <line x1="6.1" y1="12" x2="9.6" y2="12" />
        </svg>
      );

    // CEO: bussola (direcao estrategica)
    case "ceo":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.25" />
          <path d="M14.6 9.4 L12.9 12.9 L9.4 14.6 L11.1 11.1 Z" />
          <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );

    // CIO: rede / circuito
    case "cio":
      return (
        <svg {...common}>
          <circle cx="5.5" cy="6" r="1.7" />
          <circle cx="18.5" cy="6" r="1.7" />
          <circle cx="5.5" cy="18" r="1.7" />
          <circle cx="18.5" cy="18" r="1.7" />
          <circle cx="12" cy="12" r="1.9" />
          <line x1="6.9" y1="7.1" x2="10.5" y2="10.6" />
          <line x1="17.1" y1="7.1" x2="13.5" y2="10.6" />
          <line x1="6.9" y1="16.9" x2="10.5" y2="13.4" />
          <line x1="17.1" y1="16.9" x2="13.5" y2="13.4" />
        </svg>
      );

    // CFO: barras de crescimento
    case "cfo":
      return (
        <svg {...common}>
          <line x1="4" y1="20" x2="20" y2="20" />
          <rect x="6" y="13" width="3" height="7" />
          <rect x="10.5" y="9" width="3" height="11" />
          <rect x="15" y="4.5" width="3" height="15.5" />
        </svg>
      );

    // Processos: fluxo com engrenagem
    case "processos":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.1" />
          <path d="M12 5.2 v2 M12 16.8 v2 M18.8 12 h-2 M7.2 12 h-2 M17 7 l-1.4 1.4 M8.4 15.6 L7 17 M17 17 l-1.4-1.4 M8.4 8.4 L7 7" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.25" />
        </svg>
      );
  }
}
