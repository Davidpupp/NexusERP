import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { runJob } from "@/lib/automation/jobHandlers";

/**
 * Fila de jobs persistida no Postgres. Sem Redis: enfileira em `Job` e processa
 * por Vercel Cron (rota protegida). Claim atômico via updateMany para evitar
 * processamento duplicado entre invocações concorrentes.
 */
export async function enqueueJob(
  type: string,
  opts: { companyId?: string | null; payload?: Record<string, unknown>; scheduledAt?: Date; maxAttempts?: number } = {}
): Promise<string> {
  const job = await prisma.job.create({
    data: {
      type,
      companyId: opts.companyId ?? null,
      payload: (opts.payload ?? {}) as Prisma.InputJsonValue,
      scheduledAt: opts.scheduledAt ?? new Date(),
      maxAttempts: opts.maxAttempts ?? 5,
      status: "queued",
    },
  });
  return job.id;
}

const BACKOFF_MS = [0, 30_000, 2 * 60_000, 10 * 60_000, 30 * 60_000];

export async function processJobs(limit = 25): Promise<{ processed: number; failed: number }> {
  const now = new Date();
  const due = await prisma.job.findMany({
    where: { status: { in: ["queued", "retrying"] }, scheduledAt: { lte: now } },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });

  let processed = 0;
  let failed = 0;

  for (const job of due) {
    // Claim atômico: só processa quem conseguir mudar de queued/retrying → processing.
    const claim = await prisma.job.updateMany({
      where: { id: job.id, status: { in: ["queued", "retrying"] } },
      data: { status: "processing", startedAt: new Date() },
    });
    if (claim.count !== 1) continue;

    try {
      await runJob(job.type, job.companyId, (job.payload as Record<string, unknown>) ?? {});
      await prisma.job.update({ where: { id: job.id }, data: { status: "completed", completedAt: new Date(), lastError: null } });
      processed++;
    } catch (e) {
      const attempts = job.attempts + 1;
      const exhausted = attempts >= job.maxAttempts;
      const delay = BACKOFF_MS[Math.min(attempts, BACKOFF_MS.length - 1)];
      await prisma.job.update({
        where: { id: job.id },
        data: {
          attempts,
          status: exhausted ? "failed" : "retrying",
          scheduledAt: new Date(Date.now() + delay),
          lastError: e instanceof Error ? e.message : String(e),
        },
      });
      failed++;
    }
  }
  return { processed, failed };
}
