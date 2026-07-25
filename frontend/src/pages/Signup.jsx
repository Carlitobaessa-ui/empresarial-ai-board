import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import SocialLoginButtons from "../components/SocialLoginButtons.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/pricing");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm hairline bg-surface rounded-xl2 p-7">
        <h1 className="font-serif text-2xl font-bold text-ink mb-1">Criar conta</h1>
        <p className="text-sm text-ink-muted mb-6">
          Crie sua conta para escolher os agentes que você quer assinar.
        </p>

        <SocialLoginButtons afterAuthPath="/pricing" />

        <label className="text-xs text-ink-muted">Nome</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input mt-1 mb-3"
          placeholder="Seu nome"
        />
        <label className="text-xs text-ink-muted">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mt-1 mb-3"
          placeholder="seu@email.com"
        />
        <label className="text-xs text-ink-muted">Senha</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mt-1 mb-3"
          placeholder="Senha (mín. 6 caracteres)"
        />
        {error && <p className="text-xs text-red-700 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-800 hover:bg-green-900 text-white text-sm font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
        <Link
          to="/login"
          className="w-full hairline rounded-lg py-2.5 text-sm text-ink font-medium text-center block mt-2.5 hover:bg-cream transition"
        >
          Entrar
        </Link>
        <Link to="/" className="block text-center text-xs text-ink-muted mt-4 hover:underline">
          Voltar
        </Link>
      </form>
    </div>
  );
}
