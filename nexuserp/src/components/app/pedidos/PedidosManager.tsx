"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Receipt, Check, Ban, X } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, Select, PrimaryButton, GhostButton } from "@/components/ui/form";
import { createSale, updateSaleStatus, deleteSale } from "@/actions/sale";
import { formatCurrency } from "@/lib/utils";

interface SaleRow {
  id: string;
  customerName: string | null;
  source: string;
  status: string;
  total: number;
  itemsCount: number;
  date: string;
}
interface ItemDraft { productId: string; description: string; quantity: number; unitPrice: number }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Rascunho", cls: "bg-d-surface-high text-d-on-surface-variant" },
  CONFIRMED: { label: "Confirmado", cls: "bg-info/15 text-info" },
  PAID: { label: "Pago", cls: "bg-success/15 text-success" },
  CANCELED: { label: "Cancelado", cls: "bg-danger/15 text-danger" },
};
const SOURCE_LABEL: Record<string, string> = { MANUAL: "Manual", ECOMMERCE: "E-commerce", WEBSITE: "Site", IMPORTED: "Importado" };

const emptyItem = (): ItemDraft => ({ productId: "", description: "", quantity: 1, unitPrice: 0 });

export function PedidosManager({
  sales,
  customers,
  products,
}: {
  readonly sales: SaleRow[];
  readonly customers: { id: string; name: string }[];
  readonly products: { id: string; name: string; salePrice: number }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState<string | null>(null);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const reset = () => { setCustomerId(""); setNotes(""); setItems([emptyItem()]); };

  const updateItem = (idx: number, patch: Partial<ItemDraft>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };
  const onPickProduct = (idx: number, productId: string) => {
    const p = productMap.get(productId);
    updateItem(idx, { productId, description: p ? p.name : items[idx].description, unitPrice: p ? p.salePrice : items[idx].unitPrice });
  };

  const submit = async () => {
    const clean = items.filter((i) => i.description.trim() && i.quantity > 0);
    if (clean.length === 0) { toast.error("Adicione ao menos um item."); return; }
    setBusy(true);
    const res = await createSale({
      customerId: customerId || undefined,
      notes: notes || undefined,
      items: clean.map((i) => ({ productId: i.productId || undefined, description: i.description, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
    });
    setBusy(false);
    if (res.success) {
      toast.success("Venda registrada — estoque e financeiro atualizados");
      setOpen(false);
      reset();
      router.refresh();
    } else toast.error(res.error);
  };

  const changeStatus = async (id: string, status: "PAID" | "CANCELED") => {
    setStatusBusy(id);
    const res = await updateSaleStatus(id, status);
    setStatusBusy(null);
    if (res.success) { toast.success(status === "PAID" ? "Marcada como paga" : "Venda cancelada"); router.refresh(); }
    else toast.error(res.error);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    const res = await deleteSale(deleteId);
    setBusy(false);
    if (res.success) { toast.success("Venda excluída"); setDeleteId(null); router.refresh(); }
    else toast.error(res.error);
  };

  return (
    <div className="bg-graphite-surface rounded-xl border border-d-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-d-border">
        <h2 className="text-sm font-semibold text-ice-white">Pedidos de venda</h2>
        <PrimaryButton onClick={() => { reset(); setOpen(true); }} className="flex items-center gap-1.5 !px-4 !py-2 text-xs">
          <Plus size={14} /> Novo pedido
        </PrimaryButton>
      </div>

      {sales.length === 0 ? (
        <EmptyState icon={Receipt} title="Nenhum pedido" description="Registre uma venda — o estoque e o financeiro são atualizados automaticamente." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-d-surface-container">
                {["Cliente", "Origem", "Itens", "Total", "Status", "Data", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-d-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const st = STATUS_MAP[s.status] ?? STATUS_MAP.CONFIRMED;
                return (
                  <tr key={s.id} className="border-t border-d-border hover:bg-d-surface-container/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-ice-white font-medium">{s.customerName ?? "Consumidor"}</td>
                    <td className="px-5 py-3 text-xs text-d-on-surface-variant">{SOURCE_LABEL[s.source] ?? s.source}</td>
                    <td className="px-5 py-3 text-sm tabular-nums text-ice-white">{s.itemsCount}</td>
                    <td className="px-5 py-3 text-sm tabular-nums text-ice-white">{formatCurrency(s.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-d-on-surface-variant">{s.date}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {s.status === "CONFIRMED" && (
                          <button onClick={() => changeStatus(s.id, "PAID")} disabled={statusBusy === s.id} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-success hover:bg-d-surface-container transition-colors" title="Marcar como paga">
                            <Check size={14} />
                          </button>
                        )}
                        {s.status !== "CANCELED" && s.status !== "PAID" && (
                          <button onClick={() => changeStatus(s.id, "CANCELED")} disabled={statusBusy === s.id} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-warning hover:bg-d-surface-container transition-colors" title="Cancelar (devolve estoque)">
                            <Ban size={14} />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg text-d-on-surface-variant hover:text-danger hover:bg-d-surface-container transition-colors" title="Excluir">
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

      <Modal open={open} onOpenChange={setOpen} title="Novo pedido de venda">
        <div className="space-y-4">
          <Field label="Cliente (opcional)">
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Consumidor não identificado</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>

          <div>
            <p className="block text-sm font-medium text-ice-white mb-1.5">Itens</p>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:items-center border-b border-d-border/40 pb-3 sm:border-0 sm:pb-0">
                  <div className="col-span-2 sm:col-span-4">
                    <Select value={it.productId} onChange={(e) => onPickProduct(idx, e.target.value)} className="!py-2 text-xs">
                      <option value="">Produto / avulso</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  </div>
                  <div className="col-span-2 sm:col-span-4">
                    <TextInput value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} placeholder="Descrição" className="!py-2 text-xs" />
                  </div>
                  <div className="col-span-1 sm:col-span-1">
                    <TextInput type="number" min={1} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} placeholder="Qtd" className="!py-2 text-xs !px-2" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <TextInput type="number" step="0.01" min={0} value={it.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })} placeholder="Preço" className="!py-2 text-xs !px-2" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button type="button" onClick={() => setItems((p) => (p.length > 1 ? p.filter((_, i) => i !== idx) : p))} className="p-1.5 text-d-on-surface-variant hover:text-danger" title="Remover item">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setItems((p) => [...p, emptyItem()])} className="mt-2 text-xs font-medium text-nexus-yellow hover:text-nexus-yellow-dim inline-flex items-center gap-1">
              <Plus size={13} /> Adicionar item
            </button>
          </div>

          <Field label="Observações (opcional)">
            <TextInput value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas" />
          </Field>

          <div className="flex items-center justify-between pt-2 border-t border-d-border">
            <span className="text-sm text-d-on-surface-variant">Total</span>
            <span className="text-lg font-bold text-ice-white tabular-nums">{formatCurrency(total)}</span>
          </div>

          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={() => setOpen(false)}>Cancelar</GhostButton>
            <PrimaryButton type="button" onClick={submit} disabled={busy}>{busy ? "Registrando..." : "Registrar venda"}</PrimaryButton>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        message="Excluir este pedido? (não devolve estoque — use Cancelar para devolver)"
        onConfirm={confirmDelete}
        loading={busy}
      />
    </div>
  );
}
