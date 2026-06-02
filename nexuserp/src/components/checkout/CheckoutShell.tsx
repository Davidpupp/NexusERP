"use client";

import { Logo } from "@/components/site/Logo";
import { ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Escolher plano", "Seus dados", "Pagamento"];

export function CheckoutShell({
  step,
  children,
}: {
  readonly step: 1 | 2 | 3;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="theme-dark min-h-screen bg-absolute-black text-ice-white">
      {/* Glow de fundo sutil */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-64 opacity-40"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(255,212,0,0.10), transparent 70%)" }}
      />
      <header className="relative border-b border-d-border/70">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Logo size="md" href="/" variant="dark" />
          <div className="flex items-center gap-2 text-xs text-d-on-surface-variant">
            <Lock size={13} className="text-success" />
            <span>Pagamento criptografado</span>
          </div>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-6 pt-8">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = n === step;
            const done = n < step;
            return (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    active ? "text-ice-white" : done ? "text-success" : "text-d-on-surface-variant"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border",
                      active
                        ? "bg-nexus-yellow text-absolute-black border-nexus-yellow"
                        : done
                          ? "border-success text-success"
                          : "border-d-border text-d-on-surface-variant"
                    )}
                  >
                    {done ? "✓" : n}
                  </span>
                  <span className="hidden sm:inline font-medium">{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="w-8 sm:w-16 h-px bg-d-border" />}
              </div>
            );
          })}
        </div>

        {children}

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-d-on-surface-variant py-10">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-success" /> SSL 256-bit</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-success" /> Conformidade LGPD</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-success" /> Processado por Mercado Pago</span>
        </div>
      </div>
    </div>
  );
}
