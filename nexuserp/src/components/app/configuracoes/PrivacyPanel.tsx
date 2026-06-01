"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Download, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GhostButton } from "@/components/ui/form";
import { exportCompanyData, deleteAccount } from "@/actions/privacy";

export function PrivacyPanel({ isOwner }: { readonly isOwner: boolean }) {
  const [exporting, setExporting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onExport = async () => {
    setExporting(true);
    const res = await exportCompanyData();
    setExporting(false);
    if (!res.success) { toast.error(res.error); return; }
    const blob = new Blob([res.data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexuserp-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados exportados");
  };

  const onDelete = async () => {
    setDeleting(true);
    const res = await deleteAccount();
    if (res.success) {
      toast.success("Conta excluída");
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleting(false);
      setConfirmDel(false);
      toast.error(res.error);
    }
  };

  return (
    <div className="bg-graphite-surface rounded-xl border border-d-border p-6 max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={16} className="text-nexus-yellow" />
        <h2 className="text-sm font-semibold text-ice-white">Privacidade & Dados (LGPD)</h2>
      </div>
      <p className="text-xs text-d-on-surface-variant mb-5">Exporte ou exclua permanentemente os dados da sua empresa.</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <GhostButton type="button" onClick={onExport} disabled={exporting} className="flex items-center justify-center gap-2">
          <Download size={15} /> {exporting ? "Exportando..." : "Exportar meus dados"}
        </GhostButton>
        {isOwner && (
          <button
            type="button"
            onClick={() => setConfirmDel(true)}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-danger border border-danger/40 hover:bg-danger/10 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={15} /> Excluir conta e dados
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDel}
        onOpenChange={setConfirmDel}
        title="Excluir conta permanentemente"
        message="Isso apagará TODOS os dados da empresa (clientes, financeiro, estoque, etc.) e sua conta. Esta ação é irreversível."
        confirmLabel="Excluir tudo"
        onConfirm={onDelete}
        loading={deleting}
      />
    </div>
  );
}
