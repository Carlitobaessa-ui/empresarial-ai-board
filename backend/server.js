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

// Pagina inicial da API: o backend nao serve HTML do app (isso e o GitHub
// Pages). Sem esta rota, abrir a raiz no navegador mostraria "Cannot GET /".
app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Conselho de Agentes Especialistas - API</title>
<style>body{font-family:system-ui,sans-serif;max-width:34rem;margin:6rem auto;padding:0 1.5rem;color:#2b2b28;line-height:1.6}
code{background:#f2efe9;padding:.15rem .4rem;border-radius:4px}a{color:#b8551f}</style></head>
<body><h1>API no ar</h1>
<p>Este endereco e apenas o <strong>backend</strong> (API) do Conselho de Agentes
Especialistas. Ele nao tem interface visual.</p>
<p>Para usar o sistema, acesse o aplicativo:<br>
<a href="https://carlitobaessa-ui.github.io/empresarial-ai-board/">carlitobaessa-ui.github.io/empresarial-ai-board</a></p>
<p>Status do servico: <code>/api/health</code></p>
</body></html>`);
});

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
