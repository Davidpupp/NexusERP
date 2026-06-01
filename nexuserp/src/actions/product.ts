"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { productSchema, inventoryMovementSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type ProductInput = {
  name: string;
  sku?: string;
  category?: string;
  quantity?: number;
  minQuantity?: number;
  costPrice?: number;
  salePrice?: number;
  supplierId?: string;
};

export async function createProduct(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("estoque");
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const p = await prisma.product.create({
      data: {
        companyId,
        name: d.name,
        sku: d.sku || null,
        category: d.category || null,
        quantity: d.quantity,
        minQuantity: d.minQuantity,
        costPrice: d.costPrice,
        salePrice: d.salePrice,
        supplierId: d.supplierId || null,
      },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "Product", entityId: p.id });
    revalidatePath("/app/estoque");
    return { success: true, data: { id: p.id } };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("createProduct:", e);
    return { success: false, error: "Erro ao salvar produto." };
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("estoque");
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.product.updateMany({
      where: { id, companyId },
      data: {
        name: d.name,
        sku: d.sku || null,
        category: d.category || null,
        quantity: d.quantity,
        minQuantity: d.minQuantity,
        costPrice: d.costPrice,
        salePrice: d.salePrice,
        supplierId: d.supplierId || null,
      },
    });
    if (res.count === 0) return { success: false, error: "Produto não encontrado." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Product", entityId: id });
    revalidatePath("/app/estoque");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("updateProduct:", e);
    return { success: false, error: "Erro ao atualizar produto." };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("estoque");
    // Remove movimentos antes (FK) e o produto, escopado por empresa.
    const owned = await prisma.product.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!owned) return { success: false, error: "Produto não encontrado." };
    await prisma.$transaction([
      prisma.inventoryMovement.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
    await logAudit({ companyId, userId, action: "DELETE", entity: "Product", entityId: id });
    revalidatePath("/app/estoque");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("deleteProduct:", e);
    return { success: false, error: "Erro ao excluir produto." };
  }
}

export async function adjustStock(input: {
  productId: string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  notes?: string;
}): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("estoque");
    const parsed = inventoryMovementSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;

    const product = await prisma.product.findFirst({ where: { id: d.productId, companyId } });
    if (!product) return { success: false, error: "Produto não encontrado." };

    const delta = d.type === "OUT" ? -Math.abs(d.quantity) : d.type === "IN" ? Math.abs(d.quantity) : d.quantity;
    const newQty = d.type === "ADJUST" ? d.quantity : product.quantity + delta;

    await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: { productId: d.productId, type: d.type, quantity: d.quantity, notes: d.notes || null },
      }),
      prisma.product.update({ where: { id: d.productId }, data: { quantity: Math.max(0, newQty) } }),
    ]);
    await logAudit({ companyId, userId, action: "ADJUST_STOCK", entity: "Product", entityId: d.productId });
    revalidatePath("/app/estoque");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("adjustStock:", e);
    return { success: false, error: "Erro ao ajustar estoque." };
  }
}
