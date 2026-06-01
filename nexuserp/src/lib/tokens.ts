import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export type TokenPurpose = "verify" | "reset" | "activate";

const TTL_MS: Record<TokenPurpose, number> = {
  verify: 24 * 60 * 60_000, // 24h
  reset: 60 * 60_000, // 1h
  activate: 24 * 60 * 60_000, // 24h — ativação pós-pagamento
};

function identifierFor(purpose: TokenPurpose, email: string): string {
  return `${purpose}:${email.toLowerCase().trim()}`;
}

/** Create a single-use token for an email + purpose. Returns the raw token. */
export async function createToken(purpose: TokenPurpose, email: string): Promise<string> {
  const identifier = identifierFor(purpose, email);
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TTL_MS[purpose]);

  // Invalidate previous tokens of the same purpose for this email.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({ data: { identifier, token, expires } });
  return token;
}

/**
 * Validate + consume a token. Returns the email on success, or null when the token
 * is unknown/expired. Single-use: the token row is deleted on success.
 */
export async function consumeToken(purpose: TokenPurpose, token: string): Promise<string | null> {
  const row = await prisma.verificationToken.findFirst({
    where: { token, identifier: { startsWith: `${purpose}:` } },
  });
  if (!row) return null;

  await prisma.verificationToken.deleteMany({ where: { token: row.token, identifier: row.identifier } });
  if (row.expires < new Date()) return null;

  return row.identifier.slice(purpose.length + 1); // strip "purpose:"
}
