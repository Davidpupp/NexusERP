"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { logAudit } from "@/lib/action-context";
import { getNiche, NICHES } from "@/lib/onboarding-config";
import type { ActionResult } from "@/types";

const NICHE_IDS = NICHES.map((n) => n.id) as [string, ...string[]];

const onboardingSchema = z.object({
  niche: z.enum(NICHE_IDS),
  answers: z.record(z.string(), z.union([z.string(), z.boolean()])).default({}),
  selectedModules: z.array(z.string()).default([]),
  companySize: z.string().optional(),
  initialData: z
    .object({
      companyName: z.string().trim().max(120).optional(),
      cnpj: z.string().trim().max(20).optional(),
      phone: z.string().trim().max(30).optional(),
      city: z.string().trim().max(80).optional(),
    })
    .optional(),
});

export type OnboardingInput = z.input<typeof onboardingSchema>;

/**
 * Configura a empresa a partir do nicho escolhido: persiste perfil (nicho,
 * respostas, módulos selecionados, config do dashboard), semeia centros de custo
 * e categorias do nicho, aplica dados iniciais opcionais e marca onboarding feito.
 */
export async function saveOnboarding(input: OnboardingInput): Promise<ActionResult<null>> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const d = parsed.data;

  try {
    const { companyId, userId } = await getCurrentCompany();
    const niche = getNiche(d.niche);

    // Só persiste módulos que de fato são recomendados pelo nicho (sem botão quebrado).
    const recommended = new Set<string>(niche.recommendedModules);
    const selected = d.selectedModules.filter((m) => recommended.has(m));
    const finalModules = selected.length > 0 ? selected : niche.recommendedModules;

    const dashboardConfig = { cards: niche.dashboardCards };
    const prefs = { financeCategories: niche.financeCategories, isPersonal: Boolean(niche.isPersonal) };

    await prisma.$transaction(async (tx) => {
      await tx.companyProfile.upsert({
        where: { companyId },
        create: {
          companyId,
          segment: niche.id,
          niche: niche.id,
          companySize: d.companySize ?? null,
          channels: [],
          primaryModules: finalModules,
          selectedModules: finalModules,
          onboardingAnswers: d.answers,
          dashboardConfig,
          prefs,
          onboardedAt: new Date(),
        },
        update: {
          segment: niche.id,
          niche: niche.id,
          companySize: d.companySize ?? null,
          primaryModules: finalModules,
          selectedModules: finalModules,
          onboardingAnswers: d.answers,
          dashboardConfig,
          prefs,
          onboardedAt: new Date(),
        },
      });

      // Dados iniciais opcionais da empresa (nome/CNPJ/segmento).
      const companyData: { name?: string; cnpj?: string | null; segment: string } = { segment: niche.label };
      if (d.initialData?.companyName) companyData.name = d.initialData.companyName;
      if (d.initialData?.cnpj !== undefined) companyData.cnpj = d.initialData.cnpj || null;
      await tx.company.update({ where: { id: companyId }, data: companyData });

      // Semeia centros de custo padrão do nicho (sem duplicar).
      const existing = await tx.costCenter.findMany({ where: { companyId }, select: { name: true } });
      const have = new Set(existing.map((c) => c.name));
      const toCreate = niche.costCenters.filter((n) => !have.has(n));
      if (toCreate.length > 0) {
        await tx.costCenter.createMany({ data: toCreate.map((name) => ({ companyId, name })) });
      }
    });

    await logAudit({ companyId, userId, action: "ONBOARDING", entity: "Company", entityId: companyId, metadata: { niche: niche.id } });
    return { success: true, data: null };
  } catch (e) {
    console.error("saveOnboarding:", e);
    return { success: false, error: "Erro ao concluir configuração." };
  }
}
