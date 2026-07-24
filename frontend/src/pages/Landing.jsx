import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import BoardDiagram from "../components/BoardDiagram.jsx";
import AgentIcon from "../components/AgentIcon.jsx";

export default function Landing() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.listAgents().then(setAgents).catch(() => setAgents([]));
  }, []);

  return (
    <div className="min-h-full bg-cream">
      <header className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-dark mb-4">
          Conselho de Agentes Especialistas
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
          Um conselho executivo de IA,
          <br className="hidden md:block" /> disponivel a qualquer hora.
        </h1>
        <p className="text-ink-muted mt-5 max-w-xl mx-auto text-[15px] leading-relaxed">
          Frameworks, modelos mentais e metodos consolidados em 26 anos de
          experiencia, transformados em agentes especialistas para
          empreendedores de startups e gestores de empresas conversarem a
          qualquer momento.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            to="/pricing"
            className="bg-ink text-cream text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Ver planos e assinar
          </Link>
          <Link
            to="/app"
            className="hairline text-ink text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-surface transition"
          >
            Já sou assinante
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-10">
        <BoardDiagram agents={agents} />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="hairline bg-surface rounded-xl2 p-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center hairline mb-3"
                style={{ color: agent.color }}
              >
                <AgentIcon icon={agent.icon} className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-ink">{agent.name}</h3>
              <p className="text-xs text-ink-muted mt-1">{agent.role}</p>
              <p className="text-sm text-ink-muted mt-2.5 leading-relaxed">
                {agent.shortDescription}
              </p>
              {typeof agent.priceMonthly === "number" && (
                <p className="text-xs text-accent-dark mt-3">
                  {(agent.priceMonthly / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                  /mês
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="hairline-t py-6 text-center text-xs text-ink-muted">
        Composto no Painel Admin com frameworks, modelos mentais, metodos e
        experiencia profissional.{" "}
        <Link to="/admin" className="hover:underline">
          Área administrativa
        </Link>
      </footer>
    </div>
  );
}
