"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { opportunitySchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type Stage = "NEW_LEAD" | "CONTACTED" | "PROPOSAL_SENT" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";

type OpportunityInput = {
  title: string;
  estimatedValue?: number;
  stage?: Stage;
  customerId?: string;
  nextAction?: string;
};

export async function createOpportunity(input: OpportunityInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("vendas");
    const parsed = opportunitySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const o = await prisma.opportunity.create({
      data: {
        companyId,
        title: d.title,
        estimatedValue: d.estimatedValue,
        stage: d.stage,
        customerId: d.customerId || null,
        nextAction: d.nextAction || null,
      },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "Opportunity", entityId: o.id });
    revalidatePath("/app/vendas");
    return { success: true, data: { id: o.id } };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("createOpportunity:", e);
    return { success: false, error: "Erro ao salvar oportunidade." };
  }
}

export async function updateOpportunity(id: string, input: OpportunityInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("vendas");
    const parsed = opportunitySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.opportunity.updateMany({
      where: { id, companyId },
      data: {
        title: d.title,
        estimatedValue: d.estimatedValue,
        stage: d.stage,
        customerId: d.customerId || null,
        nextAction: d.nextAction || null,
      },
    });
    if (res.count === 0) return { success: false, error: "Oportunidade não encontrada." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Opportunity", entityId: id });
    revalidatePath("/app/vendas");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("updateOpportunity:", e);
    return { success: false, error: "Erro ao atualizar oportunidade." };
  }
}

/** Move rápido de estágio (kanban). */
export async function moveOpportunityStage(id: string, stage: Stage): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("vendas");
    const res = await prisma.opportunity.updateMany({ where: { id, companyId }, data: { stage } });
    if (res.count === 0) return { success: false, error: "Oportunidade não encontrada." };
    await logAudit({ companyId, userId, action: "MOVE_STAGE", entity: "Opportunity", entityId: id });
    revalidatePath("/app/vendas");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("moveOpportunityStage:", e);
    return { success: false, error: "Erro ao mover oportunidade." };
  }
}

export async function deleteOpportunity(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("vendas");
    const res = await prisma.opportunity.deleteMany({ where: { id, companyId } });
    if (res.count === 0) return { success: false, error: "Oportunidade não encontrada." };
    await logAudit({ companyId, userId, action: "DELETE", entity: "Opportunity", entityId: id });
    revalidatePath("/app/vendas");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("deleteOpportunity:", e);
    return { success: false, error: "Erro ao excluir oportunidade." };
  }
}
