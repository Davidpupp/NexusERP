"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { customerSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type CustomerInput = {
  name: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  segment?: string;
  notes?: string;
};

export async function createCustomer(input: CustomerInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("clientes");
    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const c = await prisma.customer.create({
      data: {
        companyId,
        name: d.name,
        email: d.email || null,
        phone: d.phone || null,
        cnpj: d.cnpj || null,
        segment: d.segment || null,
        notes: d.notes || null,
      },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "Customer", entityId: c.id });
    revalidatePath("/app/clientes");
    return { success: true, data: { id: c.id } };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("createCustomer:", e);
    return { success: false, error: "Erro ao salvar cliente." };
  }
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("clientes");
    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.customer.updateMany({
      where: { id, companyId },
      data: {
        name: d.name,
        email: d.email || null,
        phone: d.phone || null,
        cnpj: d.cnpj || null,
        segment: d.segment || null,
        notes: d.notes || null,
      },
    });
    if (res.count === 0) return { success: false, error: "Cliente não encontrado." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Customer", entityId: id });
    revalidatePath("/app/clientes");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("updateCustomer:", e);
    return { success: false, error: "Erro ao atualizar cliente." };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("clientes");
    const res = await prisma.customer.deleteMany({ where: { id, companyId } });
    if (res.count === 0) return { success: false, error: "Cliente não encontrado." };
    await logAudit({ companyId, userId, action: "DELETE", entity: "Customer", entityId: id });
    revalidatePath("/app/clientes");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("deleteCustomer:", e);
    return { success: false, error: "Erro ao excluir cliente." };
  }
}
