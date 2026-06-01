"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { PrimaryButton } from "@/components/ui/form";
import { saveAutomationConfig } from "@/actions/automationConfig";
import type { AutomationConfig } from "@/lib/automation/config";

const ITEMS: { key: keyof AutomationConfig; label: string; desc: string }[] = [
  { key: "autoStock", label: "Baixar estoque automaticamente ao vender", desc: "Cada venda gera saída de estoque + movimentação rastreável." },
  { key: "autoFinance", label: "Gerar financeiro previsto ao vender", desc: "Cria conta a receber (pendente) para cada venda." },
  { key: "lowStockAlerts", label: "Alertas de estoque baixo / zerado", desc: "Notifica quando um produto atinge o mínimo ou esgota." },
];

export function AutomationSettings({ config }: { readonly config: AutomationConfig }) {
  const router = useRouter();
  const [state, setState] = useState<AutomationConfig>(config);
  const [saving, setSaving] = useState(false);

  const toggle = (k: keyof AutomationConfig) => setState((s) => ({ ...s, [k]: !s[k] }));

  const save = async () => {
    setSaving(true);
    const res = await saveAutomationConfig(state);
    setSaving(false);
    if (res.success) {
      toast.success("Automação atualizada");
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <div className="bg-graphite-surface rounded-xl border border-d-border p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={16} className="text-nexus-yellow" />
        <h2 className="text-sm font-semibold text-ice-white">Automação</h2>
      </div>
      <p className="text-xs text-d-on-surface-variant mb-4">Controle o que o sistema faz sozinho quando uma venda acontece.</p>

      <div className="space-y-3">
        {ITEMS.map((it) => (
          <label key={it.key} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state[it.key]}
              onChange={() => toggle(it.key)}
              className="mt-1 w-4 h-4 accent-nexus-yellow"
            />
            <div>
              <p className="text-sm text-ice-white">{it.label}</p>
              <p className="text-xs text-d-on-surface-variant">{it.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-5">
        <PrimaryButton onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar automação"}</PrimaryButton>
      </div>
    </div>
  );
}
