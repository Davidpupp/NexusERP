import { DollarSign, ShoppingBag, Users, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/app/StatCard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { isAiEnabled } from "@/lib/env";
import { formatCurrency, formatDate } from "@/lib/utils";
import { NexusInsights } from "@/components/app/NexusInsights";

export default async function DashboardPage() {
  const { companyId } = await getCurrentCompany();

  const [transactions, ordersCount, customersCount, products, recent] = await Promise.all([
    prisma.transaction.findMany({ where: { companyId }, select: { type: true, amount: true, status: true, category: true, createdAt: true } }),
    prisma.order.count({ where: { companyId } }),
    prisma.customer.count({ where: { companyId, status: "ACTIVE" } }),
    prisma.product.findMany({ where: { companyId }, select: { quantity: true, minQuantity: true } }),
    prisma.transaction.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, description: true, amount: true, type: true, createdAt: true },
    }),
  ]);

  const revenue = transactions.filter((t) => t.type === "INCOME" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const margin = revenue > 0 ? ((revenue - expense) / revenue) * 100 : 0;
  const lowStock = products.filter((p) => p.quantity < p.minQuantity).length;
  const receivable = transactions
    .filter((t) => t.type === "INCOME" && (t.status === "PENDING" || t.status === "OVERDUE"))
    .reduce((s, t) => s + t.amount, 0);
  const overdue = transactions.filter((t) => t.status === "OVERDUE").reduce((s, t) => s + t.amount, 0);

  // Série dos últimos 6 meses (receita x despesa, transações pagas).
  const MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const now = new Date();
  const revenueSeries = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, mes: MES[d.getMonth()], receita: 0, despesa: 0 };
  });
  const seriesByKey = new Map(revenueSeries.map((p) => [p.key, p]));
  for (const t of transactions) {
    if (t.status !== "PAID") continue;
    const d = new Date(t.createdAt);
    const p = seriesByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (!p) continue;
    if (t.type === "INCOME") p.receita += t.amount;
    else p.despesa += t.amount;
  }

  // Receita paga por categoria (top 5).
  const catMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === "INCOME" && t.status === "PAID") {
      catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
    }
  }
  const categorySeries = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Receita (paga)" value={formatCurrency(revenue)} change={0} icon={DollarSign} iconColor="#4A90D9" />
        <StatCard label="Pedidos" value={String(ordersCount)} change={0} icon={ShoppingBag} iconColor="#FFD400" />
        <StatCard label="Clientes ativos" value={String(customersCount)} change={0} icon={Users} iconColor="#16A34A" />
        <StatCard label="Margem" value={`${margin.toFixed(1)}%`} change={0} icon={TrendingUp} iconColor="#F59E0B" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <RevenueChart data={revenueSeries.map(({ mes, receita, despesa }) => ({ mes, receita, despesa }))} />
        <CategoryChart data={categorySeries} />
      </div>

      <NexusInsights enabled={isAiEnabled} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-graphite-surface rounded-xl p-5 border border-d-border">
          <h3 className="text-sm font-semibold text-ice-white mb-4">Atividades Recentes</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-d-on-surface-variant">Sem movimentações ainda.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-d-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type === "INCOME" ? "bg-success" : "bg-danger"}`} />
                    <div>
                      <p className="text-sm text-ice-white">{t.description}</p>
                      <p className="text-xs text-d-on-surface-variant">{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === "INCOME" ? "text-success" : "text-danger"}`}>
                    {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-graphite-surface rounded-xl p-4 border border-d-border">
            <div className="flex items-center gap-3 mb-2">
              <Package size={16} className="text-warning" />
              <p className="text-sm font-semibold text-ice-white">Estoque Crítico</p>
            </div>
            <p className="text-2xl font-bold text-ice-white font-sora">{lowStock}</p>
            <p className="text-xs text-d-on-surface-variant">produtos abaixo do mínimo</p>
          </div>

          <div className="bg-graphite-surface rounded-xl p-4 border border-d-border">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={16} className="text-danger" />
              <p className="text-sm font-semibold text-ice-white">Contas Vencidas</p>
            </div>
            <p className="text-2xl font-bold text-danger font-sora">{formatCurrency(overdue)}</p>
          </div>

          <div className="bg-nexus-yellow/10 rounded-xl p-4 border border-nexus-yellow/20">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={16} className="text-ice-white" />
              <p className="text-sm font-semibold text-ice-white">Contas a Receber</p>
            </div>
            <p className="text-2xl font-bold text-ice-white font-sora">{formatCurrency(receivable)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
