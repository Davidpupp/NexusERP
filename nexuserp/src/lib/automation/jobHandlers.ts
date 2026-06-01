import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { createNotification } from "@/lib/notifications";

/**
 * Handlers de jobs agendados (executados pela fila via Vercel Cron).
 * Cada um é idempotente o suficiente para rodar diariamente sem efeitos duplicados
 * perigosos, e sempre escopado por companyId.
 */

async function stockLowCheck(companyId: string): Promise<void> {
  const products = await prisma.product.findMany({
    where: { companyId },
    select: { name: true, quantity: true, minQuantity: true },
    take: 1000,
  });
  const low = products.filter((p) => p.quantity <= p.minQuantity);
  if (low.length === 0) return;
  const out = low.filter((p) => p.quantity <= 0).length;
  await createNotification({
    companyId,
    type: "stock.low.digest",
    severity: out > 0 ? "error" : "warning",
    title: `${low.length} produto(s) com estoque baixo`,
    message: `${out} esgotado(s). Verifique a reposição no módulo Estoque.`,
  });
}

async function financeOverdueCheck(companyId: string): Promise<void> {
  const now = new Date();
  const res = await prisma.transaction.updateMany({
    where: { companyId, status: "PENDING", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  });
  if (res.count > 0) {
    await createNotification({
      companyId,
      type: "finance.overdue",
      severity: "warning",
      title: `${res.count} conta(s) vencida(s)`,
      message: "Transações pendentes passaram do vencimento e foram marcadas como vencidas.",
    });
  }
}

async function reportDaily(companyId: string): Promise<void> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [salesToday, paidAgg, openAgg, productCount] = await Promise.all([
    prisma.sale.count({ where: { companyId, createdAt: { gte: start } } }),
    prisma.transaction.aggregate({ where: { companyId, type: "INCOME", status: "PAID" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { companyId, status: { in: ["PENDING", "OVERDUE"] } }, _sum: { amount: true } }),
    prisma.product.count({ where: { companyId } }),
  ]);

  const snapshot = {
    salesToday,
    revenuePaid: paidAgg._sum.amount ?? 0,
    openReceivables: openAgg._sum.amount ?? 0,
    productCount,
  };

  await prisma.report.create({
    data: {
      companyId,
      type: "daily",
      periodStart: start,
      periodEnd: new Date(),
      status: "ready",
      dataSnapshot: snapshot as Prisma.InputJsonValue,
    },
  });
  await createNotification({ companyId, type: "report.generated", severity: "info", title: "Relatório diário gerado", message: `${salesToday} venda(s) hoje.` });
}

export async function runJob(type: string, companyId: string | null, _payload: Record<string, unknown>): Promise<void> {
  if (!companyId) return; // jobs atuais são por empresa
  if (type === "stock.low.check") return stockLowCheck(companyId);
  if (type === "finance.overdue.check") return financeOverdueCheck(companyId);
  if (type === "report.daily") return reportDaily(companyId);
  // tipo desconhecido: no-op (não falha a fila)
}
