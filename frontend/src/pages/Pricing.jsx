import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";
import AgentIcon from "../components/AgentIcon.jsx";

function formatBRL(cents) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [unlockedAgentIds, setUnlockedAgentIds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listAgents().then(setAgents);
    api.listBundles().then(setBundles);
    if (user) {
      api.mySubscriptions().then((d) => setUnlockedAgentIds(d.unlockedAgentIds));
    }
  }, [user]);

  async function handleSubscribe(type, id) {
    setError("");
    if (!user) {
      navigate("/signup");
      return;
    }
    setLoadingId(id);
    try {
      const { url } = await api.checkout({ type, id });
      window.location.href = url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  const isUnlocked = (agentId) => unlockedAgentIds.includes(agentId);
  const bundleUnlocked = (bundle) => bundle.agentIds.every((id) => unlockedAgentIds.includes(id));

  return (
    <div className="min-h-full bg-cream">
      <header className="max-w-5xl mx-auto px-6 pt-14 pb-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-dark mb-3">Planos</p>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">
          Assine só os agentes que fazem sentido para você
        </h1>
        <p className="text-ink-muted mt-4 max-w-lg mx-auto text-sm">
          Assinatura mensal, cancele quando quiser. Cada agente pode ser assinado
          individualmente, ou você economiza assinando um pacote.
        </p>
        {error && <p className="text-xs text-red-700 mt-3">{error}</p>}
      </header>

      {bundles.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-6">
          <h2 className="text-xs uppercase tracking-wide text-ink-muted mb-3">Pacotes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="hairline bg-surface rounded-xl2 p-5 flex flex-col"
                style={bundleUnlocked(bundle) ? { borderColor: "#D97757" } : undefined}
              >
                <h3 className="font-serif text-lg text-ink">{bundle.name}</h3>
                <p className="text-xs text-ink-muted mt-1 flex-1">{bundle.description}</p>
                <div className="flex items-center gap-1 my-3">
                  {bundle.agentIds.map((id) => {
                    const a = agents.find((ag) => ag.id === id);
                    if (!a) return null;
                    return (
                      <span
                        key={id}
                        className="w-6 h-6 rounded-full flex items-center justify-center hairline"
                        style={{ color: a.color }}
                        title={a.name}
                      >
                        <AgentIcon icon={a.icon} className="w-3.5 h-3.5" />
                      </span>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-serif text-xl text-ink">
                    {formatBRL(bundle.priceMonthly)}
                    <span className="text-xs text-ink-muted font-sans">/mês</span>
                  </span>
                  <button
                    onClick={() => handleSubscribe("bundle", bundle.id)}
                    disabled={loadingId === bundle.id || bundleUnlocked(bundle)}
                    className="text-xs px-4 py-2 rounded-lg bg-ink text-cream disabled:opacity-50"
                  >
                    {bundleUnlocked(bundle) ? "Assinado" : loadingId === bundle.id ? "..." : "Assinar pacote"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-xs uppercase tracking-wide text-ink-muted mb-3">Agentes individuais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="hairline bg-surface rounded-xl2 p-5 flex flex-col">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center hairline mb-3"
                style={{ color: agent.color }}
              >
                <AgentIcon icon={agent.icon} className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-ink">{agent.name}</h3>
              <p className="text-xs text-ink-muted mt-1 flex-1">{agent.shortDescription}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-serif text-xl text-ink">
                  {formatBRL(agent.priceMonthly || 0)}
                  <span className="text-xs text-ink-muted font-sans">/mês</span>
                </span>
                <button
                  onClick={() => handleSubscribe("agent", agent.id)}
                  disabled={loadingId === agent.id || isUnlocked(agent.id)}
                  className="text-xs px-4 py-2 rounded-lg hairline text-ink disabled:opacity-50 hover:bg-cream"
                >
                  {isUnlocked(agent.id) ? "Assinado" : loadingId === agent.id ? "..." : "Assinar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="hairline-t py-6 text-center text-xs text-ink-muted">
        <Link to="/app" className="hover:underline">
          Ir para o app de chat
        </Link>
      </footer>
    </div>
  );
}
