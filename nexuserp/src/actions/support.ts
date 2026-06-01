"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { supportTicketSchema, supportMessageSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

function fail(e: unknown, msg: string): ActionResult<never> {
  if (e instanceof ForbiddenError) return { success: false, error: e.message };
  console.error(msg, e);
  return { success: false, error: msg };
}

type TicketInput = {
  subject: string;
  category?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status?: "OPEN" | "IN_PROGRESS" | "WAITING_CLIENT" | "RESOLVED" | "CLOSED";
  customerId?: string;
};

export async function createTicket(input: TicketInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { companyId, userId } = await requireModuleMutation("suporte");
    const parsed = supportTicketSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const t = await prisma.supportTicket.create({
      data: {
        companyId,
        userId,
        subject: d.subject,
        category: d.category || null,
        priority: d.priority,
        status: d.status,
        customerId: d.customerId || null,
      },
    });
    await logAudit({ companyId, userId, action: "CREATE", entity: "SupportTicket", entityId: t.id });
    revalidatePath("/app/suporte");
    return { success: true, data: { id: t.id } };
  } catch (e) {
    return fail(e, "Erro ao salvar chamado.");
  }
}

export async function updateTicket(id: string, input: TicketInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("suporte");
    const parsed = supportTicketSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    const res = await prisma.supportTicket.updateMany({
      where: { id, companyId },
      data: {
        subject: d.subject,
        category: d.category || null,
        priority: d.priority,
        status: d.status,
        customerId: d.customerId || null,
      },
    });
    if (res.count === 0) return { success: false, error: "Chamado não encontrado." };
    await logAudit({ companyId, userId, action: "UPDATE", entity: "SupportTicket", entityId: id });
    revalidatePath("/app/suporte");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao atualizar chamado.");
  }
}

export async function deleteTicket(id: string): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("suporte");
    const owned = await prisma.supportTicket.findFirst({ where: { id, companyId }, select: { id: true } });
    if (!owned) return { success: false, error: "Chamado não encontrado." };
    await prisma.$transaction([
      prisma.supportMessage.deleteMany({ where: { ticketId: id } }),
      prisma.supportTicket.delete({ where: { id } }),
    ]);
    await logAudit({ companyId, userId, action: "DELETE", entity: "SupportTicket", entityId: id });
    revalidatePath("/app/suporte");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao excluir chamado.");
  }
}

export async function addTicketMessage(ticketId: string, input: { content: string }): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("suporte");
    const parsed = supportMessageSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId, companyId }, select: { id: true } });
    if (!ticket) return { success: false, error: "Chamado não encontrado." };
    await prisma.supportMessage.create({ data: { ticketId, senderId: userId, content: parsed.data.content } });
    await logAudit({ companyId, userId, action: "MESSAGE", entity: "SupportTicket", entityId: ticketId });
    revalidatePath("/app/suporte");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao enviar mensagem.");
  }
}
