// Pacotes (bundles) iniciais - preco sugerido, ajuste no Painel Admin.
// agentSlugs referencia o campo "slug" dos agentes em agentsSeed.js e e
// resolvido para os IDs reais na hora do seed (ver db.js).
const bundlesSeed = [
  {
    slug: "conselho-completo",
    name: "Conselho Completo",
    description: "Acesso a todos os 5 agentes especialistas com um unico plano.",
    agentSlugs: ["conselho", "ceo", "cio", "cfo", "processos"],
    priceMonthly: 69700, // R$ 697,00/mes (~37% de desconto vs. preco somado)
    stripePriceId: null,
  },
  {
    slug: "essencial",
    name: "Essencial (CEO + CFO)",
    description: "Os dois agentes mais usados por quem toca o dia a dia do negocio.",
    agentSlugs: ["ceo", "cfo"],
    priceMonthly: 34700, // R$ 347,00/mes
    stripePriceId: null,
  },
];

export default bundlesSeed;
