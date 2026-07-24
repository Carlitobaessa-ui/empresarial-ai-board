import { db } from "../db.js";

// Resolve quais agentes um usuario pode conversar, com base nas assinaturas
// ativas (diretas por agente, ou via pacote/bundle que inclua o agente).
export function getUnlockedAgentIds(userId) {
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
  return getUnlockedAgentIds(userId).has(agentId);
}
