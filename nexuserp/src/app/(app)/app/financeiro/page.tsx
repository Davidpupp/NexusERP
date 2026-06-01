import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { isPluggyEnabled } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";
import { TransactionManager } from "@/components/app/financeiro/TransactionManager";
import { BankPanel } from "@/components/app/financeiro/BankPanel";

export default async function FinanceiroPage() {
  const { companyId } = await getCurrentCompany();
  const [transactions, bankConnections] = await Promise.all([
    prisma.transaction.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.bankConnection.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } }),
  ]);

  const paidIncome = transactions.filter((t) => t.type === "INCOME" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const paidExpense = transactions.filter((t) => t.type === "EXPENSE" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const balance = paidIncome - paidExpense;
  const pending = transactions
    .filter((t) => t.status === "PENDING" || t.status === "OVERDUE")
    .reduce((s, t) => s + t.amount, 0);

  const kpis = [
    { label: "Saldo Atual", value: formatCurrency(balance), color: "text-ice-white" },
    { label: "Receitas (pagas)", value: formatCurrency(paidIncome), color: "text-success" },
    { label: "Despesas (pagas)", value: formatCurrency(paidExpense), color: "text-danger" },
    { label: "Pendências", value: formatCurrency(pending), color: "text-warning" },
  ];

  const data = transactions.map((t) => ({
    id: t.id,
    description: t.description,
    category: t.category,
    type: t.type,
    amount: t.amount,
    status: t.status,
    method: t.method,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-graphite-surface rounded-xl p-5 border border-d-border">
            <p className="text-xs text-d-on-surface-variant mb-2">{kpi.label}</p>
            <p className={`text-xl font-bold font-sora ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <BankPanel
        enabled={isPluggyEnabled}
        connections={bankConnections.map((c) => ({
          id: c.id,
          institutionName: c.institutionName,
          status: c.status,
          lastSyncAt: c.lastSyncAt ? c.lastSyncAt.toISOString() : null,
        }))}
      />

      <TransactionManager transactions={data} />
    </div>
  );
}
