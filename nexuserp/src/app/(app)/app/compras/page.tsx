import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { ComprasManager } from "@/components/app/compras/ComprasManager";

export default async function ComprasPage() {
  const { companyId } = await getCurrentCompany();
  const [suppliers, orders] = await Promise.all([
    prisma.supplier.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.purchaseOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { supplier: { select: { name: true } } },
    }),
  ]);

  return (
    <ComprasManager
      suppliers={suppliers.map((s) => ({ id: s.id, name: s.name, email: s.email, phone: s.phone, cnpj: s.cnpj }))}
      orders={orders.map((o) => ({
        id: o.id,
        supplierId: o.supplierId,
        supplierName: o.supplier?.name ?? null,
        total: o.total,
        status: o.status,
        expectedDate: o.expectedDate ? o.expectedDate.toISOString() : null,
      }))}
    />
  );
}
