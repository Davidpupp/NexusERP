import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { SupportManager } from "@/components/app/suporte/SupportManager";

export default async function SuportePage() {
  const { companyId } = await getCurrentCompany();
  const [tickets, customers] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        customer: { select: { name: true } },
        messages: { orderBy: { createdAt: "asc" }, select: { id: true, content: true, createdAt: true } },
      },
    }),
    prisma.customer.findMany({ where: { companyId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <SupportManager
      tickets={tickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        customerId: t.customerId,
        customerName: t.customer?.name ?? null,
        messages: t.messages.map((m) => ({ id: m.id, content: m.content, createdAt: m.createdAt.toISOString() })),
      }))}
      customers={customers}
    />
  );
}
