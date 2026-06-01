import { env } from "@/lib/env";

/**
 * Rate limiter (fixed window).
 * - Production: Upstash Redis REST (distribuído, funciona em serverless) quando
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN estão setados.
 * - Fallback: in-memory (best-effort, por instância) quando Upstash não configurado.
 */
export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

// ── In-memory (fallback) ─────────────────────────────────────────────────────
type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

function memoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = store.get(key);
  if (!b || now > b.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { success: false, remaining: 0 };
  b.count += 1;
  return { success: true, remaining: limit - b.count };
}

// ── Upstash Redis REST ───────────────────────────────────────────────────────
async function upstashLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = env.UPSTASH_REDIS_REST_URL!;
  const token = env.UPSTASH_REDIS_REST_TOKEN!;
  const windowSec = Math.ceil(windowMs / 1000);
  const headers = { Authorization: `Bearer ${token}` };

  const incrRes = await fetch(`${url}/incr/${encodeURIComponent(key)}`, { headers, cache: "no-store" });
  const incr = (await incrRes.json()) as { result: number };
  const count = incr.result;

  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${windowSec}`, { headers, cache: "no-store" });
  }
  return { success: count <= limit, remaining: Math.max(0, limit - count) };
}

const upstashEnabled = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

/**
 * @param key      Identificador único (ex: `login:<ip>`).
 * @param limit    Máx. de requisições por janela.
 * @param windowMs Tamanho da janela em ms.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (upstashEnabled) {
    try {
      return await upstashLimit(key, limit, windowMs);
    } catch (e) {
      console.error("Upstash rate-limit error, fallback to memory:", e);
      return memoryLimit(key, limit, windowMs);
    }
  }
  return memoryLimit(key, limit, windowMs);
}

// Limpeza oportunista do mapa in-memory.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, b] of store) if (now > b.resetAt) store.delete(k);
  }, 60_000);
  if (typeof timer === "object" && "unref" in timer) timer.unref();
}
