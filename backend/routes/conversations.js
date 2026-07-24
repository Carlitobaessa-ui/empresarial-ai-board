import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { hasAccessToAgent } from "../services/access.js";

const router = Router();

// Lista as conversas do usuario logado, opcionalmente filtradas por agente
router.get("/", requireAuth, (req, res) => {
  const { agentId } = req.query;
  let list = db.data.conversations.filter((c) => c.userId === req.user.id);

  if (agentId) list = list.filter((c) => c.agentId === agentId);

  list = [...list].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  res.json(list);
});

// Cria nova conversa com um agente - exige assinatura ativa para aquele agente
router.post("/", requireAuth, async (req, res) => {
  const { agentId, title } = req.body || {};
  if (!agentId) return res.status(400).json({ error: "agentId é obrigatório." });

  const agent = db.data.agents.find((a) => a.id === agentId);
  if (!agent) return res.status(404).json({ error: "Agente não encontrado." });

  if (!hasAccessToAgent(req.user.id, agentId)) {
    return res.status(402).json({
      error: `Você ainda não tem uma assinatura ativa para "${agent.name}".`,
      requiresSubscription: true,
      agentId,
    });
  }

  const now = new Date().toISOString();
  const conversation = {
    id: nanoid(),
    agentId,
    userId: req.user.id,
    title: title || `Conversa com ${agent.name}`,
    createdAt: now,
    updatedAt: now,
  };

  db.data.conversations.push(conversation);
  await db.write();
  res.status(201).json(conversation);
});

// Busca conversa + mensagens (apenas do proprio usuario)
router.get("/:id", requireAuth, (req, res) => {
  const conversation = db.data.conversations.find(
    (c) => c.id === req.params.id && c.userId === req.user.id
  );
  if (!conversation) return res.status(404).json({ error: "Conversa não encontrada." });

  const messages = db.data.messages
    .filter((m) => m.conversationId === req.params.id)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

  res.json({ ...conversation, messages });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const conversation = db.data.conversations.find(
    (c) => c.id === req.params.id && c.userId === req.user.id
  );
  if (!conversation) return res.status(404).json({ error: "Conversa não encontrada." });

  db.data.messages = db.data.messages.filter((m) => m.conversationId !== req.params.id);
  db.data.conversations = db.data.conversations.filter((c) => c.id !== req.params.id);
  await db.write();
  res.json({ ok: true });
});

export default router;
