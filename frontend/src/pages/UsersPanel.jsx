import { useState } from "react";

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

function providerLabel(provider) {
  if (provider === "google") return "Google";
  if (provider === "apple") return "Apple";
  return "E-mail/senha";
}

function ConversationThread({ conversation }) {
  return (
    <div className="hairline rounded-lg p-3 bg-cream/60">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-ink font-medium">{conversation.agentName}</span>
        <span className="text-[11px] text-ink-muted">
          {formatDate(conversation.updatedAt)}
        </span>
      </div>
      {conversation.messages.length === 0 ? (
        <p className="text-xs text-ink-muted">Conversa criada, sem mensagens ainda.</p>
      ) : (
        <div className="space-y-2">
          {conversation.messages.map((m) => (
            <div key={m.id} className="text-xs">
              <span
                className={`inline-block px-1.5 py-0.5 rounded mr-2 ${
                  m.role === "user"
                    ? "bg-accent-dark/10 text-accent-dark"
                    : "bg-ink/10 text-ink-muted"
                }`}
              >
                {m.role === "user" ? "Usuário" : "Agente"}
              </span>
              <span className="text-ink-muted">{formatDate(m.createdAt)}</span>
              <p className="text-ink whitespace-pre-wrap mt-0.5">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserCard({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="hairline rounded-xl2 bg-surface overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-cream/50 transition"
      >
        <div>
          <p className="text-sm text-ink font-medium">{user.name}</p>
          <p className="text-xs text-ink-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-ink/10 text-ink-muted">
            {providerLabel(user.provider)}
          </span>
          <span className="text-[11px] text-ink-muted">
            {user.conversationCount} conversa{user.conversationCount === 1 ? "" : "s"} ·{" "}
            {user.messageCount} msg{user.messageCount === 1 ? "" : "s"}
          </span>
          <span className="text-xs text-ink-muted">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 hairline-t pt-3">
          <p className="text-[11px] text-ink-muted">
            Cadastrado em {formatDate(user.createdAt)}
          </p>
          {user.conversations.length === 0 ? (
            <p className="text-xs text-ink-muted">
              Este usuário ainda não iniciou nenhuma conversa com um agente.
            </p>
          ) : (
            user.conversations.map((c) => (
              <ConversationThread key={c.id} conversation={c} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function UsersPanel({ users, loading, onRefresh }) {
  const [query, setQuery] = useState("");

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-serif text-xl text-ink">Usuários e conversas</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Veja todas as pessoas cadastradas no app e o histórico de mensagens
            trocadas com cada agente.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="hairline rounded-lg px-3 py-1.5 text-xs text-ink hover:bg-surface transition disabled:opacity-50 shrink-0"
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome ou e-mail..."
        className="input mb-4 max-w-sm"
      />

      {loading && users.length === 0 ? (
        <p className="text-sm text-ink-muted">Carregando usuários...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">Nenhum usuário encontrado.</p>
      ) : (
        <div className="space-y-2 max-w-3xl">
          {filtered.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}
