// Biblioteca de icones de linha fina (thin-line), monocromaticos - um simbolo
// tecnico por tipo de agente/comite. Todos usam stroke="currentColor" para
// herdar a cor do agente via CSS, viewBox 24x24 e strokeWidth ~1.3, seguindo
// a mesma linguagem visual em toda a biblioteca (traco fino, geometria
// precisa, sem preenchimento exceto pequenos nucleos/pontos de destaque) -
// no estilo visual do Claude AI (sofisticado, tecnologico, minimalista).
// Cada icone e um pequeno desenho conceitual do "modelo" daquele papel:
// orbita/atomo para governanca colegiada, bussola para direcao executiva,
// chip de circuito para tecnologia, curva de crescimento para financas,
// ciclo continuo para processos, balanca para juridico, escudo para
// seguranca/governanca, radar para dados, e assim por diante.
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


    // Marketing: alvo de precisao com seta - posicionamento e alcance.
    case "marketing":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.2" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
          <path d="M18.6 5.4 L13.7 10.3" />
          <path d="M14.6 5.6 L18.6 5.4 L18.4 9.4" />
        </svg>
      );

    // Vendas/comercial: duas forcas convergindo para um ponto de acordo.
    case "vendas":
      return (
        <svg {...common}>
          <path d="M4 8 L10 12 L4 16" />
          <path d="M20 8 L14 12 L20 16" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );

    // Juridico: balanca de precisao.
    case "juridico":
      return (
        <svg {...common}>
          <line x1="12" y1="4" x2="12" y2="19" />
          <line x1="6" y1="7" x2="18" y2="7" />
          <line x1="6" y1="7" x2="6" y2="10.6" />
          <line x1="18" y1="7" x2="18" y2="10.6" />
          <circle cx="6" cy="13" r="2.4" />
          <circle cx="18" cy="13" r="2.4" />
          <line x1="9" y1="19" x2="15" y2="19" />
        </svg>
      );

    // RH / pessoas: rede de nos - estrutura e conexao entre pessoas.
    case "rh":
      return (
        <svg {...common}>
          <circle cx="12" cy="6.4" r="2.1" />
          <circle cx="6.4" cy="17" r="2.1" />
          <circle cx="17.6" cy="17" r="2.1" />
          <line x1="12" y1="8.5" x2="7.5" y2="15.1" />
          <line x1="12" y1="8.5" x2="16.5" y2="15.1" />
          <line x1="8.5" y1="17" x2="15.5" y2="17" />
        </svg>
      );

    // Seguranca da informacao: escudo com nucleo.
    case "seguranca":
      return (
        <svg {...common}>
          <path d="M12 3.6 L19 6.4 V12 c0 4.6 -3 7.6 -7 8.4 c-4 -0.8 -7 -3.8 -7 -8.4 V6.4 Z" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
        </svg>
      );

    // ESG / sustentabilidade: folha dentro de um ciclo.
    case "esg":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.4" />
          <ellipse cx="12" cy="12" rx="4.6" ry="2.3" transform="rotate(-45 12 12)" />
          <line x1="8.8" y1="15.2" x2="15.2" y2="8.8" />
        </svg>
      );

    // Logistica: rota entre dois pontos com carga em transito.
    case "logistica":
      return (
        <svg {...common}>
          <circle cx="5" cy="18" r="1.6" />
          <circle cx="19" cy="6" r="1.6" />
          <path d="M6.4 16.8 C 10 12.8, 14 11.2, 17.6 7.2" />
          <rect x="10.5" y="10.5" width="3" height="3" rx="0.6" transform="rotate(20 12 12)" />
        </svg>
      );

    // Agro/agronomia: broto emergindo do solo.
    case "agro":
      return (
        <svg {...common}>
          <line x1="12" y1="20" x2="12" y2="12" />
          <path d="M12 12 C 9 12, 7.5 9.5, 8 6.5 C 11 7, 12 9, 12 12 Z" />
          <path d="M12 12 C 15 12, 16.5 9.5, 16 6.5 C 13 7, 12 9, 12 12 Z" />
          <line x1="8" y1="20" x2="16" y2="20" />
        </svg>
      );

    // E-commerce: sacola com linha de leitura/escaneamento.
    case "ecommerce":
      return (
        <svg {...common}>
          <path d="M6 8 H18 L17 20 H7 Z" />
          <path d="M9 8 V6.6 a3 3 0 0 1 6 0 V8" />
          <line x1="6.6" y1="12" x2="17.4" y2="12" />
        </svg>
      );

    // Atendimento / CX: balao de fala com confirmacao.
    case "atendimento":
      return (
        <svg {...common}>
          <rect x="4" y="5.5" width="16" height="10.5" rx="2" />
          <path d="M8 16 L8 19.5 L11.5 16" />
          <path d="M8.2 10.6 L10.6 13 L15.8 7.8" />
        </svg>
      );

    // Inovacao / P&D: lampada com filamento em cruz.
    case "inovacao":
      return (
        <svg {...common}>
          <circle cx="12" cy="10.5" r="5" />
          <line x1="9.6" y1="15" x2="14.4" y2="15" />
          <line x1="10.2" y1="17" x2="13.8" y2="17" />
          <line x1="12" y1="7.4" x2="12" y2="13.6" />
          <line x1="8.9" y1="10.5" x2="15.1" y2="10.5" />
        </svg>
      );

    // Dados / analytics: radar com sinais.
    case "dados":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.2" />
          <circle cx="12" cy="12" r="5.2" />
          <circle cx="12" cy="12" r="2.2" />
          <line x1="12" y1="12" x2="18.5" y2="7" />
          <circle cx="9" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );

    // Produto: camadas empilhadas (roadmap / backlog).
    case "produto":
      return (
        <svg {...common}>
          <rect x="5" y="4.8" width="14" height="4.2" rx="0.9" />
          <rect x="5" y="10.2" width="14" height="4.2" rx="0.9" />
          <rect x="5" y="15.6" width="14" height="4.2" rx="0.9" />
        </svg>
      );

    // Auditoria / compliance: lupa sobre checklist.
    case "auditoria":
      return (
        <svg {...common}>
          <line x1="5" y1="5.5" x2="15" y2="5.5" />
          <line x1="5" y1="9" x2="13" y2="9" />
          <line x1="5" y1="12.5" x2="11" y2="12.5" />
          <circle cx="15.5" cy="15.5" r="3.6" />
          <line x1="18.1" y1="18.1" x2="20.6" y2="20.6" />
        </svg>
      );

    // Governanca: escudo com marca de conformidade.
    case "governanca":
      return (
        <svg {...common}>
          <path d="M12 3.6 L19 6.4 V12 c0 4.6 -3 7.6 -7 8.4 c-4 -0.8 -7 -3.8 -7 -8.4 V6.4 Z" />
          <line x1="12" y1="9.4" x2="12" y2="14.6" />
          <line x1="9.4" y1="12" x2="14.6" y2="12" />
          <line x1="10.1" y1="10.1" x2="13.9" y2="13.9" />
          <line x1="13.9" y1="10.1" x2="10.1" y2="13.9" />
        </svg>
      );

    // Financas pessoais: carteira com nucleo de valor.
    case "financas":
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="11" rx="1.6" />
          <line x1="4" y1="10.5" x2="20" y2="10.5" />
          <circle cx="16.4" cy="13.7" r="1.4" />
        </svg>
      );

    // Saude / veterinaria: pulso vital dentro de um ciclo.
    case "saude":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.2" />
          <path d="M5.6 12 H9 L10.6 8.4 L13 15.6 L14.6 12 H18.4" />
        </svg>
      );

    // Engenharia / construcao: compasso tecnico.
    case "engenharia":
      return (
        <svg {...common}>
          <path d="M12 4 L6 19" />
          <path d="M12 4 L18 19" />
          <line x1="9" y1="12.6" x2="15" y2="12.6" />
          <circle cx="12" cy="4" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="6" cy="19.6" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="18" cy="19.6" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );

    // Design / criativo: pena de nanquim.
    case "design":
      return (
        <svg {...common}>
          <path d="M5 19 L8.5 18 L18 8.5 L15.5 6 L6 15.5 Z" />
          <circle cx="6.5" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
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
