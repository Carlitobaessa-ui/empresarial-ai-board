import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { logEvent } from "../services/events.js";

const router = Router();

const EDITABLE_FIELDS = [
  "name",
  "role",
  "icon",
  "color",
  "shortDescription",
  "frameworks",
  "mentalModels",
  "methods",
  "experience",
  "tone",
  "active",
];

// Lista agentes ativos (usado pelo app de chat) ou todos (?all=1, usado pelo admin)
router.get("/", (req, res) => {
  const showAll = req.query.all === "1";
  const list = showAll
    ? db.data.agents
    : db.data.agents.filter((a) => a.active);
  res.json([...list].sort((a, b) => a.name.localeCompare(b.name)));
});

router.get("/:id", (req, res) => {
  const agent = db.data.agents.find((a) => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: "Agente nao encontrado." });
  res.json(agent);
});

// Historico de alteracoes deste agente (trilha de auditoria + versoes) -
// admin-only. Cada entrada mostra quais campos mudaram e o valor antes/depois,
// para investigar rapidamente "o que mudou e quando" sem depender de memoria.
router.get("/:id/history", requireAdmin, (req, res) => {
  const events = db.data.events
    .filter((e) => e.entityType === "agent" && e.entityId === req.params.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((e) => {
      let changedFields = [];
      if (e.type === "agent_updated" && e.before && e.after) {
        changedFields = EDITABLE_FIELDS.filter(
          (f) => JSON.stringify(e.before[f]) !== JSON.stringify(e.after[f])
        ).map((f) => ({ field: f, before: e.before[f], after: e.after[f] }));
      }
      return {
        id: e.id,
        type: e.type,
        actor: e.actor,
        createdAt: e.createdAt,
        changedFields,
      };
    });
  res.json(events);
});

// Criar novo agente especialista (admin)
router.post("/", requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.slug) {
    return res.status(400).json({ error: "name e slug sao obrigatorios." });
  }
  if (db.data.agents.some((a) => a.slug === body.slug)) {
    return res.status(400).json({ error: "Ja existe um agente com esse identificador (slug)." });
  }

  const now = new Date().toISOString();
  const agent = {
    id: nanoid(),
    slug: body.slug,
    name: body.name,
    role: body.role || "",
    icon: body.icon || "board",
    color: body.color || "#D97757",
    shortDescription: body.shortDescription || "",
    frameworks: body.frameworks || "",
    mentalModels: body.mentalModels || "",
    methods: body.methods || "",
    experience: body.experience || "",
    tone: body.tone || "",
    active: 1,
    createdAt: now,
    updatedAt: now,
  };

  db.data.agents.push(agent);
  await db.write();
  await logEvent({
    type: "agent_created",
    actor: req.ip,
    entityType: "agent",
    entityId: agent.id,
    after: agent,
  });
  res.status(201).json(agent);
});

// Atualizar agente (admin) - e aqui que o conhecimento e composto/refinado
router.put("/:id", requireAdmin, async (req, res) => {
  const agent = db.data.agents.find((a) => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: "Agente nao encontrado." });

  const before = { ...agent };

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) agent[field] = req.body[field];
  }
  agent.updatedAt = new Date().toISOString();

  await db.write();
  await logEvent({
    type: "agent_updated",
    actor: req.ip,
    entityType: "agent",
    entityId: agent.id,
    before,
    after: { ...agent },
  });
  res.json(agent);
});

// Excluir agente (admin)
router.delete("/:id", requireAdmin, async (req, res) => {
  const idx = db.data.agents.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Agente nao encontrado." });

  const [removed] = db.data.agents.splice(idx, 1);
  await db.write();
  await logEvent({
    type: "agent_deleted",
    actor: req.ip,
    entityType: "agent",
    entityId: req.params.id,
    before: removed,
  });
  res.json({ ok: true });
});

export default router;
