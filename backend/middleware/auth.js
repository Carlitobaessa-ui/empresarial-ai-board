import crypto from "node:crypto";

// Protecao simples para as rotas de escrita do Painel Admin.
// Nao e um sistema de autenticacao completo - e um MVP.
// Para producao real, evolua para autenticacao de usuarios com sessao/JWT.

// --- Rate limiting em memoria (por IP) para tentativas de senha de admin ---
// Isso e resetado se o processo reiniciar - suficiente para um MVP com um
// unico admin. Para varias instancias/equipe maior, migre para um limitador
// compartilhado (ex.: Redis).
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const attemptsByIp = new Map();

function isRateLimited(ip) {
  const entry = attemptsByIp.get(ip);
  if (!entry || Date.now() > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function registerFailedAttempt(ip) {
  const now = Date.now();
  const entry = attemptsByIp.get(ip);
  if (!entry || now > entry.resetAt) {
    attemptsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(ip) {
  attemptsByIp.delete(ip);
}

// Compara duas strings em tempo constante (evita timing attack), mesmo
// quando os tamanhos sao diferentes - usa o hash SHA-256 de cada uma (sempre
// do mesmo tamanho) em vez de comparar os textos originais diretamente.
function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(String(a)).digest();
  const hashB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function requireAdmin(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: "Muitas tentativas de senha invalida. Aguarde alguns minutos e tente novamente.",
    });
  }

  const provided = req.header("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    return res.status(500).json({
      error:
        "ADMIN_PASSWORD nao configurada no backend (.env). Configure antes de editar agentes.",
    });
  }

  if (!safeEqual(provided, expected)) {
    registerFailedAttempt(ip);
    return res.status(401).json({ error: "Senha de administrador invalida." });
  }

  clearAttempts(ip);
  next();
}
