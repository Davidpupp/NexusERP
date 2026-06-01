"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Package, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, Select, PrimaryButton, GhostButton } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { productSchema, inventoryMovementSchema } from "@/lib/validations";
import { createProduct, updateProduct, deleteProduct, adjustStock } from "@/actions/product";
import { formatCurrency } from "@/lib/utils";

export interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
  supplierId: string | null;
}

export function ProductManager({
  products,
  suppliers,
}: {
  readonly products: ProductRow[];
  readonly suppliers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adjust, setAdjust] = useState<ProductRow | null>(null);
  const [busy, setBusy] = useState(false);

  const product = useForm({ resolver: zodResolver(productSchema) });
  const move = useForm({ resolver: zodResolver(inventoryMovementSchema) });

  const openCreate = () => {
    setEditing(null);
    product.reset({ name: "", sku: "", category: "", quantity: 0, minQuantity: 0, costPrice: 0, salePrice: 0, supplierId: "" });
    setOpen(true);
  };

  const openEdit = (p: ProductRow) => {
    setEditing(p);
    product.reset({
      name: p.name,
      sku: p.sku ?? "",
      category: p.category ?? "",
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      supplierId: p.supplierId ?? "",
    });
    setOpen(true);
  };

  const openAdjust = (p: ProductRow) => {
    setAdjust(p);
    move.reset({ productId: p.id, type: "IN", quantity: 0, notes: "" });
  };

  const onSubmit = async (values: typeof productSchema._input) => {
    const res = editing ? await updateProduct(editing.id, values) : await createProduct(values);
    if (res.success) {
      toast.success(editing ? "Produto atualizado" : "Produto criado");
      setOpen(false);
      router.refresh();
    } else toast.error(res.error);
  };

  const onAdjust = async (values: typeof inventoryMovementSchema._input) => {
    const res = await adjustStock(values);
    if (res.success) {
      toast.success("Estoque ajustado");
      setAdjust(null);
      router.refresh();
    } else toast.error(res.error);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const res = await deleteProduct(deleteId);
    setBusy(false);
    if (res.success) {
      toast.success("Produto excluído");
      setDeleteId(null);
      router.refresh();
    } else toast.error(res.error);
  };

  return (
    <div className="card-dark overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
        <h2 className="text-sm font-semibold text-ice-white">Produtos</h2>
        <PrimaryButton onClick={openCreate} className="flex items-center gap-1.5 !px-4 !py-2 text-xs">
          <Plus size={14} /> Novo produto
        </PrimaryButton>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum produto" description="Cadastre seu primeiro produto." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-d-surface-container">
                {["Produto", "SKU", "Categoria", "Qtd", "Preço venda", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.quantity < p.minQuantity;
                return (
                  <tr key={p.id} className="border-t border-d-border hover:bg-d-surface-container/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-ice-white font-medium">{p.name}</td>
                    <td className="px-5 py-3 text-xs text-d-on-surface-variant">{p.sku ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-d-on-surface-variant">{p.category ?? "—"}</td>
                    <td className="px-5 py-3 text-sm tabular-nums text-ice-white">{p.quantity}</td>
                    <td className="px-5 py-3 text-sm tabular-nums text-ice-white">{formatCurrency(p.salePrice)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge label={low ? "Crítico" : "OK"} tone={low ? "warning" : "success"} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openAdjust(p)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-nexus-yellow hover:bg-d-surface-container transition-colors" title="Ajustar estoque">
                          <ArrowUpDown size={14} />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container transition-colors" title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container transition-colors" title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit */}
      <Modal open={open} onOpenChange={setOpen} title={editing ? "Editar produto" : "Novo produto"}>
        <form onSubmit={product.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Nome" error={product.formState.errors.name?.message}>
            <TextInput {...product.register("name")} placeholder="Nome do produto" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU" error={product.formState.errors.sku?.message}>
              <TextInput {...product.register("sku")} placeholder="ABC-123" />
            </Field>
            <Field label="Categoria" error={product.formState.errors.category?.message}>
              <TextInput {...product.register("category")} placeholder="Categoria" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantidade" error={product.formState.errors.quantity?.message}>
              <TextInput type="number" {...product.register("quantity", { valueAsNumber: true })} />
            </Field>
            <Field label="Estoque mínimo" error={product.formState.errors.minQuantity?.message}>
              <TextInput type="number" {...product.register("minQuantity", { valueAsNumber: true })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Preço de custo (R$)" error={product.formState.errors.costPrice?.message}>
              <TextInput type="number" step="0.01" {...product.register("costPrice", { valueAsNumber: true })} />
            </Field>
            <Field label="Preço de venda (R$)" error={product.formState.errors.salePrice?.message}>
              <TextInput type="number" step="0.01" {...product.register("salePrice", { valueAsNumber: true })} />
            </Field>
          </div>
          <Field label="Fornecedor" error={product.formState.errors.supplierId?.message}>
            <Select {...product.register("supplierId")}>
              <option value="">— Nenhum —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton type="submit" disabled={product.formState.isSubmitting}>
              {product.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Adjust stock */}
      <Modal open={adjust !== null} onOpenChange={(o) => !o && setAdjust(null)} title={`Ajustar estoque — ${adjust?.name ?? ""}`}>
        <form onSubmit={move.handleSubmit(onAdjust)} className="space-y-4">
          <input type="hidden" {...move.register("productId")} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Movimento" error={move.formState.errors.type?.message}>
              <Select {...move.register("type")}>
                <option value="IN">Entrada</option>
                <option value="OUT">Saída</option>
                <option value="ADJUST">Definir total</option>
              </Select>
            </Field>
            <Field label="Quantidade" error={move.formState.errors.quantity?.message}>
              <TextInput type="number" {...move.register("quantity", { valueAsNumber: true })} />
            </Field>
          </div>
          <Field label="Observação" error={move.formState.errors.notes?.message}>
            <TextInput {...move.register("notes")} placeholder="Motivo do ajuste" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={() => setAdjust(null)}>Cancelar</GhostButton>
            <PrimaryButton type="submit" disabled={move.formState.isSubmitting}>
              {move.formState.isSubmitting ? "Aplicando..." : "Aplicar"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        message="Excluir este produto e seus movimentos de estoque?"
        onConfirm={confirmDelete}
        loading={busy}
      />
    </div>
  );
}
