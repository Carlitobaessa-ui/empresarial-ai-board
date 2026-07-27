import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import agentsSeed from "./data/agentsSeed.js";
import bundlesSeed from "./data/bundlesSeed.js";
import { PostgresJSONAdapter } from "./pgStore.js";

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

// Em producao (Render), o filesystem local e efemero - qualquer alteracao
// feita pelo Painel Admin (editar agente, novo usuario, nova conversa) some
// no proximo restart/redeploy/spin-down do servico. Por isso, quando existe
// uma DATABASE_URL configurada (Postgres gerenciado - Neon, Supabase, Render
// Postgres etc.), os dados sao gravados la em vez de em um arquivo local.
// Sem DATABASE_URL (ex.: rodando localmente na sua maquina), continua
// usando o arquivo JSON simples, sem precisar de Postgres instalado.
export const usingPostgres = Boolean(process.env.DATABASE_URL);

const adapter = usingPostgres
  ? new PostgresJSONAdapter(process.env.DATABASE_URL)
  : new JSONFile(dbPath);

// Banco simples (documento unico) - sem dependencias nativas quando local,
// funciona em qualquer sistema operacional apenas com `npm install`.
// Suficiente para o volume de dados de um app interno de agentes
// especialistas.
export const db = new Low(adapter, defaultData);
await db.read();
if (db.data === null) {
  db.data = defaultData;
  await db.write();
}

console.log(
  usingPostgres
    ? "Banco de dados: Postgres (persistente)."
    : "Banco de dados: arquivo JSON local (backend/db.json) - dados NAO sobrevivem a redeploys em hosts com filesystem efemero."
);

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

async function ensureConsultivoSuffix() {
  const prefix = "#consultivo ";
  const suffix = " #consultivo";
  let changed = false;

  for (const agent of db.data.agents) {
    let name = agent.name;

    // Remove versoes antigas com o marcador no inicio (migracao anterior)
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      changed = true;
    }

    if (!name.endsWith(suffix)) {
      name = `${name}${suffix}`;
      changed = true;
    }

    agent.name = name;
  }

  if (changed) {
    await db.write();
    console.log("Migracao: marcador #consultivo movido para o final do nome dos agentes.");
  }
}

await seedAgentsIfEmpty();
await seedBundlesIfEmpty();
await ensureConsultivoSuffix();
