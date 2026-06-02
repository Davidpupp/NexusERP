import type { Metadata } from "next";
import { Logo } from "@/components/site/Logo";
import { SignOutButton } from "@/components/app/SignOutButton";
import { requirePlatformAdmin } from "@/lib/platform-admin";

export const metadata: Metadata = {
  title: "Administração da plataforma | NexusERP",
  robots: { index: false, follow: false },
};

/**
 * Shell da área de PLATAFORMA (/admin). Server component — aplica o guard de
 * super-admin antes de renderizar qualquer página filha. Tema escuro, sem
 * relação com o ERP dos clientes (tenants).
 */
export default async function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  const { email } = await requirePlatformAdmin();

  return (
    <div className="theme-dark min-h-screen bg-absolute-black text-ice-white">
      <header className="border-b border-d-border/70">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <Logo size="md" href="/admin" variant="dark" />
            <span className="hidden sm:inline text-xs font-medium text-d-on-surface-variant border-l border-d-border pl-3">
              Plataforma
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-d-on-surface-variant">{email}</span>
            <SignOutButton className="text-xs font-medium text-d-on-surface-variant hover:text-ice-white transition-colors" />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
