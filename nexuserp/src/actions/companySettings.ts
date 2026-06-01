"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import { companySettingsSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

function fail(e: unknown, msg: string): ActionResult<never> {
  if (e instanceof ForbiddenError) return { success: false, error: e.message };
  console.error(msg, e);
  return { success: false, error: msg };
}

export async function updateCompanySettings(input: { name: string; cnpj?: string }): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await requireModuleMutation("configuracoes");
    const parsed = companySettingsSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
    const d = parsed.data;
    await prisma.company.update({ where: { id: companyId }, data: { name: d.name, cnpj: d.cnpj || null } });
    await logAudit({ companyId, userId, action: "UPDATE", entity: "Company", entityId: companyId });
    revalidatePath("/app/configuracoes");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao salvar configurações.");
  }
}

const ROLES = ["OWNER", "ADMIN", "MANAGER", "FINANCE", "SALES", "OPERATION", "CLIENT"] as const;

export async function updateMemberRole(
  memberId: string,
  role: (typeof ROLES)[number]
): Promise<ActionResult<null>> {
  try {
    const { companyId, userId, role: myRole } = await requireModuleMutation("configuracoes");
    if (myRole !== "OWNER") return { success: false, error: "Apenas o proprietário pode alterar papéis." };
    if (!ROLES.includes(role)) return { success: false, error: "Papel inválido." };
    const res = await prisma.companyMember.updateMany({ where: { id: memberId, companyId }, data: { role } });
    if (res.count === 0) return { success: false, error: "Membro não encontrado." };
    await logAudit({ companyId, userId, action: "UPDATE_ROLE", entity: "CompanyMember", entityId: memberId });
    revalidatePath("/app/configuracoes");
    return { success: true, data: null };
  } catch (e) {
    return fail(e, "Erro ao alterar papel.");
  }
}
