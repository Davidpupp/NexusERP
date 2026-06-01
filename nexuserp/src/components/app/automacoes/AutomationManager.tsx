"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Zap, Power } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea, PrimaryButton, GhostButton } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { automationSchema } from "@/lib/validations";
import { createAutomation, updateAutomation, deleteAutomation, toggleAutomation } from "@/actions/automation";

interface AutomationRow {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  action: string;
  status: string;
}

export function AutomationManager({ automations }: { readonly automations: AutomationRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AutomationRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(automationSchema) });

  const openCreate = () => { setEditing(null); reset({ name: "", description: "", trigger: "", action: "", status: "ACTIVE" }); setOpen(true); };
  const openEdit = (a: AutomationRow) => { setEditing(a); reset({ name: a.name, description: a.description ?? "", trigger: a.trigger, action: a.action, status: a.status as "ACTIVE" }); setOpen(true); };
  const onSubmit = async (v: typeof automationSchema._input) => {
    const res = editing ? await updateAutomation(editing.id, v) : await createAutomation(v);
    if (res.success) { toast.success("Automação salva"); setOpen(false); router.refresh(); } else toast.error(res.error);
  };
  const toggle = async (a: AutomationRow) => {
    const res = await toggleAutomation(a.id, a.status === "ACTIVE" ? "PAUSED" : "ACTIVE");
    if (res.success) router.refresh(); else toast.error(res.error);
  };
  const confirmDelete = async () => { if (!deleteId) return; setBusy(true); const r = await deleteAutomation(deleteId); setBusy(false); if (r.success) { toast.success("Excluída"); setDeleteId(null); router.refresh(); } else toast.error(r.error); };

  return (
    <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
        <h2 className="text-sm font-semibold text-ice-white">Automações</h2>
        <PrimaryButton onClick={openCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs"><Plus size={14} /> Nova automação</PrimaryButton>
      </div>
      {automations.length === 0 ? (
        <EmptyState icon={Zap} title="Nenhuma automação" description="Crie sua primeira automação." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-d-surface-container">{["Nome", "Gatilho", "Ação", "Status", ""].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {automations.map((a) => (
                <tr key={a.id} className="border-t border-d-border hover:bg-d-surface-container/50">
                  <td className="px-5 py-3"><p className="text-sm text-ice-white font-medium">{a.name}</p>{a.description && <p className="text-xs text-d-on-surface-variant truncate max-w-xs">{a.description}</p>}</td>
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{a.trigger}</td>
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{a.action}</td>
                  <td className="px-5 py-3"><StatusBadge label={a.status === "ACTIVE" ? "Ativa" : "Pausada"} tone={a.status === "ACTIVE" ? "success" : "neutral"} /></td>
                  <td className="px-5 py-3"><div className="flex gap-2">
                    <button onClick={() => toggle(a)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-nexus-yellow hover:bg-d-surface-container" title="Ativar/Pausar"><Power size={14} /></button>
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Editar automação" : "Nova automação"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nome" error={errors.name?.message}><TextInput {...register("name")} /></Field>
          <Field label="Descrição" error={errors.description?.message}><TextArea {...register("description")} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Gatilho" error={errors.trigger?.message}><TextInput {...register("trigger")} placeholder="Ex: Novo pedido" /></Field>
            <Field label="Ação" error={errors.action?.message}><TextInput {...register("action")} placeholder="Ex: Enviar e-mail" /></Field>
          </div>
          <div className="flex justify-end gap-3 pt-2"><GhostButton type="button" onClick={() => setOpen(false)}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={isSubmitting}>Salvar</PrimaryButton></div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} message="Excluir esta automação?" onConfirm={confirmDelete} loading={busy} />
    </div>
  );
}
