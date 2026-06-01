import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { formatCurrency } from "@/lib/utils";
import { PedidosManager } from "@/components/app/pedidos/PedidosManager";

export default async function PedidosPage() {
  const { companyId } = await getCurrentCompany();
  const [sales, customers, products] = await Promise.all([
    prisma.sale.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { items: true, customer: { select: { name: true } } },
    }),
    prisma.customer.findMany({ where: { companyId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ where: { companyId }, orderBy: { name: "asc" }, select: { id: true, name: true, salePrice: true } }),
  ]);

  const paidTotal = sales.filter((s) => s.status === "PAID").reduce((acc, s) => acc + s.total, 0);
  const openTotal = sales.filter((s) => s.status === "CONFIRMED").reduce((acc, s) => acc + s.total, 0);

  const kpis = [
    { label: "Pedidos", value: String(sales.length) },
    { label: "Faturado (pago)", value: formatCurrency(paidTotal) },
    { label: "Em aberto", value: formatCurrency(openTotal) },
  ];

  const rows = sales.map((s) => ({
    id: s.id,
    customerName: s.customer?.name ?? null,
    source: s.source,
    status: s.status,
    total: s.total,
    itemsCount: s.items.length,
    date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(s.createdAt),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-graphite-surface rounded-xl p-5 border border-d-border">
            <p className="text-xs text-d-on-surface-variant mb-2">{kpi.label}</p>
            <p className="text-xl font-bold font-sora text-ice-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <PedidosManager sales={rows} customers={customers} products={products} />
    </div>
  );
}
