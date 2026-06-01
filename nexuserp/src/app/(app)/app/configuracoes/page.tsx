import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { getAutomationConfig } from "@/lib/automation/config";
import { SettingsManager } from "@/components/app/configuracoes/SettingsManager";
import { AutomationSettings } from "@/components/app/configuracoes/AutomationSettings";
import { PrivacyPanel } from "@/components/app/configuracoes/PrivacyPanel";

export default async function ConfiguracoesPage() {
  const { companyId, role } = await getCurrentCompany();
  const automationConfig = await getAutomationConfig(companyId);
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      members: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!company) return null;

  return (
    <div className="space-y-6">
      <SettingsManager
        myRole={role}
        company={{ name: company.name, cnpj: company.cnpj }}
        members={company.members.map((m) => ({
          id: m.id,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
        }))}
      />
      <AutomationSettings config={automationConfig} />
      <PrivacyPanel isOwner={role === "OWNER"} />
    </div>
  );
}
