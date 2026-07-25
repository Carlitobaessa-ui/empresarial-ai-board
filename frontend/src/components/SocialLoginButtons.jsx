import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.body.appendChild(script);
  });
}

// O backend roda no plano gratuito do Render, que "dorme" apos um periodo sem
// uso e pode levar ate ~50s para acordar na primeira requisicao. Sem isso, a
// PRIMEIRA tentativa de login social (Google/Apple) costuma falhar (timeout /
// 502/504) e so a segunda tentativa - com o backend ja acordado - funciona.
//
// Corrigimos isso com duas medidas complementares:
// 1) Repetir automaticamente a chamada de login se ela falhar por erro de
//    rede ou erro 5xx (tipico de cold start), em vez de exigir um novo clique
//    manual do usuario. Erros 4xx (ex.: credencial invalida) NAO sao repetidos.
// 2) Ver AuthProvider (lib/auth.jsx), que dispara um "ping" de aquecimento
//    para /api/health assim que qualquer pagina do app carrega, para o
//    backend ja estar acordado quando o usuario clicar em entrar.
async function withColdStartRetry(fn, { attempts = 4, delayMs = 3000 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // Erro "de negocio" (4xx: credencial invalida, etc.) - nao adianta tentar de novo.
      if (err.status && err.status < 500) throw err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

// Botao "Continuar com Google" so aparece se VITE_GOOGLE_CLIENT_ID estiver
// definida. O botao "Continuar com Apple" aparece SEMPRE, mas fica desativado
// ate VITE_APPLE_CLIENT_ID ser definida - ver backend/.env.example para
// instrucoes de configuracao de cada provedor.
//
// Importante: a navegacao pos-login usa window.location.hash (nao
// window.location.href) porque o app roda com HashRouter no GitHub Pages.
// Definir location.href = "/pricing" navegaria para a raiz do dominio
// (fora da subpasta do repo) e resultaria em 404 da pagina do GitHub Pages.
export default function SocialLoginButtons({ afterAuthPath = "/app" }) {
  const { loginWithToken } = useAuth();
  const googleDivRef = useRef(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadScript("https://accounts.google.com/gsi/client")
      .then(() => {
        if (!window.google || !googleDivRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            setError("");
            setStatus("Conectando...");
            try {
              const data = await withColdStartRetry(() =>
                api.loginWithGoogle(response.credential)
              );
              loginWithToken(data.token, data.user);
              window.location.hash = afterAuthPath;
            } catch (err) {
              setError(err.message);
            } finally {
              setStatus("");
            }
          },
        });
        window.google.accounts.id.renderButton(googleDivRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          locale: "pt-BR",
        });
      })
      .catch(() => setError("Não foi possível carregar o login do Google."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApple() {
    if (!APPLE_CLIENT_ID) return;
    setError("");
    try {
      await loadScript(
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
      );
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: window.location.origin,
        usePopup: true,
      });
      const res = await window.AppleID.auth.signIn();
      const name = res.user?.name
        ? `${res.user.name.firstName || ""} ${res.user.name.lastName || ""}`.trim()
        : undefined;
      setStatus("Conectando...");
      const data = await withColdStartRetry(() =>
        api.loginWithApple(res.authorization.id_token, name)
      );
      loginWithToken(data.token, data.user);
      window.location.hash = afterAuthPath;
    } catch (err) {
      setError(
        err?.error === "popup_closed_by_user"
          ? "Login com Apple cancelado."
          : err.message || "Não foi possível entrar com a Apple."
      );
    } finally {
      setStatus("");
    }
  }

  return (
    <div className="mb-4">
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleApple}
          disabled={!APPLE_CLIENT_ID}
          className={`w-full hairline rounded-lg py-2.5 text-sm transition ${
            APPLE_CLIENT_ID
              ? "text-ink hover:bg-cream"
              : "text-ink-muted opacity-50 cursor-not-allowed"
          }`}
        >
          Continuar com Apple
        </button>
        {GOOGLE_CLIENT_ID && <div ref={googleDivRef} className="flex justify-center" />}
      </div>
      {status && <p className="text-xs text-ink-muted mt-2">{status}</p>}
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
      <div className="flex items-center gap-3 pt-4">
        <div className="flex-1 h-px bg-line" />
        <span className="text-[11px] text-ink-muted">ou com e-mail</span>
        <div className="flex-1 h-px bg-line" />
      </div>
    </div>
  );
}
