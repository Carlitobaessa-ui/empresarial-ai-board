import pg from "pg";

const { Pool } = pg;

// Adapter para o lowdb que guarda o "documento" inteiro (db.data - agentes,
// conversas, mensagens, bundles, usuarios, assinaturas) como um unico JSONB
// em uma linha de uma tabela Postgres, em vez de um arquivo local no disco.
//
// Por que fazer assim em vez de migrar tudo para tabelas relacionais:
// hosts como o Render (plano free) tem filesystem efemero - qualquer
// alteracao feita pelo Painel Admin (editar agente, novo usuario, nova
// conversa) some no proximo restart/redeploy/spin-down. Trocar so o lugar
// onde o "arquivo" e gravado (de disco local para Postgres) resolve a perda
// de dados sem precisar reescrever nenhuma rota - elas continuam usando
// db.data.agents, db.write() etc. exatamente como antes.
export class PostgresJSONAdapter {
  constructor(connectionString) {
    const isLocal = /localhost|127\.0\.0\.1/.test(connectionString || "");
    this.pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
    this._ready = this._init();
  }

  async _init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  // Le o documento inteiro. Retorna null se a tabela ainda estiver vazia
  // (primeira vezl que o app roda contra este banco) - o lowdb entao usa
  // o defaultData e o db.js dispara o seed normalmente.
  async read() {
    await this._ready;
    const { rows } = await this.pool.query(
      "SELECT data FROM app_state WHERE id = 1"
    );
    if (rows.length === 0) return null;
    return rows[0].data;
  }

  // Grava o documento inteiro (upsert de uma unica linha, id fixo = 1).
  async write(data) {
    await this._ready;
    await this.pool.query(
      `INSERT INTO app_state (id, data, updated_at)
       VALUES (1, $1::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET data = $1::jsonb, updated_at = now()`,
      [JSON.stringify(data)]
    );
  }
}
