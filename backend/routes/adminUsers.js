import { Router } from "express";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Lista todos os usuarios cadastrados com o historico completo de conversas
// e mensagens trocadas com os agentes - uso exclusivo do Painel Admin, para
// acompanhar como as pessoas estao usando o app.
router.get("/", requireAdmin, (_req, res) => {
  const users = db.data.users.map((user) => {
    const conversations = db.data.conversations
      .filter((c) => c.userId === user.id)
      .map((c) => {
        const agent = db.data.agents.find((a) => a.id === c.agentId);
        const messages = db.data.messages
          .filter((m) => m.conversationId === c.id)
          .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
          .map(({ id, role, content, createdAt, authorName }) => ({ id, role, content, createdAt, authorName }));

        return {
          id: c.id,
          agentId: c.agentId,
          agentName: agent?.name || "Agente removido",
          title: c.title,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          messages,
        };
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

    const { passwordHash, ...safeUser } = user;

    return {
      ...safeUser,
      conversationCount: conversations.length,
      messageCount: conversations.reduce((sum, c) => sum + c.messages.length, 0),
      conversations,
    };
  });

  // Usuarios mais recentes primeiro
  users.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json(users);
});

export default router;
