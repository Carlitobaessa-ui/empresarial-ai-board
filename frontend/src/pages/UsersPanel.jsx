import { useState } from "react";
import { api } from "../lib/api.js";

const NAME_STORAGE_KEY = "board_admin_display_name";

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

function roleLabel(m) {
  if (m.role === "user") return "Usuário";
  if (m.role === "consultant") return m.authorName ? `Consultor · ${m.authorName}` : "Consultor";
  return "Agente";
}

function roleClasses(m) {
  if (m.role === "user") return "bg-accent-dark/10 text-accent-dark";
  if (m.role === "consultant") return "bg-accent-soft text-accent-dark";
  return "bg-ink/10 text-ink-muted";
}

// Caixa para o consultor humano (admin) enviar uma mensagem dentro da
// conversa do usuario com o agente. A mensagem entra no historico com o
// nome de quem escreveu e o agente de IA passa a considera-la ao responder
// as proximas mensagens do usuario.
function ConsultReplyBox({ conversationId, authorName, onSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (sending) return;
    const content = text.trim();
    if (!content) {
      setError("Digite uma mensagem antes de enviar.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const adminPassword = sessionStorage.getItem("board_admin_password") || "";
      await api.adminSendConsultMessage(
        conversationId,
        { content, authorName },
        adminPassword
      );
      setText("");
      onSent?.();
    } catch (err) {
      setError(err.message || "Falha ao enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pt-2 mt-2 hairline-t">
      <div className="flex items-end gap-2">
        <textarea
          rows={2}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            authorName
              ? `Responder como ${authorName}...`
              : "Defina seu nome acima antes de responder..."
          }
          disabled={!authorName}
          className="input flex-1 resize-none text-xs disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !text.trim() || !authorName}
          className="shrink-0 bg-accent-dark text-cream text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-30 transition"
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-700 mt-1">{error}</p>}
    </div>
  );
}

function ConversationThread({ conversation, authorName, onSent }) {
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
              <span className={`inline-block px-1.5 py-0.5 rounded mr-2 ${roleClasses(m)}`}>
                {roleLabel(m)}
              </span>
              <span className="text-ink-muted">{formatDate(m.createdAt)}</span>
              <p className="text-ink whitespace-pre-wrap mt-0.5">{m.content}</p>
            </div>
          ))}
        </div>
      )}
      <ConsultReplyBox conversationId={conversation.id} authorName={authorName} onSent={onSent} />
    </div>
  );
}

function UserCard({ user, authorName, onSent }) {
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
              <ConversationThread
                key={c.id}
                conversation={c}
                authorName={authorName}
                onSent={onSent}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function UsersPanel({ users, loading, onRefresh }) {
  const [query, setQuery] = useState("");
  const [authorName, setAuthorName] = useState(
    () => localStorage.getItem(NAME_STORAGE_KEY) || ""
  );

  function handleNameChange(value) {
    setAuthorName(value);
    localStorage.setItem(NAME_STORAGE_KEY, value);
  }

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
            Veja o histórico de cada usuário e, se precisar, entre na conversa
            como consultor para conduzir o andamento da interação.
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

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="input max-w-sm"
        />
        <input
          value={authorName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Seu nome (aparece nas respostas como consultor)"
          className="input max-w-sm"
        />
      </div>

      {loading && users.length === 0 ? (
        <p className="text-sm text-ink-muted">Carregando usuários...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">Nenhum usuário encontrado.</p>
      ) : (
        <div className="space-y-2 max-w3xl">
          {filtered.map((u) => (
            <UserCard key={u.id} user={u} authorName={authorName} onSent={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
