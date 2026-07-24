import AgentIcon from "./AgentIcon.jsx";

export default function Message({ message, agent }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-ink text-cream rounded-xl2 rounded-tr-sm px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.content}
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
      </div>
    </div>
  );
}
