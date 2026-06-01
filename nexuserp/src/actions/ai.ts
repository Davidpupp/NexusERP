"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { isAiEnabled } from "@/lib/env";
import { generateInsights, askNexus } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { captureError } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Monta um resumo dos dados da empresa logada (escopo por companyId). */
async function buildCompanySummary(companyId: string) {
  const [transactions, customers, products, opportunities, ordersCount] = await Promise.all([
    prisma.transaction.findMany({ where: { companyId }, select: { type: true, amount: true, status: true, category: true } }),
    prisma.customer.count({ where: { companyId } }),
    prisma.product.findMany({ where: { companyId }, select: { quantity: true, minQuantity: true } }),
    prisma.opportunity.findMany({ where: { companyId }, select: { estimatedValue: true, stage: true } }),
    prisma.order.count({ where: { companyId } }),
  ]);

  const revenuePaid = transactions.filter((t) => t.type === "INCOME" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const expensePaid = transactions.filter((t) => t.type === "EXPENSE" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const overdue = transactions.filter((t) => t.status === "OVERDUE").reduce((s, t) => s + t.amount, 0);
  const receivable = transactions.filter((t) => t.type === "INCOME" && t.status === "PENDING").reduce((s, t) => s + t.amount, 0);
  const lowStock = products.filter((p) => p.quantity < p.minQuantity).length;
  const pipeline = opportunities.filter((o) => o.stage !== "CLOSED_WON" && o.stage !== "CLOSED_LOST").reduce((s, o) => s + o.estimatedValue, 0);

  return {
    receitaPaga: revenuePaid,
    despesaPaga: expensePaid,
    lucro: revenuePaid - expensePaid,
    contasVencidas: overdue,
    aReceber: receivable,
    clientes: customers,
    pedidos: ordersCount,
    produtosEstoqueCritico: lowStock,
    pipelineAberto: pipeline,
    totalTransacoes: transactions.length,
  };
}

export async function getDashboardInsights(): Promise<ActionResult<{ insights: string }>> {
  if (!isAiEnabled) return { success: false, error: "IA não configurada (defina ANTHROPIC_API_KEY)." };
  try {
    const { companyId } = await getCurrentCompany();
    const ip = await getClientIp();
    if (!(await rateLimit(`ai:${companyId}:${ip}`, 20, 10 * 60_000)).success) {
      return { success: false, error: "Muitas solicitações de IA. Aguarde um momento." };
    }
    const summary = await buildCompanySummary(companyId);
    const insights = await generateInsights(summary);
    return { success: true, data: { insights } };
  } catch (e) {
    await captureError(e, { scope: "ai-insights" });
    return { success: false, error: "Erro ao gerar insights." };
  }
}

export async function askNexusIa(question: string): Promise<ActionResult<{ answer: string }>> {
  if (!isAiEnabled) return { success: false, error: "IA não configurada (defina ANTHROPIC_API_KEY)." };
  if (!question.trim() || question.length > 500) return { success: false, error: "Pergunta inválida." };
  try {
    const { companyId } = await getCurrentCompany();
    const ip = await getClientIp();
    if (!(await rateLimit(`ai:${companyId}:${ip}`, 20, 10 * 60_000)).success) {
      return { success: false, error: "Muitas solicitações de IA. Aguarde um momento." };
    }
    const context = await buildCompanySummary(companyId);
    const answer = await askNexus(question, context);
    return { success: true, data: { answer } };
  } catch (e) {
    await captureError(e, { scope: "ai-ask" });
    return { success: false, error: "Erro ao consultar a IA." };
  }
}
