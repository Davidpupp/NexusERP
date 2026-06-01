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
  const isPositive = change >= 0;

  return (
    <div className="card-dark card-dark-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-d-on-surface-variant">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-d-surface-container flex items-center justify-center">
            <Icon size={16} style={{ color: iconColor ?? "#FFD400" }} />
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-ice-white mb-2 font-sora">{value}</p>

      <div className="flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp size={14} className="text-success" />
        ) : (
          <TrendingDown size={14} className="text-danger" />
        )}
        <span className={cn("text-xs font-semibold", isPositive ? "text-success" : "text-danger")}>
          {isPositive ? "+" : ""}{change.toFixed(1)}%
        </span>
        <span className="text-xs text-d-on-surface-variant">{changeLabel}</span>
      </div>
    </div>
  );
}
