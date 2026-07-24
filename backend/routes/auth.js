import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { hashPassword, verifyPassword, signToken, toSafeUser } from "../services/auth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  verifyGoogleIdToken,
  verifyAppleIdToken,
  isGoogleConfigured,
  isAppleConfigured,
} from "../services/socialAuth.js";

const router = Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

router.get("/social-status", (_req, res) => {
  res.json({ google: isGoogleConfigured(), apple: isAppleConfigured() });
});

// Cria (se necessario) e loga um usuario a partir de um login social (Google/Apple).
// Se ja existir uma conta com o mesmo e-mail (ex.: criada por senha), a mesma
// conta e reaproveitada e passa a poder logar tambem pelo provedor social.
async function loginOrCreateSocialUser({ email, name, provider, providerId }) {
  let user = db.data.users.find((u) => u.email === email);

  if (!user) {
    const now = new Date().toISOString();
    user = {
      id: nanoid(),
      name: name || email.split("@")[0],
      email,
      passwordHash: null,
      provider,
      providerId,
      stripeCustomerId: null,
      createdAt: now,
    };
    db.data.users.push(user);
  } else if (!user.provider) {
    user.provider = provider;
    user.providerId = providerId;
  }

  await db.write();
  return user;
}

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !isValidEmail(email) || !password || password.length < 6) {
    return res.status(400).json({
      error: "Preencha nome, um e-mail válido e uma senha com pelo menos 6 caracteres.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (db.data.users.some((u) => u.email === normalizedEmail)) {
    return res.status(400).json({ error: "Já existe uma conta com esse e-mail." });
  }

  const now = new Date().toISOString();
  const user = {
    id: nanoid(),
    name,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    provider: "password",
    providerId: null,
    stripeCustomerId: null,
    createdAt: now,
  };

  db.data.users.push(user);
  await db.write();

  const token = signToken(user);
  res.status(201).json({ token, user: toSafeUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = (email || "").trim().toLowerCase();

  const user = db.data.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: "E-mail ou senha incorretos." });
  }
  if (!user.passwordHash) {
    return res.status(401).json({
      error: "Essa conta foi criada com login social (Google/Apple). Entre por lá.",
    });
  }
  if (!(await verifyPassword(password || "", user.passwordHash))) {
    return res.status(401).json({ error: "E-mail ou senha incorretos." });
  }

  const token = signToken(user);
  res.json({ token, user: toSafeUser(user) });
});

router.post("/google", async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: "credential é obrigatório." });

  try {
    const { email, name, providerId } = await verifyGoogleIdToken(credential);
    const user = await loginOrCreateSocialUser({ email, name, provider: "google", providerId });
    const token = signToken(user);
    res.json({ token, user: toSafeUser(user) });
  } catch (err) {
    res.status(401).json({ error: err.message || "Falha ao entrar com Google." });
  }
});

router.post("/apple", async (req, res) => {
  const { identityToken, name } = req.body || {};
  if (!identityToken) return res.status(400).json({ error: "identityToken é obrigatório." });

  try {
    const { email, providerId } = await verifyAppleIdToken(identityToken);
    const user = await loginOrCreateSocialUser({ email, name, provider: "apple", providerId });
    const token = signToken(user);
    res.json({ token, user: toSafeUser(user) });
  } catch (err) {
    res.status(401).json({ error: err.message || "Falha ao entrar com Apple." });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: toSafeUser(req.user) });
});

export default router;
