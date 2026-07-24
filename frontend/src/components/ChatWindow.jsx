import { useEffect, useRef, useState } from "react";
import AgentIcon from "./AgentIcon.jsx";
import Message from "./Message.jsx";
import { api } from "../lib/api.js";

export default function ChatWindow({ agent, conversation, onConversationUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }
    api
      .getConversation(conversation.id)
      .then((data) => setMessages(data.messages || []))
      .catch(() => setMessages([]));
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !conversation || sending) return;

    setError("");
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, role: "user", content: text },
    ]);
    setSending(true);

    try {
      const { assistantMessage } = await api.sendMessage({
        conversationId: conversation.id,
        message: text,
      });
      setMessages((prev) => [...prev, assistantMessage]);
      onConversationUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-muted text-sm">
        Selecione um agente especialista para comecar.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <div className="hairline-b px-6 py-4 flex items-center gap-3 bg-surface/60">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center hairline"
          style={{ color: agent.color }}
        >
          <AgentIcon icon={agent.icon} className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif text-lg text-ink leading-tight">{agent.name}</h2>
          <p className="text-xs text-ink-muted">{agent.role}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-lg mx-auto text-center mt-10">
            <p className="text-sm text-ink-muted">
              {agent.shortDescription}
            </p>
            <p className="text-xs text-ink-muted/70 mt-3">
              Comece descrevendo o contexto da sua empresa e a decisao ou
              desafio que voce quer discutir com este agente.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <Message key={m.id} message={m} agent={agent} />
        ))}

        {sending && (
          <div className="flex items-center gap-1 pl-9 text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-muted typing-dot" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-ink-muted typing-dot" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-ink-muted typing-dot" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-6 pb-2 text-xs text-red-700">{error}</div>
      )}

      <form onSubmit={handleSend} className="hairline-t p-4">
        <div className="flex items-end gap-2 bg-surface hairline rounded-xl2 px-3 py-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={`Escreva para ${agent.name}...`}
            className="flex-1 resize-none bg-transparent outline-none text-sm text-ink placeholder:text-ink-muted/70 max-h-32 py-1.5"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="shrink-0 bg-ink text-cream text-xs font-medium px-4 py-2 rounded-lg disabled:opacity-30 transition"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
