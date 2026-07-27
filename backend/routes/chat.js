import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { askAgent, isConfigured } from "../services/anthropic.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { hasAccessToAgent } from "../services/access.js";
import { sanitizeAttachments } from "../services/attachments.js";

const router = Router();

router.get("/status", (_req, res) => {
  res.json({ configured: isConfigured() });
});

// Envia uma mensagem do usuario para o agente e retorna a resposta da IA.
// A mensagem pode conter apenas texto, apenas anexos (arquivo/audio), ou os dois.
router.post("/", requireAuth, async (req, res) => {
  const { conversationId, message, attachments: rawAttachments } = req.body || {};
  const text = typeof message === "string" ? message.trim() : "";

  let attachments;
  try {
    attachments = sanitizeAttachments(rawAttachments);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  if (!conversationId || (!text && attachments.length === 0)) {
    return res.status(400).json({
      error: "conversationId e message (ou ao menos um anexo) sao obrigatorios.",
    });
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
    content: text,
    attachments: attachments.map((a) => ({ ...a, id: a.id || nanoid() })),
    createdAt: now,
  };
  db.data.messages.push(userMessage);
  await db.write();

  // Mensagens de um consultor humano (inseridas pelo Painel Admin) entram no
  // historico como uma observacao identificada, para o agente de IA levar em
  // conta o que o consultor disse ao responder a proxima mensagem do usuario.
  const history = db.data.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
    .map((m) => ({
      role: m.role,
      content:
        m.role === "consultant"
          ? `[Observacao enviada por um consultor humano, ${m.authorName || "Consultor"}, que acompanha esta conversa]: ${m.content}`
          : m.content,
      attachments: m.attachments || [],
    }));

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
