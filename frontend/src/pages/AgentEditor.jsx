import { useEffect, useState } from "react";
import AgentIcon from "../components/AgentIcon.jsx";
import { api } from "../lib/api.js";

const ICONS = [
  "board", "ceo", "cio", "cfo", "processos",
  "marketing", "vendas", "juridico", "rh", "seguranca",
  "esg", "logistica", "agro", "ecommerce", "atendimento",
  "inovacao", "dados", "produto", "auditoria", "governanca",
  "financas", "saude", "engenharia", "design",
];

const ICON_LABELS = {
  board: "Conselho",
  ceo: "Direção executiva",
  cio: "Tecnologia",
  cfo: "Finanças corporativas",
  processos: "Processos",
  marketing: "Marketing",
  vendas: "Vendas / comercial",
  juridico: "Jurídico",
  rh: "RH / pessoas",
  seguranca: "Segurança da informação",
  esg: "ESG / sustentabilidade",
  logistica: "Logística",
  agro: "Agronomia / agro",
  ecommerce: "E-commerce",
  atendimento: "Atendimento / CX",
  inovacao: "Inovação / P&D",
  dados: "Dados / analytics",
  produto: "Produto",
  auditoria: "Auditoria / compliance",
  governanca: "Governança",
  financas: "Finanças pessoais",
  saude: "Saúde / veterinária",
  engenharia: "Engenharia / construção",
  design: "Design / criativo",
};

const FIELD_HELP = {
  frameworks: "Metodologias e frameworks de mercado que este agente deve usar como referencia (um por linha).",
  mentalModels: "Modelos mentais / heuristicas de raciocinio que o agente deve aplicar.",
  methods: "Rotinas e metodos praticos de trabalho que o agente deve recomendar.",
  experience: "Sua experiencia profissional: cases reais, decisoes, erros e aprendizados. E o que torna o agente unico.",
  tone: "Como o agente deve se comunicar: tom de voz, formato de resposta, o que evitar.",
};

const emptyAgent = {
  slug: "",
  name: "",
  role: "",
  icon: "board",
  color: "#D97757",
  shortDescription: "",
  frameworks: "",
  mentalModels: "",
  methods: "",
  experience: "",
  tone: "",
  active: 1,
  priceMonthly: 0,
  stripePriceId: "",
};

export default function AgentEditor({ agent, isNew, onSave, onDelete, onCancel, saving, password }) {
  const [form, setForm] = useState(agent || emptyAgent);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    setForm(agent || emptyAgent);
    setHistory([]);
    setHistoryOpen(false);
    setHistoryError("");
  }, [agent]);

  function loadHistory() {
    if (!agent?.id) return;
    setHistoryLoading(true);
    setHistoryError("");
    api
      .getAgentHistory(agent.id, password)
      .then(setHistory)
      .catch((err) => setHistoryError(err.message))
      .finally(() => setHistoryLoading(false));
  }

  function toggleHistory() {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next && history.length === 0) loadHistory();
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink">
              {isNew ? "Novo agente especialista" : form.name}
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              {isNew
                ? "Defina a identidade e componha o conhecimento do novo agente."
                : "Componha aqui o conhecimento deste agente: frameworks, modelos mentais, metodos e sua experiencia."}
            </p>
          </div>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center hairline shrink-0"
            style={{ color: form.color }}
          >
            <AgentIcon icon={form.icon} className="w-6 h-6" />
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome do agente" help="Como o agente aparece para quem conversa com ele (sidebar, cards de planos, cabecalho do chat).">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
              placeholder="Ex.: CEO"
            />
          </Field>
          <Field label="Identificador (slug)" help="Codigo unico usado internamente (URLs e integracoes). Nao pode ser alterado depois de criado.">
            <input
              required
              disabled={!isNew}
              value={form.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="input disabled:opacity-60"
              placeholder="ex.: ceo"
            />
          </Field>
          <Field label="Papel / titulo" help="Subtitulo curto exibido junto ao nome (ex.: abaixo do nome no chat e nos cards).">
            <input
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="input"
              placeholder="Ex.: Direcao Executiva / CEO"
            />
          </Field>
          <Field
            label="Icone"
            help="Cada icone e um desenho de linha fina que representa o papel do agente. O nome de cada um fica sempre visivel abaixo do desenho."
          >
            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-1.5 max-w-xl"
              role="group"
              aria-label="Icone do agente"
            >
              {ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  aria-pressed={form.icon === icon}
                  onClick={() => update("icon", icon)}
                  className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg hairline transition hover:bg-accent-soft/20 ${
                    form.icon === icon ? "ring-1 ring-accent bg-accent-soft/20" : "bg-surface"
                  }`}
                >
                  <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: form.color }}>
                    <AgentIcon icon={icon} className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-[9.5px] leading-tight text-ink-muted text-center">
                    {ICON_LABELS[icon] || icon}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-muted mt-1.5">
              Icone selecionado: <span className="text-ink">{ICON_LABELS[form.icon] || form.icon}</span>
            </p>
          </Field>
          <Field label="Cor de identidade" help="Usada no icone, nas bordas de destaque e nas legendas com o nome do agente em toda a interface.">
            <input
              type="color"
              aria-label="Cor de identidade do agente"
              value={form.color}
              onChange={(e) => update("color", e.target.value)}
              className="h-10 w-16 hairline rounded-lg bg-transparent"
            />
          </Field>
          <Field label="Ativo no app de chat" help="Quando desativado, o agente some da lista de especialistas mas o historico de conversas existente e preservado.">
            <label className="flex items-center gap-2 text-sm text-ink-muted mt-2">
              <input
                type="checkbox"
                checked={Boolean(form.active)}
                onChange={(e) => update("active", e.target.checked ? 1 : 0)}
              />
              Visivel para empreendedores/gestores
            </label>
          </Field>
        </section>

        <Field label="Descricao curta (aparece nos cards)" help="Frase de 1-2 linhas que resume o que o agente faz - usada na Landing, nos planos e no inicio do chat.">
          <textarea
            rows={2}
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            className="input resize-none"
          />
        </Field>

        <hr className="hairline-t border-0" />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Preço mensal (R$)" help="Valor cobrado por mes ao assinar este agente individualmente (fora de pacotes).">
            <input
              type="number"
              min="0"
              step="0.01"
              value={((form.priceMonthly || 0) / 100).toFixed(2)}
              onChange={(e) => update("priceMonthly", Math.round(Number(e.target.value || 0) * 100))}
              className="input"
              placeholder="197.00"
            />
          </Field>
          <Field label="Stripe Price ID">
            <input
              value={form.stripePriceId || ""}
              onChange={(e) => update("stripePriceId", e.target.value)}
              className="input font-mono"
              placeholder="price_..."
            />
            <p className="text-[11px] text-ink-muted mt-1">
              Crie um Produto + Preço recorrente no Stripe Dashboard (modo teste) e cole o ID aqui.
            </p>
          </Field>
        </section>

        <hr className="hairline-t border-0" />

        <TextBlock
          label="Frameworks e metodologias"
          help={FIELD_HELP.frameworks}
          value={form.frameworks}
          onChange={(v) => update("frameworks", v)}
        />
        <TextBlock
          label="Modelos mentais"
          help={FIELD_HELP.mentalModels}
          value={form.mentalModels}
          onChange={(v) => update("mentalModels", v)}
        />
        <TextBlock
          label="Metodos de trabalho"
          help={FIELD_HELP.methods}
          value={form.methods}
          onChange={(v) => update("methods", v)}
        />
        <TextBlock
          label="Sua experiencia profissional (26 anos)"
          help={FIELD_HELP.experience}
          value={form.experience}
          onChange={(v) => update("experience", v)}
          rows={8}
          highlight
        />
        <TextBlock
          label="Tom e estilo de resposta"
          help={FIELD_HELP.tone}
          value={form.tone}
          onChange={(v) => update("tone", v)}
        />

        {!isNew && (
          <section className="hairline rounded-xl2 bg-surface p-4">
            <button
              type="button"
              onClick={toggleHistory}
              aria-expanded={historyOpen}
              className="w-full flex items-center justify-between text-left"
            >
              <span>
                <span className="text-sm font-medium text-ink block">Histórico de alterações</span>
                <span className="text-[11px] text-ink-muted block mt-0.5">
                  Quem criou o agente e quais campos mudaram em cada edição, com data e valor antes/depois.
                </span>
              </span>
              <span className="text-xs text-ink-muted shrink-0 ml-3">
                <span aria-hidden="true">{historyOpen ? "▲ " : "▼ "}</span>
                {historyOpen ? "ocultar" : "ver histórico"}
              </span>
            </button>
            {historyOpen && (
              <div className="mt-3">
                {historyLoading ? (
                  <p className="text-xs text-ink-muted">Carregando histórico...</p>
                ) : historyError ? (
                  <p className="text-xs text-red-700">{historyError}</p>
                ) : history.length === 0 ? (
                  <p className="text-xs text-ink-muted">Nenhuma alteração registrada para este agente ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {history.map((h) => (
                      <div key={h.id} className="text-xs hairline-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-ink/10 text-ink-muted">
                            {h.type === "agent_created"
                              ? "criado"
                              : h.type === "agent_updated"
                                ? "atualizado"
                                : h.type}
                          </span>
                          <span className="text-ink-muted">
                            {new Date(h.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        {h.changedFields && h.changedFields.length > 0 && (
                          <ul className="mt-1 space-y-0.5 pl-1">
                            {h.changedFields.map((c) => (
                              <li key={c.field} className="text-ink-muted">
                                <span className="text-ink">{c.field}</span>:{" "}
                                <span className="line-through">{String(c.before ?? "").slice(0, 60) || "(vazio)"}</span>
                                {" → "}
                                <span>{String(c.after ?? "").slice(0, 60) || "(vazio)"}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <div className="flex items-center justify-between pt-4 hairline-t">
          <div>
            {!isNew && (
              <button
                type="button"
                onClick={() => onDelete(form)}
                className="text-xs text-red-700 hover:underline"
              >
                Excluir agente
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="text-sm px-4 py-2 rounded-lg hairline text-ink-muted hover:text-ink">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-sm px-5 py-2 rounded-lg bg-ink text-cream disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar agente"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({ label, help, children }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink-muted">{label}</label>
      {help && <p className="text-[11px] text-ink-muted mt-0.5">{help}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function TextBlock({ label, help, value, onChange, rows = 5, highlight = false }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink">{label}</label>
      </div>
      <p className="text-xs text-ink-muted mt-0.5 mb-1.5">{help}</p>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input font-mono text-[13px] leading-relaxed ${
          highlight ? "border-accent/40 bg-accent-soft/20" : ""
        }`}
      />
    </div>
  );
}
