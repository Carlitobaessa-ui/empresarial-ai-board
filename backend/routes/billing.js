import { Router } from "express";
import express from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getStripe, isStripeConfigured } from "../services/stripeClient.js";
import { getUnlockedAgentIds } from "../services/access.js";

const router = Router();

router.get("/status", (_req, res) => {
  res.json({ configured: isStripeConfigured() });
});

// Cria uma sessao de checkout (assinatura) para um agente individual ou um pacote
router.post("/checkout", requireAuth, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      error: "STRIPE_SECRET_KEY não configurada no backend (.env). Configure para vender assinaturas.",
    });
  }

  const { type, id } = req.body || {};
  if (!["agent", "bundle"].includes(type) || !id) {
    return res.status(400).json({ error: "type ('agent' ou 'bundle') e id são obrigatórios." });
  }

  const item =
    type === "agent"
      ? db.data.agents.find((a) => a.id === id)
      : db.data.bundles.find((b) => b.id === id);

  if (!item) return res.status(404).json({ error: "Item não encontrado." });
  if (!item.stripePriceId) {
    return res.status(400).json({
      error: `"${item.name}" ainda não tem um Stripe Price ID configurado no Admin.`,
    });
  }

  try {
    let user = db.data.users.find((u) => u.id === req.user.id);
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { appUserId: user.id },
      });
      user.stripeCustomerId = customer.id;
      await db.write();
    }

    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: user.stripeCustomerId,
      line_items: [{ price: item.stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/app?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancel`,
      metadata: { userId: user.id, type, refId: id },
      subscription_data: { metadata: { userId: user.id, type, refId: id } },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro ao criar sessão de checkout." });
  }
});

// Cria uma sessao do portal de cobranca (gerenciar/cancelar assinaturas)
router.post("/portal", requireAuth, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: "Stripe não configurado no backend." });

  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user?.stripeCustomerId) {
    return res.status(400).json({ error: "Você ainda não tem nenhuma assinatura." });
  }

  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/app`,
  });

  res.json({ url: portalSession.url });
});

// Quais agentes o usuario logado ja pode conversar
router.get("/my-subscriptions", requireAuth, (req, res) => {
  const subs = db.data.subscriptions.filter((s) => s.userId === req.user.id);
  const unlockedAgentIds = Array.from(getUnlockedAgentIds(req.user.id));
  res.json({ subscriptions: subs, unlockedAgentIds });
});

// Webhook do Stripe - precisa do corpo "raw" (configurado em server.js antes do express.json)
export async function stripeWebhookHandler(req, res) {
  const stripe = getStripe();
  if (!stripe) return res.status(500).send("Stripe não configurado.");

  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Assinatura de webhook inválida: ${err.message}`);
  }

  const now = new Date().toISOString();

  async function upsertSubscription({ userId, type, refId, stripeSubscriptionId, stripeCustomerId, status, currentPeriodEnd }) {
    let sub = db.data.subscriptions.find((s) => s.stripeSubscriptionId === stripeSubscriptionId);
    if (sub) {
      sub.status = status;
      sub.currentPeriodEnd = currentPeriodEnd;
      sub.updatedAt = now;
    } else {
      db.data.subscriptions.push({
        id: nanoid(),
        userId,
        type,
        refId,
        stripeSubscriptionId,
        stripeCustomerId,
        status,
        currentPeriodEnd,
        createdAt: now,
        updatedAt: now,
      });
    }
    await db.write();
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { userId, type, refId } = session.metadata || {};
        if (userId && session.subscription) {
          await upsertSubscription({
            userId,
            type,
            refId,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            status: "active",
            currentPeriodEnd: null,
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const { userId, type, refId } = subscription.metadata || {};
        await upsertSubscription({
          userId,
          type,
          refId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          status: subscription.status === "active" ? "active" : "canceled",
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        });
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Erro processando webhook do Stripe:", err);
    res.status(500).send("Erro interno processando webhook.");
  }
}

export const rawBodyParser = express.raw({ type: "application/json" });

export default router;
