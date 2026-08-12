import { Link, useLocation } from "react-router-dom";
import AgentIcon from "./AgentIcon.jsx";
import { useAuth } from "../lib/auth.jsx";

function formatBRL(cents) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Sidebar({
  agents,
  unlockedAgentIds = [],
  selectedAgentId,
  onSelectAgent,
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onManageBilling,
}) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-72 shrink-0 hairline-b lg:hairline-b-0 lg:border-r border-line flex flex-col h-full bg-cream">
      <div className="px-5 py-4 hairline-b flex items-center justify-between">
        <Link to="/" className="font-serif text-[15px] text-ink">
          Advisory & Governança
        </Link>
        <Link
          to="/admin"
          className={`text-xs px-2 py-1 rounded-md hairline text-ink-muted hover:text-ink transition ${
            location.pathname.startsWith("/admin") ? "bg-accent-soft text-ink" : ""
          }`}
        >
          Admin
        </Link>
      </div>

      <div className="px-4 pt-4 pb-1 text-xs uppercase tracking-wide text-ink-muted">
        Agentes especialistas
      </div>
      <p className="px-4 pb-2 text-[10.5px] leading-snug text-ink-muted">
        Escolha um agente para conversar. O preço aparece nos que você ainda não assina.
      </p>
      <div className="px-3 space-y-1.5 pb-3">
        {agents.map((agent) => {
          const unlocked = unlockedAgentIds.includes(agent.id);
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition hover:bg-surface ${
                selectedAgentId === agent.id ? "bg-surface hairline" : ""
              } ${!unlocked ? "opacity-60" : ""}`}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center hairline shrink-0"
                style={{ color: agent.color }}
              >
                <AgentIcon icon={agent.icon} className="w-4 h-4" />
              </span>
              <span className="text-sm text-ink truncate flex-1">{agent.name}</span>
              {!unlocked && (
                <span className="text-[10px] text-ink-muted shrink-0">
                  {formatBRL(agent.priceMonthly || 0)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="hairline-t px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-ink-muted">Conversas</span>
        <button
          onClick={onNewConversation}
          className="text-xs text-accent-dark hover:underline"
        >
          + Nova
        </button>
      </div>
      <p className="px-4 pb-2 text-[10.5px] leading-snug text-ink-muted">
        Histórico de conversas com o agente selecionado acima.
      </p>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {conversations.length === 0 && (
          <p className="text-xs text-ink-muted px-2.5 py-2">Nenhuma conversa ainda.</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectConversation(c)}
            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs text-ink-muted hover:bg-surface transition truncate ${
              selectedConversationId === c.id ? "bg-surface hairline text-ink" : ""
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="hairline-t px-4 py-3">
        <p className="text-xs text-ink truncate">{user?.name}</p>
        <p className="text-[11px] text-ink-muted truncate mb-2">{user?.email}</p>
        <div className="flex gap-3">
          <button onClick={onManageBilling} className="text-[11px] text-accent-dark hover:underline">
            Gerenciar assinatura
          </button>
          <button onClick={logout} className="text-[11px] text-ink-muted hover:underline">
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
