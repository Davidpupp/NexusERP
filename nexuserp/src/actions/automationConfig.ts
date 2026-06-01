"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireModuleMutation, logAudit, ForbiddenError } from "@/lib/action-context";
import type { AutomationConfig } from "@/lib/automation/config";
import type { Prisma } from "@/generated/prisma/client";
import type { ActionResult } from "@/types";

export async function saveAutomationConfig(input: AutomationConfig): Promise<ActionResult<null>> {
  try {
    const { companyId, userId, role } = await requireModuleMutation("configuracoes");
    if (role !== "OWNER" && role !== "ADMIN") return { success: false, error: "Apenas proprietário/administrador." };

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { segment: true, profile: { select: { prefs: true } } },
    });
    const prefs = (company?.profile?.prefs as Record<string, unknown> | null) ?? {};
    const merged = {
      ...prefs,
      automation: {
        autoStock: !!input.autoStock,
        autoFinance: !!input.autoFinance,
        lowStockAlerts: !!input.lowStockAlerts,
      },
    } as Prisma.InputJsonValue;

    await prisma.companyProfile.upsert({
      where: { companyId },
      update: { prefs: merged },
      create: { companyId, segment: company?.segment ?? "outro", prefs: merged },
    });
    await logAudit({ companyId, userId, action: "UPDATE", entity: "AutomationConfig" });
    revalidatePath("/app/configuracoes");
    return { success: true, data: null };
  } catch (e) {
    if (e instanceof ForbiddenError) return { success: false, error: e.message };
    console.error("saveAutomationConfig:", e);
    return { success: false, error: "Erro ao salvar configuração." };
  }
}
