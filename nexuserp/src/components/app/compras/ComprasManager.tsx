"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Truck, FileText } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, Select, PrimaryButton, GhostButton } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { supplierSchema, purchaseOrderSchema } from "@/lib/validations";
import {
  createSupplier, updateSupplier, deleteSupplier,
  createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
} from "@/actions/compras";
import { formatCurrency } from "@/lib/utils";

interface SupplierRow { id: string; name: string; email: string | null; phone: string | null; cnpj: string | null }
interface OrderRow { id: string; supplierId: string | null; supplierName: string | null; total: number; status: string; expectedDate: string | null }

const PO_STATUS: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = {
  PENDING: { label: "Pendente", tone: "warning" },
  RECEIVED: { label: "Recebido", tone: "success" },
  CANCELED: { label: "Cancelado", tone: "danger" },
};

export function ComprasManager({ suppliers, orders }: { readonly suppliers: SupplierRow[]; readonly orders: OrderRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"fornecedores" | "pedidos">("fornecedores");

  // suppliers
  const [sOpen, setSOpen] = useState(false);
  const [sEdit, setSEdit] = useState<SupplierRow | null>(null);
  const [sDel, setSDel] = useState<string | null>(null);
  const sForm = useForm({ resolver: zodResolver(supplierSchema) });

  // orders
  const [oOpen, setOOpen] = useState(false);
  const [oEdit, setOEdit] = useState<OrderRow | null>(null);
  const [oDel, setODel] = useState<string | null>(null);
  const oForm = useForm({ resolver: zodResolver(purchaseOrderSchema) });

  const [busy, setBusy] = useState(false);

  const openSCreate = () => { setSEdit(null); sForm.reset({ name: "", email: "", phone: "", cnpj: "" }); setSOpen(true); };
  const openSEdit = (s: SupplierRow) => { setSEdit(s); sForm.reset({ name: s.name, email: s.email ?? "", phone: s.phone ?? "", cnpj: s.cnpj ?? "" }); setSOpen(true); };
  const onS = async (v: typeof supplierSchema._input) => {
    const res = sEdit ? await updateSupplier(sEdit.id, v) : await createSupplier(v);
    if (res.success) { toast.success("Fornecedor salvo"); setSOpen(false); router.refresh(); } else toast.error(res.error);
  };
  const delS = async () => { if (!sDel) return; setBusy(true); const r = await deleteSupplier(sDel); setBusy(false); if (r.success) { toast.success("Excluído"); setSDel(null); router.refresh(); } else toast.error(r.error); };

  const openOCreate = () => { setOEdit(null); oForm.reset({ supplierId: "", total: 0, status: "PENDING" }); setOOpen(true); };
  const openOEdit = (o: OrderRow) => { setOEdit(o); oForm.reset({ supplierId: o.supplierId ?? "", total: o.total, status: o.status, expectedDate: o.expectedDate ? o.expectedDate.slice(0, 10) : undefined }); setOOpen(true); };
  const onO = async (v: typeof purchaseOrderSchema._input) => {
    const res = oEdit ? await updatePurchaseOrder(oEdit.id, v) : await createPurchaseOrder(v);
    if (res.success) { toast.success("Pedido salvo"); setOOpen(false); router.refresh(); } else toast.error(res.error);
  };
  const delO = async () => { if (!oDel) return; setBusy(true); const r = await deletePurchaseOrder(oDel); setBusy(false); if (r.success) { toast.success("Excluído"); setODel(null); router.refresh(); } else toast.error(r.error); };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["fornecedores", "pedidos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-nexus-yellow/15 text-ice-white" : "text-d-on-surface-variant hover:bg-d-surface-container"}`}
          >
            {t === "fornecedores" ? "Fornecedores" : "Pedidos de compra"}
          </button>
        ))}
      </div>

      {tab === "fornecedores" ? (
        <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
            <h2 className="text-sm font-semibold text-ice-white">Fornecedores</h2>
            <PrimaryButton onClick={openSCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs"><Plus size={14} /> Novo fornecedor</PrimaryButton>
          </div>
          {suppliers.length === 0 ? (
            <EmptyState icon={Truck} title="Nenhum fornecedor" description="Cadastre um fornecedor." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-d-surface-container">{["Nome", "E-mail", "Telefone", "CNPJ", ""].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-t border-d-border hover:bg-d-surface-container/50">
                      <td className="px-5 py-3 text-sm text-ice-white font-medium">{s.name}</td>
                      <td className="px-5 py-3 text-xs text-d-on-surface-variant">{s.email ?? "—"}</td>
                      <td className="px-5 py-3 text-xs text-d-on-surface-variant">{s.phone ?? "—"}</td>
                      <td className="px-5 py-3 text-xs text-d-on-surface-variant">{s.cnpj ?? "—"}</td>
                      <td className="px-5 py-3"><div className="flex gap-2">
                        <button onClick={() => openSEdit(s)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container"><Pencil size={14} /></button>
                        <button onClick={() => setSDel(s.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container"><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
            <h2 className="text-sm font-semibold text-ice-white">Pedidos de compra</h2>
            <PrimaryButton onClick={openOCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs"><Plus size={14} /> Novo pedido</PrimaryButton>
          </div>
          {orders.length === 0 ? (
            <EmptyState icon={FileText} title="Nenhum pedido" description="Crie um pedido de compra." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-d-surface-container">{["Fornecedor", "Total", "Status", ""].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-d-border hover:bg-d-surface-container/50">
                      <td className="px-5 py-3 text-sm text-ice-white font-medium">{o.supplierName ?? "—"}</td>
                      <td className="px-5 py-3 text-sm tabular-nums text-ice-white">{formatCurrency(o.total)}</td>
                      <td className="px-5 py-3"><StatusBadge label={PO_STATUS[o.status]?.label ?? o.status} tone={PO_STATUS[o.status]?.tone ?? "neutral"} /></td>
                      <td className="px-5 py-3"><div className="flex gap-2">
                        <button onClick={() => openOEdit(o)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container"><Pencil size={14} /></button>
                        <button onClick={() => setODel(o.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container"><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Supplier modal */}
      <Modal open={sOpen} onOpenChange={setSOpen} title={sEdit ? "Editar fornecedor" : "Novo fornecedor"}>
        <form onSubmit={sForm.handleSubmit(onS)} className="space-y-4">
          <Field label="Nome" error={sForm.formState.errors.name?.message}><TextInput {...sForm.register("name")} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="E-mail" error={sForm.formState.errors.email?.message}><TextInput type="email" {...sForm.register("email")} /></Field>
            <Field label="Telefone" error={sForm.formState.errors.phone?.message}><TextInput {...sForm.register("phone")} /></Field>
          </div>
          <Field label="CNPJ" error={sForm.formState.errors.cnpj?.message}><TextInput {...sForm.register("cnpj")} /></Field>
          <div className="flex justify-end gap-3 pt-2"><GhostButton type="button" onClick={() => setSOpen(false)}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={sForm.formState.isSubmitting}>Salvar</PrimaryButton></div>
        </form>
      </Modal>

      {/* Order modal */}
      <Modal open={oOpen} onOpenChange={setOOpen} title={oEdit ? "Editar pedido" : "Novo pedido"}>
        <form onSubmit={oForm.handleSubmit(onO)} className="space-y-4">
          <Field label="Fornecedor" error={oForm.formState.errors.supplierId?.message}>
            <Select {...oForm.register("supplierId")}><option value="">— Nenhum —</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total (R$)" error={oForm.formState.errors.total?.message}><TextInput type="number" step="0.01" {...oForm.register("total", { valueAsNumber: true })} /></Field>
            <Field label="Status" error={oForm.formState.errors.status?.message}>
              <Select {...oForm.register("status")}><option value="PENDING">Pendente</option><option value="RECEIVED">Recebido</option><option value="CANCELED">Cancelado</option></Select>
            </Field>
          </div>
          <Field label="Previsão de entrega" error={oForm.formState.errors.expectedDate?.message}><TextInput type="date" {...oForm.register("expectedDate")} /></Field>
          <div className="flex justify-end gap-3 pt-2"><GhostButton type="button" onClick={() => setOOpen(false)}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={oForm.formState.isSubmitting}>Salvar</PrimaryButton></div>
        </form>
      </Modal>

      <ConfirmDialog open={sDel !== null} onOpenChange={(o) => !o && setSDel(null)} message="Excluir este fornecedor?" onConfirm={delS} loading={busy} />
      <ConfirmDialog open={oDel !== null} onOpenChange={(o) => !o && setODel(null)} message="Excluir este pedido?" onConfirm={delO} loading={busy} />
    </div>
  );
}
