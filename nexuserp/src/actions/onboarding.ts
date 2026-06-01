"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { logAudit } from "@/lib/action-context";
import { getSegment } from "@/lib/onboarding-config";
import type { ActionResult } from "@/types";

interface OnboardingInput {
  segment: string;
  companySize?: string;
  channels?: string[];
}

/**
 * Configura a empresa a partir do modelo de negócio: persiste o perfil,
 * define os módulos primários, semeia centros de custo padrão do segmento
 * e marca o onboarding como concluído.
 */
export async function saveOnboarding(input: OnboardingInput): Promise<ActionResult<null>> {
  try {
    const { companyId, userId } = await getCurrentCompany();
    const seg = getSegment(input.segment);

    await prisma.$transaction(async (tx) => {
      await tx.companyProfile.upsert({
        where: { companyId },
        create: {
          companyId,
          segment: seg.id,
          companySize: input.companySize ?? null,
          channels: input.channels ?? [],
          primaryModules: seg.primaryModules,
          prefs: { financeCategories: seg.financeCategories },
          onboardedAt: new Date(),
        },
        update: {
          segment: seg.id,
          companySize: input.companySize ?? null,
          channels: input.channels ?? [],
          primaryModules: seg.primaryModules,
          prefs: { financeCategories: seg.financeCategories },
          onboardedAt: new Date(),
        },
      });

      await tx.company.update({ where: { id: companyId }, data: { segment: seg.label } });

      // Semeia centros de custo padrão (sem duplicar).
      const existing = await tx.costCenter.findMany({ where: { companyId }, select: { name: true } });
      const have = new Set(existing.map((c) => c.name));
      const toCreate = seg.costCenters.filter((n) => !have.has(n));
      if (toCreate.length > 0) {
        await tx.costCenter.createMany({ data: toCreate.map((name) => ({ companyId, name })) });
      }
    });

    await logAudit({ companyId, userId, action: "ONBOARDING", entity: "Company", entityId: companyId });
    return { success: true, data: null };
  } catch (e) {
    console.error("saveOnboarding:", e);
    return { success: false, error: "Erro ao concluir configuração." };
  }
}
