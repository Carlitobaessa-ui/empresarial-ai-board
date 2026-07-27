// Icones de linha fina (thin-line), monocromaticos, um simbolo por tipo de agente.
// Todos usam stroke="currentColor" para herdar a cor do agente via CSS.
// Cada icone e um desenho tecnico que representa o "modelo" daquele papel
// (orbita/atomo para governanca coletiva, bussola de precisao para direcao
// executiva, chip de circuito para tecnologia, tendencia de crescimento para
// financas, ciclo continuo para processos), num traco fino e sofisticado.
export default function AgentIcon({ icon, className = "w-6 h-6", strokeWidth = 1.3 }) {
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
    // Conselho: orbita/atomo - multiplas visoes (eletrons) girando em torno
    // de um nucleo comum (a decisao colegiada).
    case "board":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="8.6" ry="3.3" />
          <circle cx="20.6" cy="12" r="0.9" fill="currentColor" stroke="none" />
          <g transform="rotate(60 12 12)">
            <ellipse cx="12" cy="12" rx="8.6" ry="3.3" />
            <circle cx="20.6" cy="12" r="0.9" fill="currentColor" stroke="none" />
          </g>
          <g transform="rotate(120 12 12)">
            <ellipse cx="12" cy="12" rx="8.6" ry="3.3" />
            <circle cx="20.6" cy="12" r="0.9" fill="currentColor" stroke="none" />
          </g>
          <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
        </svg>
      );

    // CEO: bussola de precisao (instrumento de direcao estrategica), com
    // marcas cardeais como um instrumento de navegacao.
    case "ceo":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.4" />
          <line x1="12" y1="3.6" x2="12" y2="5.3" />
          <line x1="12" y1="20.4" x2="12" y2="18.7" />
          <line x1="3.6" y1="12" x2="5.3" y2="12" />
          <line x1="20.4" y1="12" x2="18.7" y2="12" />
          <path d="M14.7 9.3 L12.9 12.9 L9.3 14.7 L11.1 11.1 Z" />
          <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );

    // CIO: chip de circuito - arquitetura, sistemas e tecnologia.
    case "cio":
      return (
        <svg {...common}>
          <rect x="7.8" y="7.8" width="8.4" height="8.4" rx="1.1" />
          <line x1="10" y1="7.8" x2="10" y2="5.5" />
          <line x1="12" y1="7.8" x2="12" y2="5.5" />
          <line x1="14" y1="7.8" x2="14" y2="5.5" />
          <line x1="10" y1="16.2" x2="10" y2="18.5" />
          <line x1="12" y1="16.2" x2="12" y2="18.5" />
          <line x1="14" y1="16.2" x2="14" y2="18.5" />
          <line x1="7.8" y1="10" x2="5.5" y2="10" />
          <line x1="7.8" y1="12" x2="5.5" y2="12" />
          <line x1="7.8" y1="14" x2="5.5" y2="14" />
          <line x1="16.2" y1="10" x2="18.5" y2="10" />
          <line x1="16.2" y1="12" x2="18.5" y2="12" />
          <line x1="16.2" y1="14" x2="18.5" y2="14" />
          <path d="M10.5 12 h3 M12 10.5 v3" />
        </svg>
      );

    // CFO: barras de crescimento com curva de tendencia ascendente.
    case "cfo":
      return (
        <svg {...common}>
          <line x1="4" y1="20" x2="20" y2="20" />
          <rect x="6" y="14.5" width="2.6" height="5.5" />
          <rect x="10.7" y="10.5" width="2.6" height="9.5" />
          <rect x="15.4" y="6" width="2.6" height="14" />
          <path d="M5.5 12.8 L10.8 8.2 L14 10.3 L19.3 4.6" />
          <path d="M15.8 4.6 L19.3 4.6 L19.3 8.1" />
        </svg>
      );

    // Processos: ciclo continuo (PDCA) em torno de uma etapa central.
    case "processos":
      return (
        <svg {...common}>
          <path d="M20.3 4.2 v5 h-5" />
          <path d="M4 12.2 a8 8 0 0 1 13.4-5.9 l2.9 2.9" />
          <path d="M3.7 19.8 v-5 h5" />
          <path d="M20 11.8 a8 8 0 0 1-13.4 5.9 l-2.9-2.9" />
          <rect x="10.6" y="10.6" width="2.8" height="2.8" rx="0.5" />
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
