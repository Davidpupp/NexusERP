import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly change: number;
  readonly changeLabel?: string;
  readonly icon?: LucideIcon;
  readonly iconColor?: string;
}

export function StatCard({ label, value, change, changeLabel = "vs. mês anterior", icon: Icon, iconColor }: StatCardProps) {
  const hasChange = typeof change === "number" && change !== 0;
  const isPositive = change >= 0;

  return (
    <div className="card-dark card-dark-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-d-on-surface-variant">{label}</p>
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${iconColor ?? "#FFD400"}1a` }}
          >
            <Icon size={16} style={{ color: iconColor ?? "#FFD400" }} />
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-ice-white mb-2 font-sora">{value}</p>

      {hasChange ? (
        <div className="flex items-center gap-1.5">
          {isPositive ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-danger" />}
          <span className={cn("text-xs font-semibold", isPositive ? "text-success" : "text-danger")}>
            {isPositive ? "+" : ""}{change.toFixed(1)}%
          </span>
          <span className="text-xs text-d-on-surface-variant">{changeLabel}</span>
        </div>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs text-d-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Atualizado em tempo real
        </span>
      )}
    </div>
  );
}
