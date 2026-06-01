"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, Select, PrimaryButton, GhostButton } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { transactionSchema } from "@/lib/validations";
import { createTransaction, updateTransaction, deleteTransaction } from "@/actions/transaction";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet } from "lucide-react";

export interface TransactionRow {
  id: string;
  description: string;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
  method: string | null;
  dueDate: string | null;
  createdAt: string;
}

const STATUS: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  PAID: { label: "Pago", tone: "success" },
  PENDING: { label: "Pendente", tone: "warning" },
  OVERDUE: { label: "Vencido", tone: "danger" },
  CANCELED: { label: "Cancelado", tone: "neutral" },
};

export function TransactionManager({ transactions }: { readonly transactions: TransactionRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ description: "", category: "", type: "INCOME", amount: 0, status: "PENDING", method: "" });
    setOpen(true);
  };

  const openEdit = (t: TransactionRow) => {
    setEditing(t);
    reset({
      description: t.description,
      category: t.category,
      type: t.type,
      amount: t.amount,
      status: t.status,
      method: t.method ?? "",
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : undefined,
    });
    setOpen(true);
  };

  const onSubmit = async (values: typeof transactionSchema._input) => {
    const res = editing
      ? await updateTransaction(editing.id, values)
      : await createTransaction(values);
    if (res.success) {
      toast.success(editing ? "Transação atualizada" : "Transação criada");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const res = await deleteTransaction(deleteId);
    setBusy(false);
    if (res.success) {
      toast.success("Transação excluída");
      setDeleteId(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="card-dark overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
        <h2 className="text-sm font-semibold text-ice-white">Transações</h2>
        <PrimaryButton onClick={openCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs">
          <Plus size={14} /> Nova transação
        </PrimaryButton>
      </div>

      {transactions.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhuma transação" description="Crie sua primeira transação para começar." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-d-surface-container">
                {["Data", "Descrição", "Categoria", "Tipo", "Valor", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-d-border hover:bg-d-surface-container/50 transition-colors">
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{formatDate(new Date(t.createdAt))}</td>
                  <td className="px-5 py-3 text-sm text-ice-white font-medium">{t.description}</td>
                  <td className="px-5 py-3 text-xs text-d-on-surface-variant">{t.category}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {t.type === "INCOME" ? (
                        <ArrowUpRight size={14} className="text-success" />
                      ) : (
                        <ArrowDownRight size={14} className="text-danger" />
                      )}
                      <span className={`text-xs font-medium ${t.type === "INCOME" ? "text-success" : "text-danger"}`}>
                        {t.type === "INCOME" ? "Receita" : "Despesa"}
                      </span>
                    </div>
                  </td>
                  <td className={`px-5 py-3 text-sm font-semibold tabular-nums ${t.type === "INCOME" ? "text-success" : "text-danger"}`}>
                    {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={STATUS[t.status].label} tone={STATUS[t.status].tone} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container transition-colors" title="Excluir">
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

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Editar transação" : "Nova transação"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Descrição" error={errors.description?.message}>
            <TextInput {...register("description")} placeholder="Ex: Venda de produto" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria" error={errors.category?.message}>
              <TextInput {...register("category")} placeholder="Ex: Vendas" />
            </Field>
            <Field label="Tipo" error={errors.type?.message}>
              <Select {...register("type")}>
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor (R$)" error={errors.amount?.message}>
              <TextInput type="number" step="0.01" {...register("amount", { valueAsNumber: true })} placeholder="0,00" />
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <Select {...register("status")}>
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="OVERDUE">Vencido</option>
                <option value="CANCELED">Cancelado</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Método" error={errors.method?.message}>
              <TextInput {...register("method")} placeholder="PIX, Boleto..." />
            </Field>
            <Field label="Vencimento" error={errors.dueDate?.message}>
              <TextInput type="date" {...register("dueDate")} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        loading={busy}
      />
    </div>
  );
}
