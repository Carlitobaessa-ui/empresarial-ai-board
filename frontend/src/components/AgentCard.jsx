import AgentIcon from "./AgentIcon.jsx";

export default function AgentCard({ agent, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl2 hairline bg-surface transition
        hover:shadow-soft hover:border-ink/20
        ${selected ? "ring-1 ring-accent border-accent/40" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center hairline"
          style={{ color: agent.color }}
        >
          <AgentIcon icon={agent.icon} className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-[15px] leading-tight text-ink truncate">
              {agent.name}
            </h3>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">{agent.role}</p>
          {agent.shortDescription && (
            <p className="text-xs text-ink-muted/90 mt-1.5 line-clamp-2">
              {agent.shortDescription}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
