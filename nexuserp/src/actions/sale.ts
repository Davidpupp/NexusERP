"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { saleSchema } from "@/lib/validations";
import { emitEvent } from "@/lib/events";
import type { ActionResult } from "@/types";

type SaleStatus = "DRAFT" | "CONFIRMED" | "PAID" | "CANCELED";

function revalidateSale() {
  for (const p of ["/app/pedidos", "/app/estoque", "/app/financeiro", "/app/dashboard"]) revalidatePath(p);
}

export async function createSale(input: {
  customerId?: string;
  notes?: string;
  items: { productId?: string; description: string; quantity: number; unitPrice: number }[];
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("pedidos");
    const parsed = saleSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;

    const items = d.items.map((i) => ({
      productId: i.productId || null,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.quantity * i.unitPrice,
    }));
    const total = items.reduce((s, i) => s + i.total, 0);

    const sale = await prisma.sale.create({
      data: {
        companyId,
        customerId: d.customerId || null,
        source: "MANUAL",
        status: "CONFIRMED",
        total,
        notes: d.notes || null,
        items: { create: items.map((i) => ({ productId: i.productId, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })) },
      },
    });

    await logAudit({ companyId, userId, action: "CREATE", entity: "Sale", entityId: sale.id });

    // Automação: baixa estoque + financeiro previsto + alertas (motor de eventos).
    await emitEvent("sale.created", companyId, {
      saleId: sale.id,
      total,
      items: items.map((i) => ({ productId: i.productId, description: i.description, quantity: i.quantity, total: i.total })),
    });

    revalidateSale();
    return { success: true, data: { id: sale.id } };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("createSale:", e);
    return { success: false, error: "Erro ao registrar venda." };
  }
}

export async function updateSaleStatus(id: string, status: SaleStatus): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("pedidos");
    const sale = await prisma.sale.findFirst({ where: { id, companyId }, include: { items: true } });
    if (!sale) return { success: false, error: "Venda não encontrada." };

    await prisma.sale.updateMany({ where: { id, companyId }, data: { status } });
    await logAudit({ companyId, userId, action: "UPDATE_STATUS", entity: "Sale", entityId: id, metadata: { status } });

    const payload = {
      saleId: sale.id,
      total: sale.total,
      items: sale.items.map((i) => ({ productId: i.productId, description: i.description, quantity: i.quantity, total: i.total })),
    };
    if (status === "PAID") await emitEvent("sale.paid", companyId, payload);
    else if (status === "CANCELED") await emitEvent("sale.canceled", companyId, payload);

    revalidateSale();
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("updateSaleStatus:", e);
    return { success: false, error: "Erro ao atualizar a venda." };
  }
}

export async function deleteSale(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("pedidos");
    const owned = await prisma.sale.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!owned) return { success: false, error: "Venda não encontrada." };
    await prisma.sale.delete({ where: { id } }); // itens em cascade
    await logAudit({ companyId, userId, action: "DELETE", entity: "Sale", entityId: id });
    revalidateSale();
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("deleteSale:", e);
    return { success: false, error: "Erro ao excluir a venda." };
  }
}
