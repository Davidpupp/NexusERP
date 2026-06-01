import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { env } from "@/lib/env";
import { IntegrationsManager } from "@/components/app/integracoes/IntegrationsManager";

export default async function IntegracoesPage() {
  const { companyId } = await getCurrentCompany();
  const [integrations, bankCount] = await Promise.all([
    prisma.integration.findMany({ where: { companyId } }),
    prisma.bankConnection.count({ where: { companyId } }),
  ]);

  const byType: Record<string, { status: string; config: Record<string, unknown>; lastSyncAt: string | null }> = {};
  for (const i of integrations) {
    byType[i.type] = {
      status: i.status,
      config: (i.config as Record<string, unknown>) ?? {},
      lastSyncAt: i.lastSyncAt ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(i.lastSyncAt) : null,
    };
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <IntegrationsManager companyId={companyId} appUrl={appUrl} byType={byType} bankConnected={bankCount > 0} />
  );
}
