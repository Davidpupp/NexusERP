import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/platform-admin";
import { SolicitacoesManager } from "@/components/admin/SolicitacoesManager";

export const dynamic = "force-dynamic";

/**
 * Área de plataforma: solicitações de contratação do plano sob consulta
 * (Leads vindos do formulário público /adquirir). Guard reaplicado aqui por
 * segurança, além do layout.
 */
export default async function AdminPage() {
  await requirePlatformAdmin();

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <SolicitacoesManager
      leads={leads.map((l) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        segment: l.segment,
        usersQuantity: l.usersQuantity,
        mainNeed: l.mainNeed,
        message: l.message,
        status: l.status,
        createdAt: l.createdAt.toISOString(),
      }))}
      newCount={newCount}
    />
  );
}
