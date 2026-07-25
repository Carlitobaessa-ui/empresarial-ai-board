import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // "Acorda" o backend (plano gratuito do Render dorme com inatividade e
    // pode levar ate ~50s pra responder na primeira chamada). Disparar isso
    // assim que qualquer pagina do app carrega evita que o login social
    // (Google/Apple) falhe na primeira tentativa por causa do cold start.
    api.health().catch(() => {});

    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setToken(""))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await api.signup({ name, email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  // Usado pelos botoes de login social: ja recebem { token, user } prontos do backend.
  const loginWithToken = useCallback((token, socialUser) => {
    setToken(token);
    setUser(socialUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
