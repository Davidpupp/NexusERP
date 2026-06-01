import { Package, AlertTriangle, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/app/StatCard";
import { ProductManager } from "@/components/app/estoque/ProductManager";

export default async function EstoquePage() {
  const { companyId } = await getCurrentCompany();
  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.supplier.findMany({ where: { companyId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const totalSkus = products.length;
  const lowStock = products.filter((p) => p.quantity < p.minQuantity).length;
  const stockValue = products.reduce((s, p) => s + p.quantity * p.costPrice, 0);

  const kpis = [
    { label: "Produtos (SKUs)", value: String(totalSkus), icon: Package, color: "#FFD400" },
    { label: "Estoque crítico", value: String(lowStock), icon: AlertTriangle, color: lowStock > 0 ? "#F59E0B" : "#16A34A" },
    { label: "Valor em estoque", value: formatCurrency(stockValue), icon: DollarSign, color: "#4A90D9" },
  ];

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    quantity: p.quantity,
    minQuantity: p.minQuantity,
    costPrice: p.costPrice,
    salePrice: p.salePrice,
    supplierId: p.supplierId,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={0} icon={kpi.icon} iconColor={kpi.color} />
        ))}
      </div>

      <ProductManager products={data} suppliers={suppliers} />
    </div>
  );
}
