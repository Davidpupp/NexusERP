import crypto from "crypto";

/**
 * Criptografia simétrica (AES-256-GCM) para credenciais de integração.
 * Server-only. A chave deriva do AUTH_SECRET — nunca expor segredos ao client.
 * Formato: base64(iv):base64(authTag):base64(ciphertext).
 */
const KEY = crypto
  .createHash("sha256")
  .update(process.env.AUTH_SECRET ?? "dev-insecure-key-change-me")
  .digest();

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ct].map((b) => b.toString("base64")).join(":");
}

export function decryptSecret(enc: string): string | null {
  try {
    const [iv, tag, ct] = enc.split(":").map((s) => Buffer.from(s, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Token aleatório seguro (ex.: segredo de webhook). */
export function randomSecret(bytes = 24): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Comparação em tempo constante para validar segredos de webhook. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
