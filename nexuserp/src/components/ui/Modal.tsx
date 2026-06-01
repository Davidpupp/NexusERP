"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-graphite-surface border border-d-border p-6 shadow-glow focus:outline-none max-h-[88vh] overflow-y-auto scrollbar-thin">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-ice-white font-sora">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-d-on-surface-variant mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="p-1 rounded-lg text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
