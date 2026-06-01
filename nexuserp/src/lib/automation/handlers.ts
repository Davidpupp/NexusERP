import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getAutomationConfig } from "@/lib/automation/config";

/**
 * Motor de automações (in-process). Reage a eventos de domínio executando ações
 * locais (estoque, financeiro, notificações). Cada handler é isolado: falha de
 * automação não quebra a operação que emitiu o evento, e tudo é registrado em
 * AutomationLog. Ações pesadas/externas devem virar Jobs (fila) nas próximas fases.
 */

export interface SaleEventItem {
  productId?: string | null;
  description: string;
  quantity: number;
  total: number;
}
export interface SalePayload {
  saleId: string;
  total: number;
  items: SaleEventItem[];
}

async function log(
  companyId: string | null,
  eventType: string,
  action: string,
  status: "success" | "warning" | "error" | "skipped",
  message?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.automationLog.create({
      data: { companyId, eventType, action, status, message: message ?? null, metadata: metadata as object | undefined },
    });
  } catch (e) {
    console.error("automationLog:", e);
  }
}

/** Venda criada → baixa estoque + gera financeiro previsto + alertas de estoque.
 *  Respeita a config de automação da empresa (toggles funcionais). */
async function onSaleCreated(companyId: string, p: SalePayload): Promise<void> {
  const cfg = await getAutomationConfig(companyId);
  const lowStock: string[] = [];
  const outStock: string[] = [];

  await prisma.$transaction(async (tx) => {
    if (cfg.autoStock) {
      for (const item of p.items) {
        if (!item.productId) continue;
        const prod = await tx.product.findFirst({ where: { id: item.productId, companyId } });
        if (!prod) continue;
        const newQty = Math.max(0, prod.quantity - item.quantity);
        await tx.product.update({ where: { id: prod.id }, data: { quantity: newQty } });
        await tx.inventoryMovement.create({
          data: { productId: prod.id, companyId, type: "OUT", quantity: item.quantity, source: "sale", referenceId: p.saleId },
        });
        if (newQty <= 0) outStock.push(prod.name);
        else if (newQty <= prod.minQuantity) lowStock.push(prod.name);
      }
    }

    if (cfg.autoFinance) {
      // Movimentação financeira PREVISTA (a receber) vinculada à venda.
      await tx.transaction.create({
        data: {
          companyId,
          description: `Venda ${p.saleId.slice(0, 8)}`,
          category: "Vendas",
          type: "INCOME",
          amount: p.total,
          status: "PENDING",
          source: "sale",
          dueDate: new Date(),
        },
      });
    }
  });

  const did = [cfg.autoStock && "estoque", cfg.autoFinance && "financeiro"].filter(Boolean).join(" e ");
  await createNotification({
    companyId,
    type: "sale.created",
    severity: "success",
    title: "Venda registrada",
    message: did ? `${did[0].toUpperCase()}${did.slice(1)} atualizado(s) automaticamente.` : "Venda registrada.",
  });
  if (cfg.lowStockAlerts) {
    for (const name of lowStock) {
      await createNotification({ companyId, type: "stock.low", severity: "warning", title: "Estoque baixo", message: `${name} atingiu o estoque mínimo.` });
    }
    for (const name of outStock) {
      await createNotification({ companyId, type: "stock.out", severity: "error", title: "Estoque esgotado", message: `${name} ficou sem estoque.` });
    }
  }
  await log(companyId, "sale.created", "update_stock+create_financial", "success", `cfg{stock:${cfg.autoStock},fin:${cfg.autoFinance}} itens:${p.items.length} baixo:${lowStock.length} esgotado:${outStock.length}`);
}

/** Venda cancelada → devolve estoque (ajuste) + notifica. */
async function onSaleCanceled(companyId: string, p: SalePayload): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of p.items) {
      if (!item.productId) continue;
      const prod = await tx.product.findFirst({ where: { id: item.productId, companyId } });
      if (!prod) continue;
      await tx.product.update({ where: { id: prod.id }, data: { quantity: prod.quantity + item.quantity } });
      await tx.inventoryMovement.create({
        data: { productId: prod.id, companyId, type: "IN", quantity: item.quantity, source: "sale", referenceId: p.saleId, notes: "Devolução por cancelamento" },
      });
    }
  });
  await createNotification({ companyId, type: "sale.canceled", severity: "info", title: "Venda cancelada", message: "Estoque devolvido automaticamente." });
  await log(companyId, "sale.canceled", "restock", "success", `itens: ${p.items.length}`);
}

/** Venda paga → notifica (conciliação financeira detalhada vem nas próximas fases). */
async function onSalePaid(companyId: string, p: SalePayload): Promise<void> {
  await createNotification({ companyId, type: "sale.paid", severity: "success", title: "Venda paga", message: `Venda ${p.saleId.slice(0, 8)} marcada como paga.` });
  await log(companyId, "sale.paid", "notify", "success");
}

export async function runAutomations(
  type: string,
  companyId: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    if (type === "sale.created") await onSaleCreated(companyId, payload as unknown as SalePayload);
    else if (type === "sale.canceled") await onSaleCanceled(companyId, payload as unknown as SalePayload);
    else if (type === "sale.paid") await onSalePaid(companyId, payload as unknown as SalePayload);
  } catch (e) {
    console.error("runAutomations:", type, e);
    await log(companyId, type, "dispatch", "error", e instanceof Error ? e.message : String(e));
  }
}
