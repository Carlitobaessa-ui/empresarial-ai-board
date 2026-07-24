const BASE = "/api";
const TOKEN_KEY = "board_auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Erro na requisição (${res.status})`);
    err.status = res.status;
    err.requiresSubscription = data.requiresSubscription;
    err.agentId = data.agentId;
    throw err;
  }
  return data;
}

export const api = {
  // Autenticação
  signup: (payload) => request(`/auth/signup`, { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request(`/auth/login`, { method: "POST", body: JSON.stringify(payload) }),
  me: () => request(`/auth/me`),
  socialStatus: () => request(`/auth/social-status`),
  loginWithGoogle: (credential) =>
    request(`/auth/google`, { method: "POST", body: JSON.stringify({ credential }) }),
  loginWithApple: (identityToken, name) =>
    request(`/auth/apple`, { method: "POST", body: JSON.stringify({ identityToken, name }) }),

  // Agentes
  listAgents: (all = false) => request(`/agents${all ? "?all=1" : ""}`),
  getAgent: (id) => request(`/agents/${id}`),
  createAgent: (payload, adminPassword) =>
    request(`/agents`, {
      method: "POST",
      headers: { "x-admin-password": adminPassword },
      body: JSON.stringify(payload),
    }),
  updateAgent: (id, payload, adminPassword) =>
    request(`/agents/${id}`, {
      method: "PUT",
      headers: { "x-admin-password": adminPassword },
      body: JSON.stringify(payload),
    }),
  deleteAgent: (id, adminPassword) =>
    request(`/agents/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": adminPassword },
    }),

  // Pacotes (bundles)
  listBundles: (all = false) => request(`/bundles${all ? "?all=1" : ""}`),
  createBundle: (payload, adminPassword) =>
    request(`/bundles`, {
      method: "POST",
      headers: { "x-admin-password": adminPassword },
      body: JSON.stringify(payload),
    }),
  updateBundle: (id, payload, adminPassword) =>
    request(`/bundles/${id}`, {
      method: "PUT",
      headers: { "x-admin-password": adminPassword },
      body: JSON.stringify(payload),
    }),
  deleteBundle: (id, adminPassword) =>
    request(`/bundles/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": adminPassword },
    }),

  // Conversas
  listConversations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/conversations${qs ? `?${qs}` : ""}`);
  },
  createConversation: (payload) =>
    request(`/conversations`, { method: "POST", body: JSON.stringify(payload) }),
  getConversation: (id) => request(`/conversations/${id}`),
  deleteConversation: (id) => request(`/conversations/${id}`, { method: "DELETE" }),

  // Chat
  sendMessage: (payload) => request(`/chat`, { method: "POST", body: JSON.stringify(payload) }),
  chatStatus: () => request(`/chat/status`),

  // Cobrança / assinaturas
  billingStatus: () => request(`/billing/status`),
  mySubscriptions: () => request(`/billing/my-subscriptions`),
  checkout: (payload) => request(`/billing/checkout`, { method: "POST", body: JSON.stringify(payload) }),
  billingPortal: () => request(`/billing/portal`, { method: "POST" }),

  // Settings / admin
  getSettings: () => request(`/settings`),
  checkAdmin: (adminPassword) =>
    request(`/settings/check-admin`, {
      method: "POST",
      headers: { "x-admin-password": adminPassword },
    }),
};
