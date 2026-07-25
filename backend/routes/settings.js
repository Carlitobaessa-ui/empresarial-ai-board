import { Router } from "express";
import { isConfigured } from "../services/anthropic.js";
import { requireAdmin } from "../middleware/auth.js";
import { isBillingEnabled, setBillingEnabled } from "../services/access.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    apiKeyConfigured: isConfigured(),
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
    billingEnabled: isBillingEnabled(),
  });
});

// Liga/desliga a cobranca pelo Painel Admin.
// billingEnabled = false libera todos os agentes para qualquer usuario logado
// (modo de testes); true volta a exigir assinatura ativa. O valor fica salvo no
// banco, entao continua valendo depois de reiniciar o servidor.
router.put("/billing", requireAdmin, async (req, res) => {
  const { billingEnabled } = req.body || {};

  if (typeof billingEnabled !== "boolean") {
    return res.status(400).json({ error: "billingEnabled deve ser true ou false." });
  }

  const saved = await setBillingEnabled(billingEnabled);
  res.json({ billingEnabled: saved });
});

// Apenas valida a senha admin (usado pelo frontend para "logar" no Painel Admin)
router.post("/check-admin", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

export default router;
