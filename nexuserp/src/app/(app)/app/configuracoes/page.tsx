import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
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
      <Link
        href="/onboarding?reconfig=1"
        className="card-dark p-5 flex items-center justify-between gap-4 group hover:border-nexus-yellow/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-nexus-yellow/15 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-nexus-yellow" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ice-white">Personalizar meu sistema</p>
            <p className="text-xs text-d-on-surface-variant mt-0.5">Altere o nicho, as perguntas e os módulos ativos do seu painel.</p>
          </div>
        </div>
        <ArrowRight size={18} className="text-d-on-surface-variant group-hover:text-nexus-yellow group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>

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
