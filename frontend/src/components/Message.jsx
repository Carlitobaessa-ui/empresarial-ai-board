import AgentIcon from "./AgentIcon.jsx";

// Renderiza os anexos (arquivo ou audio) de uma mensagem. Imagens em formato
// suportado aparecem como preview; audio como player; qualquer outro arquivo
// vira um link de download.
function Attachments({ attachments }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {attachments.map((a) => {
        const isImage = a.type === "file" && /^image\//.test(a.mimeType || "");

        if (isImage && a.dataUrl) {
          return (
            <img
              key={a.id}
              src={a.dataUrl}
              alt={a.name || "imagem anexada"}
              className="max-w-[220px] max-h-[220px] rounded-lg hairline object-cover"
            />
          );
        }

        if (a.type === "audio" && a.dataUrl) {
          return <audio key={a.id} controls src={a.dataUrl} className="max-w-[240px] h-9" />;
        }

        return (
          <a
            key={a.id}
            href={a.dataUrl}
            download={a.name}
            className="flex items-center gap-1.5 text-[12px] underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            📎 {a.name}
          </a>
        );
      })}
    </div>
  );
}

export default function Message({ message, agent }) {
  const isUser = message.role === "user";
  const isConsultant = message.role === "consultant";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-ink text-cream rounded-xl2 rounded-tr-sm px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.content}
          <Attachments attachments={message.attachments} />
        </div>
      </div>
    );
  }

  // Mensagem inserida por um consultor humano (via Painel Admin) para
  // conduzir a conversa quando necessario. Fica visualmente distinta da
  // resposta do agente de IA, com o nome de quem escreveu em destaque.
  if (isConsultant) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center bg-accent-soft text-accent-dark text-[11px] font-semibold mt-0.5">
          {(message.authorName || "C").trim().slice(0, 1).toUpperCase()}
        </div>
        <div className="max-w-[75%]">
          <p className="text-[11px] text-accent-dark font-medium mb-1">
            {message.authorName || "Consultor"}
          </p>
          <div className="bg-accent-soft/50 border border-accent-dark/25 rounded-xl2 rounded-tl-sm px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-ink">
            {message.content}
            <Attachments attachments={message.attachments} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center hairline mt-0.5"
        style={{ color: agent?.color || "#D97757" }}
      >
        <AgentIcon icon={agent?.icon} className="w-4 h-4" />
      </div>
      <div className="max-w-[75%] bg-surface hairline rounded-xl2 rounded-tl-sm px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap text-ink">
        {message.content}
        <Attachments attachments={message.attachments} />
      </div>
    </div>
  );
}
