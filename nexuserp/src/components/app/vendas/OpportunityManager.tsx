"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput, Select, PrimaryButton, GhostButton } from "@/components/ui/form";
import { opportunitySchema } from "@/lib/validations";
import {
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  moveOpportunityStage,
} from "@/actions/opportunity";
import { formatCurrency } from "@/lib/utils";

type Stage = "NEW_LEAD" | "CONTACTED" | "PROPOSAL_SENT" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";

export interface OpportunityRow {
  id: string;
  title: string;
  estimatedValue: number;
  stage: Stage;
  customerId: string | null;
  customerName: string | null;
  nextAction: string | null;
}

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: "NEW_LEAD", label: "Novo Lead", color: "border-t-info" },
  { key: "CONTACTED", label: "Em Contato", color: "border-t-nexus-yellow" },
  { key: "PROPOSAL_SENT", label: "Proposta", color: "border-t-nexus-yellow" },
  { key: "NEGOTIATION", label: "Negociação", color: "border-t-warning" },
  { key: "CLOSED_WON", label: "Ganho", color: "border-t-success" },
  { key: "CLOSED_LOST", label: "Perdido", color: "border-t-danger" },
];

const STAGE_ORDER = STAGES.map((s) => s.key);

export function OpportunityManager({
  opportunities,
  customers,
}: {
  readonly opportunities: OpportunityRow[];
  readonly customers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OpportunityRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(opportunitySchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ title: "", estimatedValue: 0, stage: "NEW_LEAD", customerId: "", nextAction: "" });
    setOpen(true);
  };

  const openEdit = (o: OpportunityRow) => {
    setEditing(o);
    reset({
      title: o.title,
      estimatedValue: o.estimatedValue,
      stage: o.stage,
      customerId: o.customerId ?? "",
      nextAction: o.nextAction ?? "",
    });
    setOpen(true);
  };

  const onSubmit = async (values: typeof opportunitySchema._input) => {
    const res = editing ? await updateOpportunity(editing.id, values) : await createOpportunity(values);
    if (res.success) {
      toast.success(editing ? "Oportunidade atualizada" : "Oportunidade criada");
      setOpen(false);
      router.refresh();
    } else toast.error(res.error);
  };

  const move = async (id: string, stage: Stage) => {
    const res = await moveOpportunityStage(id, stage);
    if (res.success) router.refresh();
    else toast.error(res.error);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const res = await deleteOpportunity(deleteId);
    setBusy(false);
    if (res.success) {
      toast.success("Oportunidade excluída");
      setDeleteId(null);
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ice-white">Funil de Vendas</h2>
        <PrimaryButton onClick={openCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs">
          <Plus size={14} /> Nova oportunidade
        </PrimaryButton>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.map((col) => {
          const items = opportunities.filter((o) => o.stage === col.key);
          const total = items.reduce((s, o) => s + o.estimatedValue, 0);
          const nextStage = STAGE_ORDER[Math.min(STAGE_ORDER.indexOf(col.key) + 1, STAGE_ORDER.length - 1)];
          return (
            <div key={col.key} className="w-60 flex-shrink-0">
              <div className={`bg-graphite-surface rounded-xl border border-d-border border-t-2 ${col.color} p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-ice-white">{col.label}</span>
                  <span className="text-[10px] font-bold text-d-on-surface-variant bg-d-surface-container px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <p className="text-sm font-bold text-nexus-yellow mb-3 tabular-nums">{formatCurrency(total)}</p>
                <div className="space-y-2">
                  {items.map((o) => (
                    <div key={o.id} className="bg-d-surface-container rounded-lg p-3 group border border-transparent hover:border-nexus-yellow/40 hover:-translate-y-0.5 transition-all cursor-default">
                      <p className="text-sm text-ice-white font-medium truncate">{o.title}</p>
                      {o.customerName && <p className="text-xs text-d-on-surface-variant truncate">{o.customerName}</p>}
                      <p className="text-sm font-semibold text-nexus-yellow mt-1 tabular-nums">{formatCurrency(o.estimatedValue)}</p>
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(o)} className="p-1 rounded text-d-on-surface-variant hover:text-ice-white" title="Editar">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => setDeleteId(o.id)} className="p-1 rounded text-d-on-surface-variant hover:text-danger" title="Excluir">
                          <Trash2 size={12} />
                        </button>
                        {col.key !== nextStage && (
                          <button onClick={() => move(o.id, nextStage)} className="p-1 rounded text-d-on-surface-variant hover:text-nexus-yellow ml-auto" title="Avançar estágio">
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Editar oportunidade" : "Nova oportunidade"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Título" error={errors.title?.message}>
            <TextInput {...register("title")} placeholder="Ex: Projeto ERP Construtora" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor estimado (R$)" error={errors.estimatedValue?.message}>
              <TextInput type="number" step="0.01" {...register("estimatedValue", { valueAsNumber: true })} />
            </Field>
            <Field label="Estágio" error={errors.stage?.message}>
              <Select {...register("stage")}>
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Cliente" error={errors.customerId?.message}>
            <Select {...register("customerId")}>
              <option value="">— Nenhum —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Próxima ação" error={errors.nextAction?.message}>
            <TextInput {...register("nextAction")} placeholder="Ex: Enviar proposta" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        message="Excluir esta oportunidade?"
        onConfirm={confirmDelete}
        loading={busy}
      />
    </div>
  );
}
