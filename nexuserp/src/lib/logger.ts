import crypto from "crypto";
import { env } from "@/lib/env";

type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, message: string, context?: Record<string, unknown>) {
  const isProd = env.NODE_ENV === "production";
  const entry = { ts: new Date().toISOString(), level, message, ...context };
  const line = isProd ? JSON.stringify(entry) : `[${level}] ${message}${context ? " " + JSON.stringify(context) : ""}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => emit("debug", m, c),
  info: (m: string, c?: Record<string, unknown>) => emit("info", m, c),
  warn: (m: string, c?: Record<string, unknown>) => emit("warn", m, c),
  error: (m: string, c?: Record<string, unknown>) => emit("error", m, c),
};

/** Parse a Sentry DSN: https://<publicKey>@<host>/<projectId> */
function parseDsn(dsn: string): { url: string; publicKey: string } | null {
  try {
    const u = new URL(dsn);
    const projectId = u.pathname.replace("/", "");
    if (!projectId || !u.username) return null;
    return { url: `${u.protocol}//${u.host}/api/${projectId}/envelope/`, publicKey: u.username };
  } catch {
    return null;
  }
}

/**
 * Loga o erro estruturado e, se SENTRY_DSN estiver setado, envia ao Sentry via
 * protocolo de envelope (sem dependência do SDK). Best-effort, nunca lança.
 */
export async function captureError(error: unknown, context?: Record<string, unknown>): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(err.message, { ...context, stack: err.stack });

  const dsn = env.SENTRY_DSN;
  if (!dsn) return;
  const parsed = parseDsn(dsn);
  if (!parsed) return;

  try {
    const eventId = crypto.randomUUID().replace(/-/g, "");
    const sentAt = new Date().toISOString();
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: "node",
      level: "error",
      environment: env.NODE_ENV,
      exception: { values: [{ type: err.name, value: err.message, stacktrace: { frames: [] } }] },
      extra: context ?? {},
    };
    const envelope =
      JSON.stringify({ event_id: eventId, sent_at: sentAt }) +
      "\n" +
      JSON.stringify({ type: "event" }) +
      "\n" +
      JSON.stringify(event);

    await fetch(parsed.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=nexuserp/1.0`,
      },
      body: envelope,
    });
  } catch {
    /* nunca propaga falha de telemetria */
  }
}
