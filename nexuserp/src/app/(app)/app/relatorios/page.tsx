import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/tenant";
import { formatCurrency } from "@/lib/utils";

export default async function RelatoriosPage() {
  const { companyId } = await getCurrentCompany();

  const [transactions, customersCount, productsCount, opportunities] = await Promise.all([
    prisma.transaction.findMany({ where: { companyId }, select: { type: true, amount: true, status: true, category: true } }),
    prisma.customer.count({ where: { companyId } }),
    prisma.product.count({ where: { companyId } }),
    prisma.opportunity.findMany({ where: { companyId }, select: { estimatedValue: true, stage: true } }),
  ]);

  const revenue = transactions.filter((t) => t.type === "INCOME" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE" && t.status === "PAID").reduce((s, t) => s + t.amount, 0);
  const profit = revenue - expense;
  const wonValue = opportunities.filter((o) => o.stage === "CLOSED_WON").reduce((s, o) => s + o.estimatedValue, 0);
  const pipelineValue = opportunities
    .filter((o) => o.stage !== "CLOSED_WON" && o.stage !== "CLOSED_LOST")
    .reduce((s, o) => s + o.estimatedValue, 0);

  // Top categorias de despesa
  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === "EXPENSE" && t.status === "PAID") {
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
    }
  }
  const topCategories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = topCategories[0]?.[1] ?? 1;

  const cards = [
    { label: "Receita total", value: formatCurrency(revenue), color: "text-success" },
    { label: "Despesa total", value: formatCurrency(expense), color: "text-danger" },
    { label: "Lucro", value: formatCurrency(profit), color: profit >= 0 ? "text-success" : "text-danger" },
    { label: "Vendas ganhas", value: formatCurrency(wonValue), color: "text-ice-white" },
    { label: "Pipeline aberto", value: formatCurrency(pipelineValue), color: "text-nexus-yellow" },
    { label: "Clientes", value: String(customersCount), color: "text-ice-white" },
    { label: "Produtos", value: String(productsCount), color: "text-ice-white" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-graphite-surface rounded-xl p-5 border border-d-border">
            <p className="text-xs text-d-on-surface-variant mb-2">{c.label}</p>
            <p className={`text-xl font-bold font-sora ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-graphite-surface rounded-xl p-5 border border-d-border">
        <h3 className="text-sm font-semibold text-ice-white mb-4">Despesas por categoria</h3>
        {topCategories.length === 0 ? (
          <p className="text-sm text-d-on-surface-variant">Sem dados de despesa.</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-32 flex-shrink-0 text-xs text-d-on-surface-variant text-right truncate">{cat}</div>
                <div className="flex-1 h-6 bg-d-surface-container rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(val / maxCat) * 100}%`, background: "#FFD400" }} />
                </div>
                <div className="w-24 text-xs text-ice-white text-right tabular-nums">{formatCurrency(val)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
