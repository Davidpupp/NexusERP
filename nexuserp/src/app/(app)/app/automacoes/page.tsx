import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { AutomationManager } from "@/components/app/automacoes/AutomationManager";

export default async function AutomacoesPage() {
  const { companyId } = await getCurrentCompany();
  const automations = await prisma.automation.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <AutomationManager
      automations={automations.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        trigger: a.trigger,
        action: a.action,
        status: a.status,
      }))}
    />
  );
}
