"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, MessageSquare, Headphones, Send } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, Select, PrimaryButton, GhostButton } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { supportTicketSchema } from "@/lib/validations";
import { createTicket, updateTicket, deleteTicket, addTicketMessage } from "@/actions/support";

interface Msg { id: string; content: string; createdAt: string }
interface TicketRow {
  id: string;
  subject: string;
  category: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "WAITING_CLIENT" | "RESOLVED" | "CLOSED";
  customerId: string | null;
  customerName: string | null;
  messages: Msg[];
}

const STATUS: Record<string, { label: string; tone: "warning" | "info" | "neutral" | "success" }> = {
  OPEN: { label: "Aberto", tone: "warning" },
  IN_PROGRESS: { label: "Em atendimento", tone: "info" },
  WAITING_CLIENT: { label: "Aguardando cliente", tone: "neutral" },
  RESOLVED: { label: "Resolvido", tone: "success" },
  CLOSED: { label: "Fechado", tone: "neutral" },
};

export function SupportManager({ tickets, customers }: { readonly tickets: TicketRow[]; readonly customers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TicketRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [thread, setThread] = useState<TicketRow | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(supportTicketSchema) });

  const openCreate = () => { setEditing(null); reset({ subject: "", category: "", priority: "MEDIUM", status: "OPEN", customerId: "" }); setOpen(true); };
  const openEdit = (t: TicketRow) => { setEditing(t); reset({ subject: t.subject, category: t.category ?? "", priority: t.priority, status: t.status, customerId: t.customerId ?? "" }); setOpen(true); };
  const onSubmit = async (v: typeof supportTicketSchema._input) => {
    const res = editing ? await updateTicket(editing.id, v) : await createTicket(v);
    if (res.success) { toast.success("Chamado salvo"); setOpen(false); router.refresh(); } else toast.error(res.error);
  };
  const confirmDelete = async () => { if (!deleteId) return; setBusy(true); const r = await deleteTicket(deleteId); setBusy(false); if (r.success) { toast.success("Excluído"); setDeleteId(null); router.refresh(); } else toast.error(r.error); };
  const sendReply = async () => {
    if (!thread || !reply.trim()) return;
    const r = await addTicketMessage(thread.id, { content: reply });
    if (r.success) { toast.success("Mensagem enviada"); setReply(""); setThread(null); router.refresh(); } else toast.error(r.error);
  };

  return (
    <div className="card-dark overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
        <h2 className="text-sm font-semibold text-ice-white">Chamados</h2>
        <PrimaryButton onClick={openCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs"><Plus size={14} /> Novo chamado</PrimaryButton>
      </div>
      {tickets.length === 0 ? (
        <EmptyState icon={Headphones} title="Nenhum chamado" description="Abra um chamado de suporte." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-d-surface-container">{["Assunto", "Cliente", "Prioridade", "Status", ""].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t border-d-border hover:bg-d-surface-container/50">
                  <td className="px-5 py-3 text-sm text-ice-white font-medium">{t.subject}</td>
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{t.customerName ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{t.priority}</td>
                  <td className="px-5 py-3"><StatusBadge label={STATUS[t.status]?.label ?? t.status} tone={STATUS[t.status]?.tone ?? "neutral"} /></td>
                  <td className="px-5 py-3"><div className="flex gap-2">
                    <button onClick={() => setThread(t)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-nexus-yellow hover:bg-d-surface-container" title="Mensagens"><MessageSquare size={14} /></button>
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Editar chamado" : "Novo chamado"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Assunto" error={errors.subject?.message}><TextInput {...register("subject")} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria" error={errors.category?.message}><TextInput {...register("category")} /></Field>
            <Field label="Cliente" error={errors.customerId?.message}>
              <Select {...register("customerId")}><option value="">— Nenhum —</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prioridade" error={errors.priority?.message}>
              <Select {...register("priority")}><option value="LOW">Baixa</option><option value="MEDIUM">Média</option><option value="HIGH">Alta</option><option value="CRITICAL">Crítica</option></Select>
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <Select {...register("status")}><option value="OPEN">Aberto</option><option value="IN_PROGRESS">Em atendimento</option><option value="WAITING_CLIENT">Aguardando cliente</option><option value="RESOLVED">Resolvido</option><option value="CLOSED">Fechado</option></Select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2"><GhostButton type="button" onClick={() => setOpen(false)}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={isSubmitting}>Salvar</PrimaryButton></div>
        </form>
      </Modal>

      {/* Thread */}
      <Modal open={thread !== null} onOpenChange={(o) => !o && setThread(null)} title={thread?.subject ?? "Chamado"}>
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto scrollbar-thin">
          {thread?.messages.length === 0 && <p className="text-sm text-d-on-surface-variant">Sem mensagens ainda.</p>}
          {thread?.messages.map((m) => (
            <div key={m.id} className="bg-d-surface-container rounded-lg p-3">
              <p className="text-sm text-ice-white">{m.content}</p>
              <p className="text-xs text-d-on-surface-variant mt-1">{new Date(m.createdAt).toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <TextInput value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Escreva uma resposta..." />
          <PrimaryButton type="button" onClick={sendReply} className="flex items-center gap-1.5"><Send size={14} /></PrimaryButton>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} message="Excluir este chamado e suas mensagens?" onConfirm={confirmDelete} loading={busy} />
    </div>
  );
}
