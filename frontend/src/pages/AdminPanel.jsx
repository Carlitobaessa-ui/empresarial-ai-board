import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import AgentIcon from "../components/AgentIcon.jsx";
import AgentEditor from "./AgentEditor.jsx";
import BundleEditor from "./BundleEditor.jsx";
import UsersPanel from "./UsersPanel.jsx";

const PASSWORD_STORAGE_KEY = "board_admin_password";

export default function AdminPanel() {
  const [password, setPassword] = useState(
    () => sessionStorage.getItem(PASSWORD_STORAGE_KEY) || ""
  );
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(false);

  const [agents, setAgents] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  // billingEnabled = true: usuarios precisam de assinatura ativa para conversar
  // com um agente. false: todos os agentes ficam liberados (modo de testes).
  const [billingEnabled, setBillingEnabled] = useState(true);
  const [togglingBilling, setTogglingBilling] = useState(false);

  // selection: { kind: 'agent'|'bundle', item, isNew }
  const [selection, setSelection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (password) tryAuth(password, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function tryAuth(pwd, silent = false) {
    setChecking(true);
    setAuthError("");
    try {
      await api.checkAdmin(pwd);
      sessionStorage.setItem(PASSWORD_STORAGE_KEY, pwd);
      setAuthed(true);
      loadAll();
    } catch (err) {
      setAuthed(false);
      if (!silent) setAuthError(err.message);
    } finally {
      setChecking(false);
    }
  }

  function loadAll() {
    api.listAgents(true).then(setAgents);
    api.listBundles(true).then(setBundles);
    api.getSettings().then((s) => setBillingEnabled(s.billingEnabled !== false));
    loadUsers();
  }

  function loadUsers() {
    setUsersLoading(true);
    api
      .adminListUsers(password)
      .then(setUsers)
      .catch((err) => setNotice(err.message))
      .finally(() => setUsersLoading(false));
  }

  async function handleToggleBilling() {
    const next = !billingEnabled;
    const aviso = next
      ? "Reativar a cobranca? Os usuarios voltarao a precisar de assinatura ativa para conversar com os agentes."
      : "Desativar a cobranca? Todos os agentes ficarao liberados para qualquer usuario logado (modo de testes).";
    if (!window.confirm(aviso)) return;

    setTogglingBilling(true);
    setNotice("");
    try {
      const res = await api.setBilling(next, password);
      setBillingEnabled(res.billingEnabled);
      setNotice(
        res.billingEnabled
          ? "Cobranca reativada - assinatura obrigatoria."
          : "Cobranca desativada - todos os agentes liberados."
      );
    } catch (err) {
      setNotice(err.message);
    } finally {
      setTogglingBilling(false);
    }
  }

  async function handleSaveAgent(form) {
    setSaving(true);
    setNotice("");
    try {
      if (selection.isNew) {
        const created = await api.createAgent(form, password);
        setAgents((prev) => [...prev, created]);
        setSelection({ kind: "agent", item: created, isNew: false });
      } else {
        const updated = await api.updateAgent(selection.item.id, form, password);
        setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setSelection({ kind: "agent", item: updated, isNew: false });
      }
      setNotice("Agente salvo com sucesso.");
    } catch (err) {
      setNotice(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAgent(agent) {
    if (!confirm(`Excluir o agente "${agent.name}"? Essa ação não pode ser desfeita.`)) return;
    await api.deleteAgent(agent.id, password);
    setAgents((prev) => prev.filter((a) => a.id !== agent.id));
    setSelection(null);
  }

  async function handleSaveBundle(form) {
    setSaving(true);
    setNotice("");
    try {
      if (selection.isNew) {
        const created = await api.createBundle(form, password);
        setBundles((prev) => [...prev, created]);
        setSelection({ kind: "bundle", item: created, isNew: false });
      } else {
        const updated = await api.updateBundle(selection.item.id, form, password);
        setBundles((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setSelection({ kind: "bundle", item: updated, isNew: false });
      }
      setNotice("Pacote salvo com sucesso.");
    } catch (err) {
      setNotice(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBundle(bundle) {
    if (!confirm(`Excluir o pacote "${bundle.name}"? Essa ação não pode ser desfeita.`)) return;
    await api.deleteBundle(bundle.id, password);
    setBundles((prev) => prev.filter((b) => b.id !== bundle.id));
    setSelection(null);
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tryAuth(password);
          }}
          className="w-full max-w-sm hairline bg-surface rounded-xl2 p-7"
        >
          <h1 className="font-serif text-xl text-ink mb-1">Área administrativa</h1>
          <p className="text-xs text-ink-muted mb-5">
            Digite a senha definida em ADMIN_PASSWORD (backend/.env) para
            compor o conhecimento e os preços dos agentes.
          </p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha de administrador"
            className="input mb-3"
          />
          {authError && <p className="text-xs text-red-700 mb-3">{authError}</p>}
          <button
            type="submit"
            disabled={checking}
            className="w-full bg-ink text-cream text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {checking ? "Verificando..." : "Entrar"}
          </button>
          <Link to="/" className="block text-center text-xs text-ink-muted mt-4 hover:underline">
            Voltar
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <aside className="w-72 shrink-0 border-r border-line flex flex-col bg-cream">
        <div className="px-5 py-4 hairline-b flex items-center justify-between">
          <Link to="/" className="font-serif text-[15px] text-ink">
            Painel Admin
          </Link>
          <Link to="/app" className="text-xs text-ink-muted hover:underline">
            Ver app
          </Link>
        </div>

        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-ink-muted">Agentes</span>
          <button
            onClick={() => {
              setSelection({ kind: "agent", item: null, isNew: true });
              setNotice("");
            }}
            className="text-xs text-accent-dark hover:underline"
          >
            + Novo agente
          </button>
        </div>
        <div className="px-3 space-y-1 pb-3">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                setSelection({ kind: "agent", item: agent, isNew: false });
                setNotice("");
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition hover:bg-surface ${
                selection?.kind === "agent" && selection.item?.id === agent.id ? "bg-surface hairline" : ""
              } ${!agent.active ? "opacity-50" : ""}`}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center hairline shrink-0"
                style={{ color: agent.color }}
              >
                <AgentIcon icon={agent.icon} className="w-4 h-4" />
              </span>
              <span className="text-sm text-ink truncate">{agent.name}</span>
              {!agent.active && <span className="text-[10px] text-ink-muted ml-auto">inativo</span>}
            </button>
          ))}
        </div>

        <div className="px-4 pt-3 pb-2 hairline-t flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-ink-muted">Pacotes</span>
          <button
            onClick={() => {
              setSelection({ kind: "bundle", item: null, isNew: true });
              setNotice("");
            }}
            className="text-xs text-accent-dark hover:underline"
          >
            + Novo pacote
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
          {bundles.map((bundle) => (
            <button
              key={bundle.id}
              onClick={() => {
                setSelection({ kind: "bundle", item: bundle, isNew: false });
                setNotice("");
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition hover:bg-surface ${
                selection?.kind === "bundle" && selection.item?.id === bundle.id ? "bg-surface hairline" : ""
              } ${!bundle.active ? "opacity-50" : ""}`}
            >
              <span className="text-sm text-ink truncate">{bundle.name}</span>
              {!bundle.active && <span className="text-[10px] text-ink-muted ml-auto">inativo</span>}
            </button>
          ))}
        </div>
        <div className="px-4 py-3 hairline-t">
          <button
            onClick={() => {
              setSelection({ kind: "users" });
              setNotice("");
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition hover:bg-surface ${
              selection?.kind === "users" ? "bg-surface hairline" : ""
            }`}
          >
            <span className="text-sm text-ink">Usuários e conversas</span>
            <span className="text-[11px] text-ink-muted">{users.length}</span>
          </button>
        </div>

        <div className="px-4 py-3 hairline-t">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wide text-ink-muted">Cobranca</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                billingEnabled ? "bg-accent-dark/10 text-accent-dark" : "bg-ink/10 text-ink-muted"
              }`}
            >
              {billingEnabled ? "ativa" : "desativada"}
            </span>
          </div>
          <p className="text-[11px] leading-snug text-ink-muted mb-2">
            {billingEnabled
              ? "Usuarios precisam de assinatura ativa para conversar com os agentes."
              : "Todos os agentes estao liberados para qualquer usuario logado (modo de testes)."}
          </p>
          <button
            onClick={handleToggleBilling}
            disabled={togglingBilling}
            className="w-full hairline rounded-lg py-2 text-xs text-ink hover:bg-surface transition disabled:opacity-50"
          >
            {togglingBilling
              ? "Salvando..."
              : billingEnabled
                ? "Desativar cobranca"
                : "Reativar cobranca"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {notice && (
          <div className="hairline-b px-8 py-2 text-xs text-ink-muted bg-surface/60">{notice}</div>
        )}

        {selection?.kind === "agent" && (
          <AgentEditor
            key={selection.item?.id || "new-agent"}
            agent={selection.item}
            isNew={selection.isNew}
            saving={saving}
            onSave={handleSaveAgent}
            onDelete={handleDeleteAgent}
            onCancel={() => setSelection(null)}
          />
        )}

        {selection?.kind === "bundle" && (
          <BundleEditor
            key={selection.item?.id || "new-bundle"}
            bundle={selection.item}
            isNew={selection.isNew}
            agents={agents}
            saving={saving}
            onSave={handleSaveBundle}
            onDelete={handleDeleteBundle}
            onCancel={() => setSelection(null)}
          />
        )}

        {selection?.kind === "users" && (
          <UsersPanel users={users} loading={usersLoading} onRefresh={loadUsers} />
        )}

        {!selection && (
          <div className="flex-1 flex items-center justify-center text-ink-muted text-sm px-8 text-center">
            Selecione um agente, pacote ou "Usuários e conversas" à esquerda -
            ou crie um novo agente especialista ou pacote de assinatura.
          </div>
        )}
      </main>
    </div>
  );
}
