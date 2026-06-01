import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { formatCurrency } from "@/lib/utils";
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
    { label: "Produtos (SKUs)", value: String(totalSkus), color: "text-ice-white" },
    { label: "Estoque crítico", value: String(lowStock), color: lowStock > 0 ? "text-warning" : "text-ice-white" },
    { label: "Valor em estoque", value: formatCurrency(stockValue), color: "text-ice-white" },
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
          <div key={kpi.label} className="bg-graphite-surface rounded-xl p-5 border border-d-border">
            <p className="text-xs text-d-on-surface-variant mb-2">{kpi.label}</p>
            <p className={`text-xl font-bold font-sora ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <ProductManager products={data} suppliers={suppliers} />
    </div>
  );
}
