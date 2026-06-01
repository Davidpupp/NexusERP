"use client";

import { forwardRef, useId, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full px-3 py-2.5 rounded-lg bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 transition-all";

export function Field({
  label,
  error,
  children,
}: {
  readonly label: string;
  readonly error?: string;
  readonly children: React.ReactNode;
}) {
  const id = useId();
  // Associa o label ao controle (acessibilidade + testabilidade) injetando id.
  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ id?: string }>, { id })
    : children;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ice-white mb-1.5">
        {label}
      </label>
      {control}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput(props, ref) {
    return <input ref={ref} {...props} className={cn(base, props.className)} />;
  }
);

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea(props, ref) {
    return <textarea ref={ref} rows={3} {...props} className={cn(base, "resize-none", props.className)} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select(props, ref) {
    return <select ref={ref} {...props} className={cn(base, props.className)} />;
  }
);

export function PrimaryButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "px-5 py-2.5 rounded-full text-sm font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all",
        className
      )}
    />
  );
}

export function GhostButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "px-5 py-2.5 rounded-full text-sm font-medium text-ice-white border border-d-border hover:bg-d-surface-container transition-all",
        className
      )}
    />
  );
}
