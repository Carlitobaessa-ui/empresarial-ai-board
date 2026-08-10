import { Router } from "express";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// Trilha de auditoria bruta - eventos mais recentes primeiro, com filtros
// opcionais por tipo e por entidade. Usado pela tela de Analytics & Auditoria
// do Painel Admin.
router.get("/audit-log", requireAdmin, (req, res) => {
  const { type, entityType, limit } = req.query;
  let events = [...db.data.events].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (type) events = events.filter((e) => e.type === type);
  if (entityType) events = events.filter((e) => e.entityType === entityType);

  const max = Math.min(Number(limit) || 100, 500);
  res.json(events.slice(0, max));
});

// Analytics de uso: quais agentes sao mais usados, atividade por dia,
// atividade administrativa recente. Calculado em memoria a partir dos
// eventos e das colecoes principais - suficiente para o volume atual do app.
router.get("/analytics", requireAdmin, (_req, res) => {
  const since30 = daysAgo(30);
  const since7 = daysAgo(7);

  const events = db.data.events;
  const recentMessages = events.filter((e) => e.type === "agent_message" && e.createdAt >= since30);

  const byAgent = new Map();
  for (const e of recentMessages) {
    const key = e.entityId;
    const name = e.meta?.agentName || "Agente";
    const cur = byAgent.get(key) || { agentId: key, agentName: name, messageCount: 0 };
    cur.messageCount += 1;
    byAgent.set(key, cur);
  }
  const topAgents = [...byAgent.values()].sort((a, b) => b.messageCount - a.messageCount).slice(0, 10);

  const messagesPerDay = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    const dateKey = dayStart.toISOString().slice(0, 10);
    const count = events.filter(
      (e) => e.type === "agent_message" && e.createdAt.slice(0, 10) === dateKey
    ).length;
    messagesPerDay.push({ date: dateKey, count });
  }

  const adminActivity = {
    agentsCreated: events.filter((e) => e.type === "agent_created" && e.createdAt >= since30).length,
    agentsUpdated: events.filter((e) => e.type === "agent_updated" && e.createdAt >= since30).length,
    agentsDeleted: events.filter((e) => e.type === "agent_deleted" && e.createdAt >= since30).length,
    summariesGenerated: events.filter((e) => e.type === "summary_generated" && e.createdAt >= since30).length,
  };

  const logins = {
    last7d: events.filter((e) => e.type === "user_login" && e.createdAt >= since7).length,
    last30d: events.filter((e) => e.type === "user_login" && e.createdAt >= since30).length,
  };

  const totals = {
    users: db.data.users.length,
    agents: db.data.agents.length,
    conversations: db.data.conversations.length,
    messages: db.data.messages.length,
    activeSubscriptions: db.data.subscriptions.filter((s) => s.status === "active").length,
  };

  res.json({ totals, topAgents, messagesPerDay, adminActivity, logins });
});

export default router;
