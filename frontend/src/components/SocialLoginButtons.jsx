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
          width: 328,
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
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleApple}
          disabled={!APPLE_CLIENT_ID}
          className={`w-full rounded-lg py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
            APPLE_CLIENT_ID
              ? "bg-ink text-cream hover:bg-ink/90"
              : "bg-ink/40 text-cream/70 cursor-not-allowed"
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M16.365 1.43c0 1.14-.417 2.222-1.25 3.19-.982 1.16-2.13 1.833-3.375 1.727a3.4 3.4 0 0 1-.03-.5c0-1.114.487-2.253 1.284-3.086.83-.874 2.14-1.51 3.253-1.55.03.24.04.48.04.72zM20.9 17.63c-.437 1.02-.94 1.947-1.51 2.79-.79 1.166-1.436 1.973-1.928 2.42-.76.723-1.575 1.096-2.445 1.12-.62.017-1.37-.174-2.24-.56-.874-.386-1.678-.577-2.412-.577-.77 0-1.596.19-2.478.577-.883.386-1.596.588-2.146.607-.834.036-1.673-.35-2.516-1.16-.53-.48-1.207-1.313-2.03-2.5-.883-1.276-1.61-2.756-2.176-4.44C.293 13.35 0 11.72 0 10.15c0-1.8.39-3.354 1.17-4.66a6.86 6.86 0 0 1 2.446-2.484 6.61 6.61 0 0 1 3.31-.937c.66 0 1.53.204 2.61.606.075.03 1.66.71 1.68.71.16 0 1.31-.7 1.47-.75 1.16-.42 2.11-.6 2.86-.55a6.53 6.53 0 0 1 3.407 1.28c-.35.21-.66.45-.943.72a6.63 6.63 0 0 0-1.63 2.34c-.38.9-.57 1.85-.57 2.85 0 1.03.2 1.98.6 2.85.4.87.94 1.6 1.63 2.19.36.31.72.56 1.09.75-.11.33-.23.65-.37.97z" />
          </svg>
          Continuar com a Apple
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
