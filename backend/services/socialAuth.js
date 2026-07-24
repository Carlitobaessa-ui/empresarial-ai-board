import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";

let googleClient = null;

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID);
}

export function isAppleConfigured() {
  return Boolean(process.env.APPLE_CLIENT_ID);
}

// Verifica o ID token emitido pelo Google Identity Services (botao "Continuar com Google").
// Retorna { email, name, providerId } ou lanca erro se invalido.
export async function verifyGoogleIdToken(idToken) {
  if (!isGoogleConfigured()) {
    throw new Error("GOOGLE_CLIENT_ID nao configurado no backend (.env).");
  }
  if (!googleClient) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new Error("Não foi possível obter o e-mail da conta Google.");
  }

  return {
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split("@")[0],
    providerId: payload.sub,
  };
}

// Verifica o identityToken emitido pelo "Sign in with Apple JS" (AppleID.auth.signIn()).
// Retorna { email, name, providerId }. Observacao: a Apple so envia o "name" na
// PRIMEIRA autorizacao (vem separado, no objeto `user` retornado pelo signIn no
// frontend) - por isso o campo name pode vir vazio aqui e deve ser complementado
// pelo frontend quando disponivel.
export async function verifyAppleIdToken(identityToken) {
  if (!isAppleConfigured()) {
    throw new Error("APPLE_CLIENT_ID nao configurado no backend (.env).");
  }

  const payload = await appleSignin.verifyIdToken(identityToken, {
    audience: process.env.APPLE_CLIENT_ID,
    ignoreExpiration: false,
  });

  if (!payload?.email) {
    throw new Error("Não foi possível obter o e-mail da conta Apple.");
  }

  return {
    email: payload.email.toLowerCase(),
    providerId: payload.sub,
  };
}
