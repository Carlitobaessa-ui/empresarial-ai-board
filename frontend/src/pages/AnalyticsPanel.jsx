import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const EVENT_LABELS = {
  agent_created: "Agente criado",
  agent_updated: "Agente atualizado",
  agent_deleted: "Agente excluido",
  agent_message: "Mensagem de agente",
  user_signup: "Cadastro de usuario",
  user_login: "Login",
  summary_generated: "Resumo gerado",
};

function eventLabel(type) {
  return EVENT_LABELS[type] || type;
}

function StatCard({ label, value }) {
  return (
    <div className="hairline rounded-xl2 bg-surface px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="font-serif text-2xl text-ink mt-1">{value}</p>
    </div>
  );
}

// Grafico de barras simples em CSS puro (sem dependencia externa) para
// mensagens por dia nos ultimos 14 dias.
function MiniBarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.date}: ${d.count}`}>
          <div
            className="w-full bg-accent-dark/70 rounded-t"
            style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
          />
          <span className="text-[9px] text-ink-muted mt-1">{d.date.slice(8, 10)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPanel({ password }) {
  const [data, setData] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([api.adminAnalytics(password), api.adminAuditLog(password, { limit: 50 })])
      .then(([analytics, log]) => {
        setData(analytics);
        setAuditLog(log);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-xl text-ink">Analytics & auditoria</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Uso do app e trilha de auditoria dos ultimos 30 dias, calculados a
            partir do log de eventos do sistema.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="hairline rounded-lg px-3 py-1.5 text-xs text-ink hover:bg-surface transition disabled:opacity-50"
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {error && <p className="text-xs text-red-700 mb-3">{error}</p>}

      {loading && !data ? (
        <p className="text-sm text-ink-muted">Carregando analytics...</p>
      ) : data ? (
        <div className="space-y-6 max-w-3xl">
          <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Usuarios" value={data.totals.users} />
            <StatCard label="Agentes" value={data.totals.agents} />
            <StatCard label="Conversas" value={data.totals.conversations} />
            <StatCard label="Mensagens" value={data.totals.messages} />
            <StatCard label="Assinaturas ativas" value={data.totals.activeSubscriptions} />
          </section>

          <section className="hairline rounded-xl2 bg-surface p-4">
            <h2 className="text-sm font-medium text-ink mb-3">Mensagens por dia (14 dias)</h2>
            <MiniBarChart data={data.messagesPerDay} />
          </section>

          <section className="hairline rounded-xl2 bg-surface p-4">
            <h2 className="text-sm font-medium text-ink mb-3">Agentes mais usados (30 dias)</h2>
            {data.topAgents.length === 0 ? (
              <p className="text-xs text-ink-muted">Sem mensagens registradas ainda.</p>
            ) : (
              <div className="space-y-1.5">
                {data.topAgents.map((a) => (
                  <div key={a.agentId} className="flex items-center justify-between text-xs">
                    <span className="text-ink">{a.agentName}</span>
                    <span className="text-ink-muted">{a.messageCount} msgs</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="hairline rounded-xl2 bg-surface p-4">
              <h2 className="text-sm font-medium text-ink mb-2">Logins</h2>
              <p className="text-xs text-ink-muted">Últimos 7 dias: <span className="text-ink">{data.logins.last7d}</span></p>
              <p className="text-xs text-ink-muted">Últimos 30 dias: <span className="text-ink">{data.logins.last30d}</span></p>
            </div>
            <div className="hairline rounded-xl2 bg-surface p-4">
              <h2 className="text-sm font-medium text-ink mb-2">Atividade admin (30 dias)</h2>
              <p className="text-xs text-ink-muted">Agentes criados: <span className="text-ink">{data.adminActivity.agentsCreated}</span></p>
              <p className="text-xs text-ink-muted">Agentes atualizados: <span className="text-ink">{data.adminActivity.agentsUpdated}</span></p>
              <p className="text-xs text-ink-muted">Agentes excluídos: <span className="text-ink">{data.adminActivity.agentsDeleted}</span></p>
              <p className="text-xs text-ink-muted">Resumos gerados: <span className="text-ink">{data.adminActivity.summariesGenerated}</span></p>
            </div>
          </section>

          <section className="hairline rounded-xl2 bg-surface p-4">
            <h2 className="text-sm font-medium text-ink mb-3">Trilha de auditoria recente</h2>
            {auditLog.length === 0 ? (
              <p className="text-xs text-ink-muted">Nenhum evento registrado ainda.</p>
            ) : (
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {auditLog.map((e) => (
                  <div key={e.id} className="text-xs flex items-start gap-2 hairline-b pb-1.5">
                    <span className="shrink-0 text-ink-muted w-32">{formatDate(e.createdAt)}</span>
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-ink/10 text-ink-muted">
                      {eventLabel(e.type)}
                    </span>
                    <span className="text-ink-muted truncate">
                      {e.entityType ? `${e.entityType}: ${e.entityId}` : ""}
                      {e.meta?.agentName ? ` · ${e.meta.agentName}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
