import { prisma } from "@/lib/prisma";
import { enqueueJob, processJobs } from "@/lib/jobs";
import { safeEqual } from "@/lib/crypto";

/**
 * Endpoint de cron (Vercel Cron). Protegido por CRON_SECRET — o Vercel envia
 * `Authorization: Bearer <CRON_SECRET>` automaticamente quando a env existe.
 * Enfileira os jobs periódicos por empresa ativa e processa a fila.
 * Sem efeito se CRON_SECRET não estiver configurado (nega acesso).
 */
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  const qs = new URL(req.url).searchParams.get("secret") ?? "";
  return safeEqual(auth, `Bearer ${secret}`) || safeEqual(qs, secret);
}

async function handle(req: Request): Promise<Response> {
  if (!authorized(req)) return new Response("unauthorized", { status: 401 });

  const subs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    select: { companyId: true },
    distinct: ["companyId"],
  });
  const companyIds = subs.map((s) => s.companyId);

  for (const companyId of companyIds) {
    await enqueueJob("stock.low.check", { companyId });
    await enqueueJob("finance.overdue.check", { companyId });
    await enqueueJob("report.daily", { companyId });
  }

  const result = await processJobs(300);
  return Response.json({ ok: true, companies: companyIds.length, ...result });
}

export async function GET(req: Request): Promise<Response> {
  return handle(req);
}
export async function POST(req: Request): Promise<Response> {
  return handle(req);
}
