"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea, Select, PrimaryButton, GhostButton } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { projectSchema } from "@/lib/validations";
import { createProject, updateProject, deleteProject } from "@/actions/project";

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  taskCount: number;
}

const STATUS: Record<string, { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }> = {
  PLANNING: { label: "Planejamento", tone: "info" },
  IN_PROGRESS: { label: "Em andamento", tone: "warning" },
  ON_HOLD: { label: "Em espera", tone: "neutral" },
  COMPLETED: { label: "Concluído", tone: "success" },
  CANCELED: { label: "Cancelado", tone: "danger" },
};

export function ProjectManager({ projects }: { readonly projects: ProjectRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
  });

  const openCreate = () => { setEditing(null); reset({ name: "", description: "", status: "PLANNING" }); setOpen(true); };
  const openEdit = (p: ProjectRow) => {
    setEditing(p);
    reset({
      name: p.name,
      description: p.description ?? "",
      status: p.status as "PLANNING",
      startDate: p.startDate ? p.startDate.slice(0, 10) : undefined,
      endDate: p.endDate ? p.endDate.slice(0, 10) : undefined,
    });
    setOpen(true);
  };
  const onSubmit = async (v: typeof projectSchema._input) => {
    const res = editing ? await updateProject(editing.id, v) : await createProject(v);
    if (res.success) { toast.success("Projeto salvo"); setOpen(false); router.refresh(); } else toast.error(res.error);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const res = await deleteProject(deleteId);
    setBusy(false);
    if (res.success) { toast.success("Projeto excluído"); setDeleteId(null); router.refresh(); } else toast.error(res.error);
  };

  return (
    <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
        <h2 className="text-sm font-semibold text-ice-white">Projetos</h2>
        <PrimaryButton onClick={openCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs"><Plus size={14} /> Novo projeto</PrimaryButton>
      </div>
      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Nenhum projeto" description="Crie seu primeiro projeto." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-d-surface-container">{["Projeto", "Status", "Tarefas", ""].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-d-border hover:bg-d-surface-container/50">
                  <td className="px-5 py-3"><p className="text-sm text-ice-white font-medium">{p.name}</p>{p.description && <p className="text-xs text-d-on-surface-variant truncate max-w-xs">{p.description}</p>}</td>
                  <td className="px-5 py-3"><StatusBadge label={STATUS[p.status]?.label ?? p.status} tone={STATUS[p.status]?.tone ?? "neutral"} /></td>
                  <td className="px-5 py-3 text-sm text-d-on-surface-variant tabular-nums">{p.taskCount}</td>
                  <td className="px-5 py-3"><div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Editar projeto" : "Novo projeto"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nome" error={errors.name?.message}><TextInput {...register("name")} /></Field>
          <Field label="Descrição" error={errors.description?.message}><TextArea {...register("description")} /></Field>
          <Field label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              <option value="PLANNING">Planejamento</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="ON_HOLD">Em espera</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELED">Cancelado</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Início" error={errors.startDate?.message}><TextInput type="date" {...register("startDate")} /></Field>
            <Field label="Fim" error={errors.endDate?.message}><TextInput type="date" {...register("endDate")} /></Field>
          </div>
          <div className="flex justify-end gap-3 pt-2"><GhostButton type="button" onClick={() => setOpen(false)}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={isSubmitting}>Salvar</PrimaryButton></div>
        </form>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} message="Excluir este projeto e suas tarefas?" onConfirm={confirmDelete} loading={busy} />
    </div>
  );
}
