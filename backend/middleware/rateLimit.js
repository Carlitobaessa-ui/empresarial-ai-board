import rateLimit from "express-rate-limit";

// Limita tentativas de login e cadastro por IP, para dificultar brute-force
// de senha e criacao automatizada de contas.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
});
