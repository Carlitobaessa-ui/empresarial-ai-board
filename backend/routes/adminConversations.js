import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { sanitizeAttachments } from "../services/attachments.js";
import { summarizeConversation } from "../services/anthropic.js";
import { logEvent } from "../services/events.js";

const router = Router();

// Permite que o consultor humano (admin) envie uma mensagem dentro da
// conversa de qualquer usuario com um agente, para conduzir/guiar a
// interacao quando necessario. A mensagem fica marcada com role
// "consultant" e o nome de quem escreveu (authorName), aparece no chat do
// usuario com esse nome, e entra no historico que o agente de IA usa para
// responder as PROXIMAS mensagens - ou seja, a IA continua respondendo
// normalmente depois, ja considerando o que o consultor disse. Assim como no
// chat do usuario, o consultor tambem pode anexar um arquivo ou audio.
router.post("/:id/messages", requireAdmin, async (req, res) => {
  const { content, authorName, attachments: rawAttachments } = req.body || {};
  const text = typeof content === "string" ? content.trim() : "";

  let attachments;
  try {
    attachments = sanitizeAttachments(rawAttachments);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  if (!text && attachments.length === 0) {
    return res.status(400).json({ error: "A mensagem nao pode ficar vazia." });
  }

  const conversation = db.data.conversations.find((c) => c.id === req.params.id);
  if (!conversation) return res.status(404).json({ error: "Conversa nao encontrada." });

  const now = new Date().toISOString();
  const message = {
    id: nanoid(),
    conversationId: conversation.id,
    role: "consultant",
    authorName: (authorName || "Consultor").trim(),
    content: text,
    attachments: attachments.map((a) => ({ ...a, id: a.id || nanoid() })),
    createdAt: now,
  };

  db.data.messages.push(message);
  conversation.updatedAt = now;
  await db.write();

  res.status(201).json(message);
});

// Gera (ou regenera) um resumo executivo da conversa usando IA - usado pelo
// Painel Admin para acompanhar rapidamente o andamento de uma conversa sem
// ler mensagem por mensagem.
router.post("/:id/summary", requireAdmin, async (req, res) => {
  const conversation = db.data.conversations.find((c) => c.id === req.params.id);
  if (!conversation) return res.status(404).json({ error: "Conversa nao encontrada." });

  const agent = db.data.agents.find((a) => a.id === conversation.agentId);
  if (!agent) return res.status(404).json({ error: "Agente nao encontrado." });

  const messages = db.data.messages
    .filter((m) => m.conversationId === conversation.id)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

  if (messages.length === 0) {
    return res.status(400).json({ error: "Esta conversa ainda nao tem mensagens para resumir." });
  }

  try {
    const summary = await summarizeConversation({ agent, messages });
    conversation.summary = summary;
    conversation.summaryGeneratedAt = new Date().toISOString();
    await db.write();

    await logEvent({
      type: "summary_generated",
      actor: req.ip,
      entityType: "conversation",
      entityId: conversation.id,
      meta: { source: "admin" },
    });

    res.json({ summary: conversation.summary, summaryGeneratedAt: conversation.summaryGeneratedAt });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro ao gerar resumo." });
  }
});

export default router;
