"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { taskSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

type TaskStatus = "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
type TaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  projectId?: string;
  dueDate?: string;
};

function fail(e: unknown, msg: string): ActionResult<never> {
  if (e instanceof ForbiddenError) return { success: false, error: e.message };
  console.error(msg, e);
  return { success: false, error: msg };
}

export async function createTask(input: TaskInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("producao");
    const parsed = taskSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const t = await prisma.task.create({
      data: {
        companyId,
        title: d.title,
        description: d.description || null,
        status: d.status,
        priority: d.priority,
        projectId: d.projectId || null,
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
      },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "Task", entityId: t.id });
    revalidatePath("/app/producao");
    return { success: true, data: { id: t.id } };
  } catch (e) {
    return fail(e, "Erro ao salvar tarefa.");
  }
}

export async function updateTask(id: string, input: TaskInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("producao");
    const parsed = taskSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.task.updateMany({
      where: { id, companyId },
      data: {
        title: d.title,
        description: d.description || null,
        status: d.status,
        priority: d.priority,
        projectId: d.projectId || null,
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
      },
    });
    if (res.count === 0) return { success: false, error: "Tarefa não encontrada." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Task", entityId: id });
    revalidatePath("/app/producao");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao atualizar tarefa.");
  }
}

export async function moveTaskStatus(id: string, status: TaskStatus): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("producao");
    const res = await prisma.task.updateMany({ where: { id, companyId }, data: { status } });
    if (res.count === 0) return { success: false, error: "Tarefa não encontrada." };
    await logAudit({ companyId, userId, action: "MOVE_STATUS", entity: "Task", entityId: id });
    revalidatePath("/app/producao");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao mover tarefa.");
  }
}

export async function deleteTask(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("producao");
    const res = await prisma.task.deleteMany({ where: { id, companyId } });
    if (res.count === 0) return { success: false, error: "Tarefa não encontrada." };
    await logAudit({ companyId, userId, action: "DELETE", entity: "Task", entityId: id });
    revalidatePath("/app/producao");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao excluir tarefa.");
  }
}
