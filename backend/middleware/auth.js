// Protecao simples para as rotas de escrita do Painel Admin.
// Nao e um sistema de autenticacao completo - e um MVP.
// Para producao real, evolua para autenticacao de usuarios com sessao/JWT.
export function requireAdmin(req, res, next) {
  const provided = req.header("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    return res.status(500).json({
      error:
        "ADMIN_PASSWORD nao configurada no backend (.env). Configure antes de editar agentes.",
    });
  }

  if (provided !== expected) {
    return res.status(401).json({ error: "Senha de administrador invalida." });
  }

  next();
}
