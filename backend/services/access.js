import { db } from "../db.js";

// Estado da cobranca fica salvo no banco (db.data.settings.billingEnabled) para
// poder ser ligado/desligado pelo Painel Admin, sem redeploy.
//
// A variavel de ambiente FREE_ACCESS=true so define o valor INICIAL, na primeira
// vez que o app roda. Depois disso, o Painel Admin manda.
function ensureSettings() {
  if (!db.data.settings || Array.isArray(db.data.settings)) {
    db.data.settings = {};
  }
  if (typeof db.data.settings.billingEnabled !== "boolean") {
    db.data.settings.billingEnabled = process.env.FREE_ACCESS !== "true";
  }
  return db.data.settings;
}

// true  = cobranca ativa (usuario precisa de assinatura para usar um agente)
// false = acesso liberado (todos os agentes abertos, modo de testes)
export function isBillingEnabled() {
  return ensureSettings().billingEnabled;
}

export async function setBillingEnabled(enabled) {
  ensureSettings().billingEnabled = Boolean(enabled);
  await db.write();
  return db.data.settings.billingEnabled;
}

// Resolve quais agentes um usuario pode conversar, com base nas assinaturas
// ativas (diretas por agente, ou via pacote/bundle que inclua o agente).
export function getUnlockedAgentIds(userId) {
  if (!isBillingEnabled()) {
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
  if (!isBillingEnabled()) return true;
  return getUnlockedAgentIds(userId).has(agentId);
}
