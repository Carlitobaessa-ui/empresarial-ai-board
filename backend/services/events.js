import { nanoid } from "nanoid";
import { db } from "../db.js";

// Registro central de eventos - alimenta a trilha de auditoria (quem alterou
// o que e quando), o historico de versoes de agentes, e o analytics de uso
// do Painel Admin. E um unico log; cada consumidor filtra pelo campo "type".
//
// Tipos usados hoje: agent_created, agent_updated, agent_deleted,
// user_signup, user_login, agent_message, summary_generated.
export async function logEvent({ type, actor, entityType, entityId, before, after, meta }) {
  try {
    const event = {
      id: nanoid(),
      type,
      actor: actor || "desconhecido",
      entityType: entityType || null,
      entityId: entityId || null,
      before: before ?? null,
      after: after ?? null,
      meta: meta || null,
      createdAt: new Date().toISOString(),
    };
    db.data.events.push(event);

    // Evita que o log cresca sem limite em bancos de longa duracao - mantem
    // os eventos mais recentes, suficiente para auditoria e analytics de um
    // app deste porte.
    const MAX_EVENTS = 5000;
    if (db.data.events.length > MAX_EVENTS) {
      db.data.events = db.data.events.slice(db.data.events.length - MAX_EVENTS);
    }

    await db.write();
  } catch (err) {
    // Uma falha ao registrar o evento nunca deve quebrar a acao principal.
    console.error("Falha ao registrar evento de auditoria:", err);
  }
}
