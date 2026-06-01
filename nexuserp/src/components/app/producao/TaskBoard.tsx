"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, TextInput, TextArea, Select, PrimaryButton, GhostButton } from "@/components/ui/form";
import { taskSchema } from "@/lib/validations";
import { createTask, updateTask, deleteTask, moveTaskStatus } from "@/actions/task";

type TaskStatus = "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  projectId: string | null;
  dueDate: string | null;
}

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: "BACKLOG", label: "Backlog", color: "border-t-info" },
  { key: "IN_PROGRESS", label: "Em andamento", color: "border-t-nexus-yellow" },
  { key: "IN_REVIEW", label: "Em revisão", color: "border-t-warning" },
  { key: "COMPLETED", label: "Concluído", color: "border-t-success" },
];
const ORDER = COLUMNS.map((c) => c.key);

const PRIORITY: Record<string, string> = { LOW: "text-d-on-surface-variant", MEDIUM: "text-info", HIGH: "text-warning", CRITICAL: "text-danger" };

export function TaskBoard({ tasks, projects }: { readonly tasks: TaskRow[]; readonly projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(taskSchema) });

  const openCreate = () => { setEditing(null); reset({ title: "", description: "", status: "BACKLOG", priority: "MEDIUM", projectId: "" }); setOpen(true); };
  const openEdit = (t: TaskRow) => {
    setEditing(t);
    reset({ title: t.title, description: t.description ?? "", status: t.status, priority: t.priority, projectId: t.projectId ?? "", dueDate: t.dueDate ? t.dueDate.slice(0, 10) : undefined });
    setOpen(true);
  };
  const onSubmit = async (v: typeof taskSchema._input) => {
    const res = editing ? await updateTask(editing.id, v) : await createTask(v);
    if (res.success) { toast.success("Tarefa salva"); setOpen(false); router.refresh(); } else toast.error(res.error);
  };
  const move = async (id: string, status: TaskStatus) => {
    const res = await moveTaskStatus(id, status);
    if (res.success) router.refresh(); else toast.error(res.error);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const res = await deleteTask(deleteId);
    setBusy(false);
    if (res.success) { toast.success("Tarefa excluída"); setDeleteId(null); router.refresh(); } else toast.error(res.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ice-white">Produção — Tarefas</h2>
        <PrimaryButton onClick={openCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs"><Plus size={14} /> Nova tarefa</PrimaryButton>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          const next = ORDER[Math.min(ORDER.indexOf(col.key) + 1, ORDER.length - 1)];
          return (
            <div key={col.key} className="w-64 flex-shrink-0">
              <div className={`bg-graphite-surface rounded-xl border border-d-border border-t-2 ${col.color} p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-ice-white">{col.label}</span>
                  <span className="text-[10px] font-bold text-d-on-surface-variant bg-d-surface-container px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((t) => (
                    <div key={t.id} className="bg-d-surface-container rounded-lg p-3 group border border-transparent hover:border-nexus-yellow/40 hover:-translate-y-0.5 transition-all">
                      <p className="text-sm text-ice-white font-medium">{t.title}</p>
                      <p className={`text-xs mt-1 font-medium ${PRIORITY[t.priority]}`}>{t.priority}</p>
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(t)} className="p-1 rounded text-d-on-surface-variant hover:text-ice-white"><Pencil size={12} /></button>
                        <button onClick={() => setDeleteId(t.id)} className="p-1 rounded text-d-on-surface-variant hover:text-danger"><Trash2 size={12} /></button>
                        {col.key !== next && (
                          <button onClick={() => move(t.id, next)} className="p-1 rounded text-d-on-surface-variant hover:text-nexus-yellow ml-auto" title="Avançar"><ChevronRight size={14} /></button>
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

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Editar tarefa" : "Nova tarefa"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Título" error={errors.title?.message}><TextInput {...register("title")} /></Field>
          <Field label="Descrição" error={errors.description?.message}><TextArea {...register("description")} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status" error={errors.status?.message}>
              <Select {...register("status")}>
                <option value="BACKLOG">Backlog</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="IN_REVIEW">Em revisão</option>
                <option value="COMPLETED">Concluído</option>
              </Select>
            </Field>
            <Field label="Prioridade" error={errors.priority?.message}>
              <Select {...register("priority")}>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Projeto" error={errors.projectId?.message}>
              <Select {...register("projectId")}>
                <option value="">— Nenhum —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Prazo" error={errors.dueDate?.message}><TextInput type="date" {...register("dueDate")} /></Field>
          </div>
          <div className="flex justify-end gap-3 pt-2"><GhostButton type="button" onClick={() => setOpen(false)}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={isSubmitting}>Salvar</PrimaryButton></div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} message="Excluir esta tarefa?" onConfirm={confirmDelete} loading={busy} />
    </div>
  );
}
