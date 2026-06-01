import { Wallet, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { isPluggyEnabled } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/app/StatCard";
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
    { label: "Saldo Atual", value: formatCurrency(balance), icon: Wallet, color: "#FFD400" },
    { label: "Receitas (pagas)", value: formatCurrency(paidIncome), icon: TrendingUp, color: "#16A34A" },
    { label: "Despesas (pagas)", value: formatCurrency(paidExpense), icon: TrendingDown, color: "#DC2626" },
    { label: "Pendências", value: formatCurrency(pending), icon: Clock, color: "#F59E0B" },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} label={kpi.label} value={kpi.value} change={0} icon={kpi.icon} iconColor={kpi.color} />
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
