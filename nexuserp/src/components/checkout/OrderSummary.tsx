"use client";

import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Plan } from "@/types";

export function OrderSummary({ plan, showFeatures = true }: { readonly plan: Plan; readonly showFeatures?: boolean }) {
  const total = plan.price + plan.setupFee;
  return (
    <div className="card-dark p-6 sticky top-6">
      <h2 className="text-sm font-semibold text-ice-white mb-4">Resumo do pedido</h2>

      <div className="rounded-xl bg-nexus-yellow/10 border border-nexus-yellow/20 p-4 mb-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ice-white">Plano {plan.name}</p>
          {plan.isPopular && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-absolute-black bg-nexus-yellow px-2 py-0.5 rounded-full">
              Mais escolhido
            </span>
          )}
        </div>
        <p className="text-xs text-d-on-surface-variant mt-0.5">
          {plan.userLimit ? `Até ${plan.userLimit} usuários` : "Usuários ilimitados"}
        </p>
      </div>

      <div className="space-y-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-d-on-surface-variant">Mensalidade</span>
          <span className="text-ice-white font-medium tabular-nums">{formatCurrency(plan.price)}/mês</span>
        </div>
        {plan.setupFee > 0 && (
          <div className="flex justify-between">
            <span className="text-d-on-surface-variant">Implantação</span>
            <span className="text-ice-white font-medium tabular-nums">{formatCurrency(plan.setupFee)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-d-border pt-4 mb-5">
        <div className="flex justify-between items-baseline">
          <span className="font-semibold text-ice-white">Total hoje</span>
          <span className="font-bold text-2xl text-ice-white font-sora tabular-nums">{formatCurrency(total)}</span>
        </div>
        <p className="text-xs text-d-on-surface-variant mt-1">Depois {formatCurrency(plan.price)}/mês · cancele quando quiser</p>
      </div>

      {showFeatures && (
        <ul className="space-y-2.5">
          {plan.features.slice(0, 6).map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-xs text-d-on-surface-variant">
              <Check size={14} className="text-nexus-yellow flex-shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
