import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const EDITABLE_FIELDS = ["name", "description", "agentIds", "priceMonthly", "stripePriceId", "active"];

router.get("/", (req, res) => {
  const showAll = req.query.all === "1";
  const list = showAll ? db.data.bundles : db.data.bundles.filter((b) => b.active);
  res.json(list);
});

router.get("/:id", (req, res) => {
  const bundle = db.data.bundles.find((b) => b.id === req.params.id);
  if (!bundle) return res.status(404).json({ error: "Pacote não encontrado." });
  res.json(bundle);
});

router.post("/", requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (!body.name || !Array.isArray(body.agentIds) || body.agentIds.length === 0) {
    return res.status(400).json({ error: "name e agentIds (lista com pelo menos 1 agente) são obrigatórios." });
  }

  const now = new Date().toISOString();
  const bundle = {
    id: nanoid(),
    name: body.name,
    description: body.description || "",
    agentIds: body.agentIds,
    priceMonthly: Number(body.priceMonthly) || 0,
    stripePriceId: body.stripePriceId || null,
    active: 1,
    createdAt: now,
    updatedAt: now,
  };

  db.data.bundles.push(bundle);
  await db.write();
  res.status(201).json(bundle);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const bundle = db.data.bundles.find((b) => b.id === req.params.id);
  if (!bundle) return res.status(404).json({ error: "Pacote não encontrado." });

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) bundle[field] = req.body[field];
  }
  bundle.updatedAt = new Date().toISOString();

  await db.write();
  res.json(bundle);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const idx = db.data.bundles.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Pacote não encontrado." });

  db.data.bundles.splice(idx, 1);
  await db.write();
  res.json({ ok: true });
});

export default router;
