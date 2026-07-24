import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db.js"; // garante que o banco e o seed rodem na subida do servidor

import agentsRouter from "./routes/agents.js";
import bundlesRouter from "./routes/bundles.js";
import conversationsRouter from "./routes/conversations.js";
import chatRouter from "./routes/chat.js";
import settingsRouter from "./routes/settings.js";
import authRouter from "./routes/auth.js";
import billingRouter, { stripeWebhookHandler, rawBodyParser } from "./routes/billing.js";

const app = express();
app.use(cors());

// O webhook do Stripe precisa do corpo "cru" (raw) para validar a assinatura,
// por isso essa rota e registrada ANTES do express.json() global.
app.post("/api/billing/webhook", rawBodyParser, stripeWebhookHandler);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/agents", agentsRouter);
app.use("/api/bundles", bundlesRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/auth", authRouter);
app.use("/api/billing", billingRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno no servidor." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend do Conselho de Agentes rodando em http://localhost:${PORT}`);
});
