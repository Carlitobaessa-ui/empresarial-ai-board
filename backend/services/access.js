import { db } from "../db.js";

// Modo de testes: com FREE_ACCESS=true nas variaveis de ambiente do backend,
// todos os agentes ficam liberados para qualquer usuario logado, sem exigir
// assinatura. Serve para testar o app de ponta a ponta sem passar pelo Stripe.
//
// Para REATIVAR a cobranca, basta mudar FREE_ACCESS para "false" (ou remover a
// variavel) no painel do Render e fazer o redeploy - nenhuma alteracao de
// codigo e necessaria.
const FREE_ACCESS = process.env.FREE_ACCESS === "true";

// Resolve quais agentes um usuario pode conversar, com base nas assinaturas
// ativas (diretas por agente, ou via pacote/bundle que inclua o agente).
export function getUnlockedAgentIds(userId) {
  if (FREE_ACCESS) {
    return new Set(db.data.agents.map((a) => a.id));
  }

  const activeSubs = db.data.subscriptions.filter(
    (s) => s.userId === userId && s.status === "active"
  );

  const agentIds = new Set();

  for (const sub of activeSubs) {
    if (sub.type === "agent") {
      agentIds.add(sub.refId);
    } else if (sub.type === "bundle") {
      const bundle = db.data.bundles.find((b) => b.id === sub.refId);
      bundle?.agentIds.forEach((id) => agentIds.add(id));
    }
  }

  return agentIds;
}

export function hasAccessToAgent(userId, agentId) {
  if (FREE_ACCESS) return true;
  return getUnlockedAgentIds(userId).has(agentId);
}
