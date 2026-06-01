"use client";

import { Modal } from "@/components/ui/Modal";
import { GhostButton } from "@/components/ui/form";

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmar exclusão",
  message,
  confirmLabel = "Excluir",
  onConfirm,
  loading,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title?: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly onConfirm: () => void;
  readonly loading?: boolean;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <p className="text-sm text-d-on-surface-variant mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <GhostButton type="button" onClick={() => onOpenChange(false)}>
          Cancelar
        </GhostButton>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-ice-white bg-danger hover:opacity-90 disabled:opacity-60 transition-all"
        >
          {loading ? "Excluindo..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
