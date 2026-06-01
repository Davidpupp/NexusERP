"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { transactionSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type TransactionInput = {
  description: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
  method?: string;
  dueDate?: string;
};

export async function createTransaction(input: TransactionInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("financeiro");
    const parsed = transactionSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;

    const tx = await prisma.transaction.create({
      data: {
        companyId,
        description: d.description,
        category: d.category,
        type: d.type,
        amount: d.amount,
        status: d.status,
        method: d.method || null,
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
        paidAt: d.status === "PAID" ? new Date() : null,
      },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "Transaction", entityId: tx.id });
    revalidatePath("/app/financeiro");
    return { success: true, data: { id: tx.id } };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("createTransaction:", e);
    return { success: false, error: "Erro ao salvar transação." };
  }
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("financeiro");
    const parsed = transactionSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;

    const res = await prisma.transaction.updateMany({
      where: { id, companyId },
      data: {
        description: d.description,
        category: d.category,
        type: d.type,
        amount: d.amount,
        status: d.status,
        method: d.method || null,
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
      },
    });
    if (res.count === 0) return { success: false, error: "Transação não encontrada." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Transaction", entityId: id });
    revalidatePath("/app/financeiro");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("updateTransaction:", e);
    return { success: false, error: "Erro ao atualizar transação." };
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("financeiro");
    const res = await prisma.transaction.deleteMany({ where: { id, companyId } });
    if (res.count === 0) return { success: false, error: "Transação não encontrada." };
    await logAudit({ companyId, userId, action: "DELETE", entity: "Transaction", entityId: id });
    revalidatePath("/app/financeiro");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("deleteTransaction:", e);
    return { success: false, error: "Erro ao excluir transação." };
  }
}
