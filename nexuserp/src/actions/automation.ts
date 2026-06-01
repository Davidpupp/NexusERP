"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { automationSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

function fail(e: unknown, msg: string): ActionResult<never> {
  if (e instanceof ForbiddenError) return { success: false, error: e.message };
  console.error(msg, e);
  return { success: false, error: msg };
}

type AutomationInput = {
  name: string;
  description?: string;
  trigger: string;
  action: string;
  status?: "ACTIVE" | "PAUSED";
};

export async function createAutomation(input: AutomationInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("automacoes");
    const parsed = automationSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const a = await prisma.automation.create({
      data: { companyId, name: d.name, description: d.description || null, trigger: d.trigger, action: d.action, status: d.status },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "Automation", entityId: a.id });
    revalidatePath("/app/automacoes");
    return { success: true, data: { id: a.id } };
  } catch (e) {
    return fail(e, "Erro ao salvar automação.");
  }
}

export async function updateAutomation(id: string, input: AutomationInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("automacoes");
    const parsed = automationSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.automation.updateMany({
      where: { id, companyId },
      data: { name: d.name, description: d.description || null, trigger: d.trigger, action: d.action, status: d.status },
    });
    if (res.count === 0) return { success: false, error: "Automação não encontrada." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Automation", entityId: id });
    revalidatePath("/app/automacoes");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao atualizar automação.");
  }
}

export async function toggleAutomation(id: string, status: "ACTIVE" | "PAUSED"): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("automacoes");
    const res = await prisma.automation.updateMany({ where: { id, companyId }, data: { status } });
    if (res.count === 0) return { success: false, error: "Automação não encontrada." };
    await logAudit({ companyId, userId, action: "TOGGLE", entity: "Automation", entityId: id });
    revalidatePath("/app/automacoes");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao alterar automação.");
  }
}

export async function deleteAutomation(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("automacoes");
    const res = await prisma.automation.deleteMany({ where: { id, companyId } });
    if (res.count === 0) return { success: false, error: "Automação não encontrada." };
    await logAudit({ companyId, userId, action: "DELETE", entity: "Automation", entityId: id });
    revalidatePath("/app/automacoes");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao excluir automação.");
  }
}
