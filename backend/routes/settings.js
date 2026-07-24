import { Router } from "express";
import { isConfigured } from "../services/anthropic.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    apiKeyConfigured: isConfigured(),
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929",
  });
});

// Apenas valida a senha admin (usado pelo frontend para "logar" no Painel Admin)
router.post("/check-admin", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

export default router;
