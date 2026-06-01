import { Receipt, CheckCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/app/StatCard";
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
    { label: "Pedidos", value: String(sales.length), icon: Receipt, color: "#FFD400" },
    { label: "Faturado (pago)", value: formatCurrency(paidTotal), icon: CheckCircle, color: "#16A34A" },
    { label: "Em aberto", value: formatCurrency(openTotal), icon: Clock, color: "#F59E0B" },
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
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={0} icon={kpi.icon} iconColor={kpi.color} />
        ))}
      </div>

      <PedidosManager sales={rows} customers={customers} products={products} />
    </div>
  );
}
