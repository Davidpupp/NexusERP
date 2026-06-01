import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";
import { SignOutButton } from "@/components/app/SignOutButton";

/**
 * Página de bloqueio para clientes sem assinatura ATIVA (ou empresa bloqueada).
 * Fica fora do layout de `(app)/app` — que chama `getCurrentCompany` e
 * redirecionaria de volta para cá, criando um loop. Só exige sessão válida.
 */
export default async function SemAcessoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-absolute-black text-ice-white flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-72 opacity-40"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(255,212,0,0.10), transparent 70%)" }}
      />
      <header className="relative border-b border-d-border/70 py-4 px-6">
        <div className="max-w-2xl mx-auto"><Logo size="md" href="/" variant="dark" /></div>
      </header>

      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full card-dark p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-nexus-yellow/10 flex items-center justify-center mx-auto mb-5">
            <Lock size={32} className="text-nexus-yellow" />
          </div>
          <h1 className="text-2xl font-bold text-ice-white font-sora mb-2">Acesso não liberado</h1>
          <p className="text-d-on-surface-variant mb-1">
            O acesso à NexusERP depende de uma contratação ativa.
          </p>
          <p className="text-d-on-surface-variant text-sm mb-6">
            Sua assinatura não está ativa no momento. Renove a contratação ou fale com nossa
            equipe para liberar o acesso de <strong className="text-ice-white">{session.user.email}</strong>.
          </p>

          <Link
            href="/checkout"
            className="inline-flex w-full items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim transition-all hover:shadow-glow mb-3"
          >
            Adquirir / renovar acesso <ArrowRight size={18} />
          </Link>
          <SignOutButton className="w-full py-3 rounded-full font-medium text-d-on-surface-variant border border-d-border hover:text-ice-white hover:border-d-border-active transition-all" />
        </div>
      </div>
    </div>
  );
}
