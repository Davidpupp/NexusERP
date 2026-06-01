import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { OpportunityManager } from "@/components/app/vendas/OpportunityManager";

export default async function VendasPage() {
  const { companyId } = await getCurrentCompany();
  const [opportunities, customers] = await Promise.all([
    prisma.opportunity.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { customer: { select: { name: true } } },
    }),
    prisma.customer.findMany({ where: { companyId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const data = opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    estimatedValue: o.estimatedValue,
    stage: o.stage,
    customerId: o.customerId,
    customerName: o.customer?.name ?? null,
    nextAction: o.nextAction,
  }));

  return <OpportunityManager opportunities={data} customers={customers} />;
}
