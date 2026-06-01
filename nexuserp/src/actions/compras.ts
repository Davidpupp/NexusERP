"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { supplierSchema, purchaseOrderSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

function fail(e: unknown, msg: string): ActionResult<never> {
  if (e instanceof ForbiddenError) return { success: false, error: e.message };
  console.error(msg, e);
  return { success: false, error: msg };
}

// ── Fornecedores ──────────────────────────────────────────────────────────
type SupplierInput = { name: string; email?: string; phone?: string; cnpj?: string };

export async function createSupplier(input: SupplierInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("compras");
    const parsed = supplierSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const s = await prisma.supplier.create({
      data: { companyId, name: d.name, email: d.email || null, phone: d.phone || null, cnpj: d.cnpj || null },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "Supplier", entityId: s.id });
    revalidatePath("/app/compras");
    return { success: true, data: { id: s.id } };
  } catch (e) {
    return fail(e, "Erro ao salvar fornecedor.");
  }
}

export async function updateSupplier(id: string, input: SupplierInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("compras");
    const parsed = supplierSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.supplier.updateMany({
      where: { id, companyId },
      data: { name: d.name, email: d.email || null, phone: d.phone || null, cnpj: d.cnpj || null },
    });
    if (res.count === 0) return { success: false, error: "Fornecedor não encontrado." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Supplier", entityId: id });
    revalidatePath("/app/compras");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao atualizar fornecedor.");
  }
}

export async function deleteSupplier(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("compras");
    const res = await prisma.supplier.deleteMany({ where: { id, companyId } });
    if (res.count === 0) return { success: false, error: "Fornecedor não encontrado." };
    await logAudit({ companyId, userId, action: "DELETE", entity: "Supplier", entityId: id });
    revalidatePath("/app/compras");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao excluir fornecedor.");
  }
}

// ── Pedidos de compra ───────────────────────────────────────────────────────
type POInput = { supplierId?: string; total?: number; status?: string; expectedDate?: string };

export async function createPurchaseOrder(input: POInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("compras");
    const parsed = purchaseOrderSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const po = await prisma.purchaseOrder.create({
      data: {
        companyId,
        supplierId: d.supplierId || null,
        total: d.total,
        status: d.status,
        expectedDate: d.expectedDate ? new Date(d.expectedDate) : null,
      },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "PurchaseOrder", entityId: po.id });
    revalidatePath("/app/compras");
    return { success: true, data: { id: po.id } };
  } catch (e) {
    return fail(e, "Erro ao salvar pedido de compra.");
  }
}

export async function updatePurchaseOrder(id: string, input: POInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("compras");
    const parsed = purchaseOrderSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.purchaseOrder.updateMany({
      where: { id, companyId },
      data: {
        supplierId: d.supplierId || null,
        total: d.total,
        status: d.status,
        expectedDate: d.expectedDate ? new Date(d.expectedDate) : null,
      },
    });
    if (res.count === 0) return { success: false, error: "Pedido não encontrado." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "PurchaseOrder", entityId: id });
    revalidatePath("/app/compras");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao atualizar pedido.");
  }
}

export async function deletePurchaseOrder(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("compras");
    const res = await prisma.purchaseOrder.deleteMany({ where: { id, companyId } });
    if (res.count === 0) return { success: false, error: "Pedido não encontrado." };
    await logAudit({ companyId, userId, action: "DELETE", entity: "PurchaseOrder", entityId: id });
    revalidatePath("/app/compras");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao excluir pedido.");
  }
}
