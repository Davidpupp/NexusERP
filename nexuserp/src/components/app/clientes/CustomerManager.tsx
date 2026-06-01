"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea, PrimaryButton, GhostButton } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { customerSchema } from "@/lib/validations";
import { createCustomer, updateCustomer, deleteCustomer } from "@/actions/customer";

export interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  segment: string | null;
  status: string;
  notes: string | null;
}

export function CustomerManager({ customers }: { readonly customers: CustomerRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(customerSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", email: "", phone: "", cnpj: "", segment: "", notes: "" });
    setOpen(true);
  };

  const openEdit = (c: CustomerRow) => {
    setEditing(c);
    reset({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      cnpj: c.cnpj ?? "",
      segment: c.segment ?? "",
      notes: c.notes ?? "",
    });
    setOpen(true);
  };

  const onSubmit = async (values: typeof customerSchema._input) => {
    const res = editing ? await updateCustomer(editing.id, values) : await createCustomer(values);
    if (res.success) {
      toast.success(editing ? "Cliente atualizado" : "Cliente criado");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const res = await deleteCustomer(deleteId);
    setBusy(false);
    if (res.success) {
      toast.success("Cliente excluído");
      setDeleteId(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
        <h2 className="text-sm font-semibold text-ice-white">Clientes</h2>
        <PrimaryButton onClick={openCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs">
          <Plus size={14} /> Novo cliente
        </PrimaryButton>
      </div>

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente" description="Cadastre seu primeiro cliente." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-d-surface-container">
                {["Nome", "E-mail", "Telefone", "Segmento", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-d-border hover:bg-d-surface-container/50 transition-colors">
                  <td className="px-5 py-3 text-sm text-ice-white font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{c.email ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{c.segment ?? "—"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge label={c.status === "ACTIVE" ? "Ativo" : "Inativo"} tone={c.status === "ACTIVE" ? "success" : "neutral"} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container transition-colors" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Editar cliente" : "Novo cliente"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nome" error={errors.name?.message}>
            <TextInput {...register("name")} placeholder="Empresa ou pessoa" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="E-mail" error={errors.email?.message}>
              <TextInput type="email" {...register("email")} placeholder="contato@empresa.com" />
            </Field>
            <Field label="Telefone" error={errors.phone?.message}>
              <TextInput {...register("phone")} placeholder="(11) 99999-9999" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CNPJ" error={errors.cnpj?.message}>
              <TextInput {...register("cnpj")} placeholder="00.000.000/0001-00" />
            </Field>
            <Field label="Segmento" error={errors.segment?.message}>
              <TextInput {...register("segment")} placeholder="Varejo, Indústria..." />
            </Field>
          </div>
          <Field label="Observações" error={errors.notes?.message}>
            <TextArea {...register("notes")} placeholder="Notas internas" />
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
        message="Excluir este cliente? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        loading={busy}
      />
    </div>
  );
}
