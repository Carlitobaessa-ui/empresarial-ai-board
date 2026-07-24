import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import AgentIcon from "../components/AgentIcon.jsx";

function formatBRL(cents) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ChatApp() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [unlockedAgentIds, setUnlockedAgentIds] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [apiConfigured, setApiConfigured] = useState(true);

  useEffect(() => {
    api.listAgents().then((list) => {
      setAgents(list);
      if (list.length) setSelectedAgent(list[0]);
    });
    api.chatStatus().then((s) => setApiConfigured(s.configured));
    api.mySubscriptions().then((d) => setUnlockedAgentIds(d.unlockedAgentIds));
  }, []);

  const isUnlocked = (agentId) => unlockedAgentIds.includes(agentId);

  const refreshConversations = useCallback((agentId) => {
    if (!agentId) return;
    api.listConversations({ agentId }).then(setConversations);
  }, []);

  useEffect(() => {
    if (!selectedAgent) return;
    setSelectedConversation(null);
    if (isUnlocked(selectedAgent.id)) {
      refreshConversations(selectedAgent.id);
    } else {
      setConversations([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent, unlockedAgentIds]);

  async function handleNewConversation() {
    if (!selectedAgent || !isUnlocked(selectedAgent.id)) return;
    const conv = await api.createConversation({ agentId: selectedAgent.id });
    setConversations((prev) => [conv, ...prev]);
    setSelectedConversation(conv);
  }

  useEffect(() => {
    if (selectedAgent && isUnlocked(selectedAgent.id) && conversations.length === 0) {
      handleNewConversation();
    } else if (selectedAgent && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, selectedAgent]);

  async function handleManageBilling() {
    try {
      const { url } = await api.billingPortal();
      window.location.href = url;
    } catch (err) {
      navigate("/pricing");
    }
  }

  return (
    <div className="h-screen flex">
      <Sidebar
        agents={agents}
        unlockedAgentIds={unlockedAgentIds}
        selectedAgentId={selectedAgent?.id}
        onSelectAgent={setSelectedAgent}
        conversations={conversations}
        selectedConversationId={selectedConversation?.id}
        onSelectConversation={setSelectedConversation}
        onNewConversation={handleNewConversation}
        onManageBilling={handleManageBilling}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {!apiConfigured && (
          <div className="bg-accent-soft text-ink text-xs px-6 py-2 hairline-b">
            A chave da API da Anthropic ainda não foi configurada no backend
            (arquivo .env). Os agentes não vão conseguir responder até isso
            ser feito.
          </div>
        )}

        {selectedAgent && !isUnlocked(selectedAgent.id) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center hairline"
              style={{ color: selectedAgent.color }}
            >
              <AgentIcon icon={selectedAgent.icon} className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl text-ink">{selectedAgent.name} é um agente pago</h2>
            <p className="text-sm text-ink-muted max-w-sm">
              Assine este agente por {formatBRL(selectedAgent.priceMonthly || 0)}/mês para
              começar a conversar, ou escolha um pacote com desconto.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="mt-2 bg-ink text-cream text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition"
            >
              Ver planos
            </button>
          </div>
        ) : (
          <ChatWindow
            agent={selectedAgent}
            conversation={selectedConversation}
            onConversationUpdate={() => refreshConversations(selectedAgent?.id)}
          />
        )}
      </main>
    </div>
  );
}
