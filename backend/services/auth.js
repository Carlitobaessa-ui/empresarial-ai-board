import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET nao configurado no backend (.env). Defina um valor secreto antes de usar login."
    );
  }
  return secret;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    getSecret(),
    { expiresIn: "30d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

// Remove o hash de senha antes de devolver o usuario para o frontend
export function toSafeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}
