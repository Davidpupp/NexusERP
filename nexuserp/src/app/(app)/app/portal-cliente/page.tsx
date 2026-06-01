import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function PortalClientePage() {
  const { companyId, companyName } = await getCurrentCompany();

  const [tickets, orders] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { companyId, status: { in: ["OPEN", "IN_PROGRESS", "WAITING_CLIENT"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, subject: true, status: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, total: true, status: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-graphite-surface rounded-xl p-6 border border-d-border">
        <h2 className="text-lg font-semibold text-ice-white font-sora">{companyName}</h2>
        <p className="text-sm text-d-on-surface-variant mt-1">Portal do cliente — acompanhe seus chamados e pedidos.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
          <div className="px-5 py-4 border-b border-d-border"><h3 className="text-sm font-semibold text-ice-white">Chamados abertos</h3></div>
          {tickets.length === 0 ? (
            <p className="px-5 py-8 text-sm text-d-on-surface-variant text-center">Nenhum chamado aberto.</p>
          ) : (
            <ul className="divide-y divide-d-border">
              {tickets.map((t) => (
                <li key={t.id} className="px-5 py-3 flex items-center justify-between">
                  <div><p className="text-sm text-ice-white">{t.subject}</p><p className="text-xs text-d-on-surface-variant">{formatDate(t.createdAt)}</p></div>
                  <StatusBadge label={t.status} tone="warning" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
          <div className="px-5 py-4 border-b border-d-border"><h3 className="text-sm font-semibold text-ice-white">Pedidos recentes</h3></div>
          {orders.length === 0 ? (
            <p className="px-5 py-8 text-sm text-d-on-surface-variant text-center">Nenhum pedido.</p>
          ) : (
            <ul className="divide-y divide-d-border">
              {orders.map((o) => (
                <li key={o.id} className="px-5 py-3 flex items-center justify-between">
                  <div><p className="text-sm text-ice-white tabular-nums">{formatCurrency(o.total)}</p><p className="text-xs text-d-on-surface-variant">{formatDate(o.createdAt)}</p></div>
                  <StatusBadge label={o.status} tone={o.status === "PAID" ? "success" : "neutral"} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
