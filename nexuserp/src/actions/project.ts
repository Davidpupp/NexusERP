"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { projectSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELED";
type ProjectInput = {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
};

function fail(e: unknown, msg: string): ActionResult<never> {
  if (e instanceof ForbiddenError) return { success: false, error: e.message };
  console.error(msg, e);
  return { success: false, error: msg };
}

export async function createProject(input: ProjectInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("projetos");
    const parsed = projectSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const p = await prisma.project.create({
      data: {
        companyId,
        name: d.name,
        description: d.description || null,
        status: d.status,
        startDate: d.startDate ? new Date(d.startDate) : null,
        endDate: d.endDate ? new Date(d.endDate) : null,
      },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "Project", entityId: p.id });
    revalidatePath("/app/projetos");
    return { success: true, data: { id: p.id } };
  } catch (e) {
    return fail(e, "Erro ao salvar projeto.");
  }
}

export async function updateProject(id: string, input: ProjectInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("projetos");
    const parsed = projectSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.project.updateMany({
      where: { id, companyId },
      data: {
        name: d.name,
        description: d.description || null,
        status: d.status,
        startDate: d.startDate ? new Date(d.startDate) : null,
        endDate: d.endDate ? new Date(d.endDate) : null,
      },
    });
    if (res.count === 0) return { success: false, error: "Projeto não encontrado." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Project", entityId: id });
    revalidatePath("/app/projetos");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao atualizar projeto.");
  }
}

export async function deleteProject(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("projetos");
    const owned = await prisma.project.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!owned) return { success: false, error: "Projeto não encontrado." };
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);
    await logAudit({ companyId, userId, action: "DELETE", entity: "Project", entityId: id });
    revalidatePath("/app/projetos");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao excluir projeto.");
  }
}
