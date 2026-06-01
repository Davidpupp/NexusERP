import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { CustomerManager } from "@/components/app/clientes/CustomerManager";

export default async function ClientesPage() {
  const { companyId } = await getCurrentCompany();
  const customers = await prisma.customer.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const data = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    cnpj: c.cnpj,
    segment: c.segment,
    status: c.status,
    notes: c.notes,
  }));

  return (
    <div className="space-y-6">
      <CustomerManager customers={data} />
    </div>
  );
}
