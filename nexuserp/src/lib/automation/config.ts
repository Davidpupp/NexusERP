import { prisma } from "@/lib/prisma";

/**
 * Configuração de automação por empresa. Persistida em `CompanyProfile.prefs.automation`.
 * Defaults = tudo ligado (comportamento atual). O motor lê isto e respeita os toggles
 * — config funcional, não decorativa.
 */
export interface AutomationConfig {
  autoStock: boolean;
  autoFinance: boolean;
  lowStockAlerts: boolean;
}

export const DEFAULT_AUTOMATION: AutomationConfig = {
  autoStock: true,
  autoFinance: true,
  lowStockAlerts: true,
};

export async function getAutomationConfig(companyId: string): Promise<AutomationConfig> {
  const profile = await prisma.companyProfile.findUnique({ where: { companyId }, select: { prefs: true } });
  const prefs = (profile?.prefs as Record<string, unknown> | null) ?? {};
  const a = (prefs.automation as Partial<AutomationConfig> | undefined) ?? {};
  return { ...DEFAULT_AUTOMATION, ...a };
}
