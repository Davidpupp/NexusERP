import { z } from "zod";

/**
 * Centralized, validated environment access.
 * Importing this module throws at startup if required vars are missing/invalid,
 * so misconfiguration fails fast instead of at request time.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 chars (use `openssl rand -base64 32`)"),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Mercado Pago (optional — checkout falls back to mock when absent/empty)
  MP_ACCESS_TOKEN: z.string().optional(),
  MP_WEBHOOK_SECRET: z.string().optional(),
  // Public key (client) p/ tokenização de cartão com MP.js
  NEXT_PUBLIC_MP_PUBLIC_KEY: z.string().optional(),

  // Public base URL used for webhook/return URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Email (optional — sem chave, e-mails são logados no console em dev)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Upstash Redis (optional — sem isso, rate-limit usa fallback in-memory)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Sentry (optional — observabilidade de erros server-side)
  SENTRY_DSN: z.string().optional(),

  // Anthropic / Claude (optional — recursos de IA desativam sem a chave)
  ANTHROPIC_API_KEY: z.string().optional(),

  // Pluggy (Open Finance) — integração bancária; vazio = desativado
  PLUGGY_CLIENT_ID: z.string().optional(),
  PLUGGY_CLIENT_SECRET: z.string().optional(),

  // E-mails (separados por vírgula) com acesso à área de plataforma /admin.
  // Vazio = apenas o admin padrão (admin@nexuserp.com.br).
  PLATFORM_ADMIN_EMAILS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`❌ Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;

/** True when real Mercado Pago credentials are configured (non-empty). */
export const isMercadoPagoEnabled = Boolean(env.MP_ACCESS_TOKEN && env.MP_ACCESS_TOKEN.length > 0);

/** True when a Claude/Anthropic API key is configured. */
export const isAiEnabled = Boolean(env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.length > 0);

/** True when Pluggy (Open Finance) credentials are configured. */
export const isPluggyEnabled = Boolean(env.PLUGGY_CLIENT_ID && env.PLUGGY_CLIENT_SECRET);
