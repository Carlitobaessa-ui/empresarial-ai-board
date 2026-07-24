import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import SocialLoginButtons from "../components/SocialLoginButtons.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm hairline bg-surface rounded-xl2 p-7">
        <h1 className="font-serif text-xl text-ink mb-1">Entrar</h1>
        <p className="text-xs text-ink-muted mb-5">
          Acesse sua conta para conversar com os agentes que você assinou.
        </p>

        <SocialLoginButtons afterAuthPath="/app" />

        <label className="text-xs text-ink-muted">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mt-1 mb-3"
          placeholder="voce@empresa.com"
        />
        <label className="text-xs text-ink-muted">Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mt-1 mb-3"
          placeholder="••••••••"
        />
        {error && <p className="text-xs text-red-700 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-cream text-sm font-medium py-2.5 rounded-lg disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="text-xs text-ink-muted text-center mt-4">
          Ainda não tem conta?{" "}
          <Link to="/signup" className="text-accent-dark hover:underline">
            Criar conta
          </Link>
        </p>
        <Link to="/" className="block text-center text-xs text-ink-muted mt-3 hover:underline">
          Voltar
        </Link>
      </form>
    </div>
  );
}
