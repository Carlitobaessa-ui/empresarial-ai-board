import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { askAgent, isConfigured } from "../services/anthropic.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { hasAccessToAgent } from "../services/access.js";

const router = Router();

router.get("/status", (_req, res) => {
  res.json({ configured: isConfigured() });
});

// Envia uma mensagem do usuario para o agente e retorna a resposta da IA.
router.post("/", requireAuth, async (req, res) => {
  const { conversationId, message } = req.body || {};
  if (!conversationId || !message) {
    return res.status(400).json({ error: "conversationId e message sao obrigatorios." });
  }

  const conversation = db.data.conversations.find(
    (c) => c.id === conversationId && c.userId === req.user.id
  );
  if (!conversation) return res.status(404).json({ error: "Conversa nao encontrada." });

  const agent = db.data.agents.find((a) => a.id === conversation.agentId);
  if (!agent) return res.status(404).json({ error: "Agente nao encontrado." });

  if (!hasAccessToAgent(req.user.id, agent.id)) {
    return res.status(402).json({
      error: `Sua assinatura para "${agent.name}" não está mais ativa.`,
      requiresSubscription: true,
      agentId: agent.id,
    });
  }

  const now = new Date().toISOString();

  const userMessage = {
    id: nanoid(),
    conversationId,
    role: "user",
    content: message,
    createdAt: now,
  };
  db.data.messages.push(userMessage);
  await db.write();

  const history = db.data.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
    .map((m) => ({ role: m.role, content: m.content }));

  try {
    const replyText = await askAgent({ agent, history });

    const assistantMessage = {
      id: nanoid(),
      conversationId,
      role: "assistant",
      content: replyText,
      createdAt: new Date().toISOString(),
    };
    db.data.messages.push(assistantMessage);
    conversation.updatedAt = assistantMessage.createdAt;
    await db.write();

    res.json({ userMessage, assistantMessage });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro ao consultar o agente de IA." });
  }
});

export default router;
