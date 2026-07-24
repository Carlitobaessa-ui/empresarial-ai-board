import { useEffect, useState } from "react";
import AgentIcon from "../components/AgentIcon.jsx";

const ICONS = ["board", "ceo", "cio", "cfo", "processos"];

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

export default function AgentEditor({ agent, isNew, onSave, onDelete, onCancel, saving }) {
  const [form, setForm] = useState(agent || emptyAgent);

  useEffect(() => {
    setForm(agent || emptyAgent);
  }, [agent]);

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
          <Field label="Nome do agente">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
              placeholder="Ex.: CEO"
            />
          </Field>
          <Field label="Identificador (slug)">
            <input
              required
              disabled={!isNew}
              value={form.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="input disabled:opacity-60"
              placeholder="ex.: ceo"
            />
          </Field>
          <Field label="Papel / titulo">
            <input
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="input"
              placeholder="Ex.: Direcao Executiva / CEO"
            />
          </Field>
          <Field label="Icone">
            <div className="flex gap-2">
              {ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => update("icon", icon)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center hairline transition ${
                    form.icon === icon ? "ring-1 ring-accent" : ""
                  }`}
                  style={{ color: form.color }}
                >
                  <AgentIcon icon={icon} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Cor de identidade">
            <input
              type="color"
              value={form.color}
              onChange={(e) => update("color", e.target.value)}
              className="h-10 w-16 hairline rounded-lg bg-transparent"
            />
          </Field>
          <Field label="Ativo no app de chat">
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

        <Field label="Descricao curta (aparece nos cards)">
          <textarea
            rows={2}
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            className="input resize-none"
          />
        </Field>

        <hr className="hairline-t border-0" />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Preço mensal (R$)">
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

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink-muted">{label}</label>
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
