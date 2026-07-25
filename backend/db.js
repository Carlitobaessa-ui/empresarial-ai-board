import { JSONFilePreset } from "lowdb/node";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import agentsSeed from "./data/agentsSeed.js";
import bundlesSeed from "./data/bundlesSeed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "board.json");

const defaultData = {
  agents: [],
  conversations: [],
  messages: [],
  bundles: [],
  users: [],
  subscriptions: [],
};

// Banco simples em arquivo JSON - sem dependencias nativas, funciona em
// qualquer sistema operacional apenas com `npm install`. Suficiente para o
// volume de dados de um app interno de agentes especialistas.
export const db = await JSONFilePreset(dbPath, defaultData);

// Garante que colecoes novas existam em bancos criados por uma versao anterior do app
for (const key of Object.keys(defaultData)) {
  if (!db.data[key]) db.data[key] = [];
}

async function seedAgentsIfEmpty() {
  if (db.data.agents.length > 0) return;

  const now = new Date().toISOString();
  db.data.agents = agentsSeed.map((agent) => ({
    id: nanoid(),
    active: 1,
    createdAt: now,
    updatedAt: now,
    ...agent,
  }));

  await db.write();
  console.log(`Seed: ${db.data.agents.length} agentes especialistas criados.`);
}

async function seedBundlesIfEmpty() {
  if (db.data.bundles.length > 0) return;

  const now = new Date().toISOString();
  db.data.bundles = bundlesSeed.map(({ agentSlugs, ...bundle }) => {
    const agentIds = agentSlugs
      .map((slug) => db.data.agents.find((a) => a.slug === slug)?.id)
      .filter(Boolean);
    return {
      id: nanoid(),
      agentIds,
      active: 1,
      createdAt: now,
      updatedAt: now,
      ...bundle,
    };
  });

  await db.write();
  console.log(`Seed: ${db.data.bundles.length} pacotes criados.`);
}

async function ensureConsultivoPrefix() {
  const prefix = "#consultivo ";
  let changed = false;

  for (const agent of db.data.agents) {
    if (!agent.name.startsWith(prefix)) {
      agent.name = `${prefix}${agent.name}`;
      changed = true;
    }
  }

  if (changed) {
    await db.write();
    console.log("Migracao: prefixo #consultivo adicionado ao nome dos agentes.");
  }
}

await seedAgentsIfEmpty();
await seedBundlesIfEmpty();
await ensureConsultivoPrefix();
