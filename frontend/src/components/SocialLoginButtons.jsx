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

// Botao "Continuar com Google" so aparece se VITE_GOOGLE_CLIENT_ID estiver
// definida. O botao "Continuar com Apple" aparece SEMPRE, mas fica desativado
// (com aviso "em breve") ate VITE_APPLE_CLIENT_ID ser definida - ver
// backend/.env.example para instrucoes de configuracao de cada provedor.
export default function SocialLoginButtons({ afterAuthPath = "/app" }) {
  const { loginWithToken } = useAuth();
  const googleDivRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadScript("https://accounts.google.com/gsi/client")
      .then(() => {
        if (!window.google || !googleDivRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            setError("");
            try {
              const data = await api.loginWithGoogle(response.credential);
              loginWithToken(data.token, data.user);
              window.location.href = afterAuthPath;
            } catch (err) {
              setError(err.message);
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
      const data = await api.loginWithApple(res.authorization.id_token, name);
      loginWithToken(data.token, data.user);
      window.location.href = afterAuthPath;
    } catch (err) {
      setError(
        err?.error === "popup_closed_by_user"
          ? "Login com Apple cancelado."
          : err.message || "Não foi possível entrar com a Apple."
      );
    }
  }

  return (
    <div className="mb-4">
      <div className="space-y-2">
        {GOOGLE_CLIENT_ID && <div ref={googleDivRef} className="flex justify-center" />}
        <button
          type="button"
          onClick={handleApple}
          disabled={!APPLE_CLIENT_ID}
          title={!APPLE_CLIENT_ID ? "Em breve" : undefined}
          className={`w-full hairline rounded-lg py-2.5 text-sm transition ${
            APPLE_CLIENT_ID
              ? "text-ink hover:bg-cream"
              : "text-ink-muted opacity-50 cursor-not-allowed"
          }`}
        >
          Continuar com Apple{!APPLE_CLIENT_ID && " (em breve)"}
        </button>
      </div>
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
      <div className="flex items-center gap-3 pt-4">
        <div className="flex-1 h-px bg-line" />
        <span className="text-[11px] text-ink-muted">ou com e-mail</span>
        <div className="flex-1 h-px bg-line" />
      </div>
    </div>
  );
}
