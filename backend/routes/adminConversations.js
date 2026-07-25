import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Permite que o consultor humano (admin) envie uma mensagem dentro da
// conversa de qualquer usuario com um agente, para conduzir/guiar a
// interacao quando necessario. A mensagem fica marcada com role
// "consultant" e o nome de quem escreveu (authorName), aparece no chat do
// usuario com esse nome, e entra no historico que o agente de IA usa para
// responder as PROXIMAS mensagens - ou seja, a IA continua respondendo
// normalmente depois, ja considerando o que o consultor disse.
router.post("/:id/messages", requireAdmin, async (req, res) => {
  const { content, authorName } = req.body || {};
  if (!content || !content.trim()) {
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
    content: content.trim(),
    createdAt: now,
  };

  db.data.messages.push(message);
  conversation.updatedAt = now;
  await db.write();

  res.status(201).json(message);
});

export default router;
