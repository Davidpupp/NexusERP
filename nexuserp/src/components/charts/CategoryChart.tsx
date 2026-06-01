"use client";

export interface CategoryPoint {
  name: string;
  value: number;
}

export function CategoryChart({ data }: { readonly data: CategoryPoint[] }) {
  const DATA = data;
  const max = Math.max(1, ...DATA.map((d) => d.value));

  return (
    <div className="card-dark p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-ice-white">Vendas por Categoria</h3>
          <p className="text-xs text-d-on-surface-variant">Período atual</p>
        </div>
      </div>

      <div className="space-y-3">
        {DATA.length === 0 && <p className="text-sm text-d-on-surface-variant">Sem dados de receita por categoria.</p>}
        {DATA.map((item) => {
          const pct = (item.value / max) * 100;
          return (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-20 flex-shrink-0 text-xs text-d-on-surface-variant text-right">{item.name}</div>
              <div className="flex-1 h-6 bg-d-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: "#FFD400" }}
                />
              </div>
              <div className="w-16 text-xs text-d-on-surface-variant text-right">
                {new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 0 }).format(item.value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
