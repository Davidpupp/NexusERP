"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Phone, Building2, Users, Inbox } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { updateLeadStatus } from "@/actions/lead";
import { LEAD_STATUSES, LEAD_STATUS_META, type LeadStatusTone } from "@/lib/leads";

const STATUS_META = LEAD_STATUS_META;

export interface AdminLead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  segment: string | null;
  usersQuantity: string | null;
  mainNeed: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function SolicitacoesManager({ leads, newCount }: { readonly leads: AdminLead[]; readonly newCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function setStatus(id: string, status: string) {
    setBusyId(id);
    startTransition(async () => {
      const res = await updateLeadStatus(id, status);
      if (res.success) {
        toast.success("Status atualizado");
        router.refresh();
      } else {
        toast.error(res.error);
      }
      setBusyId(null);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-sora text-2xl font-bold tracking-tight text-ice-white">Solicitações de contratação</h1>
          <p className="mt-1 text-sm text-d-on-surface-variant">
            Pedidos do plano sob consulta enviados pelo formulário <span className="text-ice-white">Adquirir nossos serviços</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-nexus-yellow/10 border border-nexus-yellow/20 px-4 py-2">
          <span className="text-2xl font-bold font-sora text-nexus-yellow tabular-nums">{newCount}</span>
          <span className="text-xs text-d-on-surface-variant leading-tight">novas<br />solicitações</span>
        </div>
      </div>

      {leads.length === 0 ? (
        <EmptyState icon={Inbox} title="Nenhuma solicitação ainda" description="Quando alguém preencher o formulário do plano sob consulta, aparece aqui." />
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => {
            const meta = STATUS_META[lead.status as keyof typeof STATUS_META] ?? { label: lead.status, tone: "neutral" as LeadStatusTone };
            return (
              <div key={lead.id} className="card-dark p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold text-ice-white">{lead.name}</h2>
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </div>
                    {lead.company && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-d-on-surface-variant">
                        <Building2 size={13} /> {lead.company}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-d-on-surface-variant">{formatDate(lead.createdAt)}</span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-d-on-surface-variant hover:text-nexus-yellow transition-colors">
                    <Mail size={14} /> {lead.email}
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-d-on-surface-variant hover:text-nexus-yellow transition-colors">
                      <Phone size={14} /> {lead.phone}
                    </a>
                  )}
                  {lead.segment && (
                    <span className="flex items-center gap-2 text-d-on-surface-variant">
                      <Building2 size={14} /> {lead.segment}
                    </span>
                  )}
                  {lead.usersQuantity && (
                    <span className="flex items-center gap-2 text-d-on-surface-variant">
                      <Users size={14} /> {lead.usersQuantity} usuários
                    </span>
                  )}
                </div>

                {lead.mainNeed && (
                  <p className="mt-3 text-sm text-d-on-surface-variant">
                    <span className="text-ice-white">Necessidade:</span> {lead.mainNeed}
                  </p>
                )}
                {lead.message && (
                  <p className="mt-2 rounded-xl bg-d-surface-container/60 border border-d-border p-3 text-sm text-d-on-surface-variant">
                    {lead.message}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-d-border pt-4">
                  <span className="text-xs text-d-on-surface-variant mr-1">Marcar como:</span>
                  {LEAD_STATUSES.map((s) => {
                    const active = lead.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={active || (pending && busyId === lead.id)}
                        onClick={() => setStatus(lead.id, s)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-60 ${
                          active
                            ? "bg-nexus-yellow text-absolute-black"
                            : "border border-d-border text-d-on-surface-variant hover:border-nexus-yellow/50 hover:text-ice-white"
                        }`}
                      >
                        {STATUS_META[s].label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
