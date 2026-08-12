import { useEffect, useState } from "react";
import AgentIcon from "../components/AgentIcon.jsx";

const emptyBundle = {
  name: "",
  description: "",
  agentIds: [],
  priceMonthly: 0,
  stripePriceId: "",
  active: 1,
};

export default function BundleEditor({ bundle, isNew, agents, onSave, onDelete, onCancel, saving }) {
  const [form, setForm] = useState(bundle || emptyBundle);

  useEffect(() => {
    setForm(bundle || emptyBundle);
  }, [bundle]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAgent(agentId) {
    setForm((prev) => ({
      ...prev,
      agentIds: prev.agentIds.includes(agentId)
        ? prev.agentIds.filter((id) => id !== agentId)
        : [...prev.agentIds, agentId],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const sumOfParts = agents
    .filter((a) => form.agentIds.includes(a.id))
    .reduce((sum, a) => sum + (a.priceMonthly || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-ink">
            {isNew ? "Novo pacote" : form.name}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Um pacote agrupa vários agentes em uma única assinatura, geralmente com desconto.
          </p>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-ink-muted">Nome do pacote</label>
          <p className="text-[11px] text-ink-muted mt-0.5">Como o pacote aparece na página de planos.</p>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input mt-1.5"
            placeholder="Ex.: Conselho Completo"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-ink-muted">Descrição</label>
          <p className="text-[11px] text-ink-muted mt-0.5">Frase curta explicando o que esse pacote oferece, exibida abaixo do nome nos planos.</p>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="input mt-1.5 resize-none"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-ink-muted">Agentes incluídos</label>
          <p className="text-[11px] text-ink-muted mt-0.5">Marque os agentes que quem assinar este pacote passa a ter acesso.</p>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {agents.map((agent) => {
              const checked = form.agentIds.includes(agent.id);
              return (
                <label
                  key={agent.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg hairline cursor-pointer text-sm ${
                    checked ? "bg-accent-soft/30 border-accent/40" : "bg-surface"
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleAgent(agent.id)} />
                  <span style={{ color: agent.color }}>
                    <AgentIcon icon={agent.icon} className="w-4 h-4" />
                  </span>
                  <span className="truncate">{agent.name}</span>
                </label>
              );
            })}
          </div>
          {form.agentIds.length > 0 && (
            <p className="text-[11px] text-ink-muted mt-2">
              Soma dos agentes avulsos: {(sumOfParts / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-ink-muted">Preço do pacote (R$)</label>
            <p className="text-[11px] text-ink-muted mt-0.5">Valor mensal cobrado pelo pacote completo (geralmente menor que a soma dos agentes avulsos).</p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={((form.priceMonthly || 0) / 100).toFixed(2)}
              onChange={(e) => update("priceMonthly", Math.round(Number(e.target.value || 0) * 100))}
              className="input mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-ink-muted">Stripe Price ID</label>
            <p className="text-[11px] text-ink-muted mt-0.5">Crie um Produto + Preço recorrente no Stripe Dashboard e cole o ID aqui.</p>
            <input
              value={form.stripePriceId || ""}
              onChange={(e) => update("stripePriceId", e.target.value)}
              className="input mt-1.5 font-mono"
              placeholder="price_..."
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={Boolean(form.active)}
              onChange={(e) => update("active", e.target.checked ? 1 : 0)}
            />
            Visível na página de planos
          </label>
          <p className="text-[11px] text-ink-muted mt-0.5 ml-6">Quando desmarcado, o pacote fica oculto para novas assinaturas, mas quem ja assinou continua com acesso.</p>
        </div>

        <div className="flex items-center justify-between pt-4 hairline-t">
          <div>
            {!isNew && (
              <button type="button" onClick={() => onDelete(form)} className="text-xs text-red-700 hover:underline">
                Excluir pacote
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="text-sm px-4 py-2 rounded-lg hairline text-ink-muted hover:text-ink">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || form.agentIds.length === 0}
              className="text-sm px-5 py-2 rounded-lg bg-ink text-cream disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar pacote"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
