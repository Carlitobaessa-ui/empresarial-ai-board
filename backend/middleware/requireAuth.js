import { verifyToken } from "../services/auth.js";
import { db } from "../db.js";

// Exige um usuario logado (token JWT no header Authorization: Bearer <token>)
// e disponibiliza req.user com os dados do usuario (sem a senha).
export function requireAuth(req, res, next) {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "É necessário fazer login para continuar." });
  }

  try {
    const payload = verifyToken(token);
    const user = db.data.users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Sessão inválida. Faça login novamente." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sessão expirada ou inválida. Faça login novamente." });
  }
}
