"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface RevenuePoint {
  mes: string;
  receita: number;
  despesa: number;
}

function formatBRL(value: number) {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value}`;
}

export function RevenueChart({ data }: { readonly data: RevenuePoint[] }) {
  const DATA = data;
  return (
    <div className="card-dark p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-ice-white">Receita x Despesa</h3>
          <p className="text-xs text-d-on-surface-variant">Últimos 6 meses</p>
        </div>
        <span className="text-xs text-d-on-surface-variant bg-d-surface-container px-2.5 py-1 rounded-full">
          Jan–Jun 2025
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: "#D0C6AB" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatBRL}
            tick={{ fontSize: 11, fill: "#D0C6AB" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name) => [
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value as number),
              name === "receita" ? "Receita" : "Despesa",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #2A2A2A",
              background: "#1C1B1B",
              color: "#E5E2E1",
              fontSize: 12,
            }}
            labelStyle={{ color: "#E5E2E1" }}
            cursor={{ stroke: "#4D4632" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12, color: "#D0C6AB" }}
            formatter={(v) => (v === "receita" ? "Receita" : "Despesa")}
          />
          <Line
            type="monotone"
            dataKey="receita"
            stroke="#4A90D9"
            strokeWidth={2}
            dot={{ r: 3, fill: "#4A90D9" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="despesa"
            stroke="#FFD400"
            strokeWidth={2}
            dot={{ r: 3, fill: "#FFD400" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
