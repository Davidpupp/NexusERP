import Link from "next/link";
import { CheckCircle, ArrowRight, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Suspense } from "react";

function SuccessContent({ orderId, plan }: { orderId: string; plan: string }) {
  return (
    <div className="theme-dark min-h-screen bg-absolute-black text-ice-white flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-72 opacity-50"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(34,197,94,0.12), transparent 70%)" }}
      />
      <header className="relative border-b border-d-border/70 py-4 px-6">
        <div className="max-w-2xl mx-auto">
          <Logo size="md" href="/" variant="dark" />
        </div>
      </header>

      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full card-dark p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>

          <h1 className="text-2xl font-bold text-ice-white font-sora mb-2">Assinatura confirmada!</h1>
          <p className="text-d-on-surface-variant mb-8">
            Bem-vindo à nexusERP. Seu acesso foi liberado automaticamente.
          </p>

          <div className="bg-d-surface-container rounded-xl p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-d-on-surface-variant">Número do pedido</span>
              <span className="font-mono text-xs text-ice-white">{orderId.slice(0, 12)}…</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-d-on-surface-variant">Plano contratado</span>
              <span className="font-semibold text-ice-white">{plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-d-on-surface-variant">Data</span>
              <span className="text-ice-white">{new Intl.DateTimeFormat("pt-BR").format(new Date())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-d-on-surface-variant">Status</span>
              <span className="font-semibold text-success">✓ Confirmado</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/onboarding"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim transition-all hover:shadow-glow"
            >
              Configurar minha conta
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/app/dashboard"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-medium text-ice-white border border-d-border hover:bg-d-surface-container transition-all"
            >
              <LayoutDashboard size={18} />
              Ir direto ao painel
            </Link>
          </div>

          <p className="text-xs text-d-on-surface-variant mt-6">
            Enviamos um e-mail de boas-vindas com as instruções de acesso.
          </p>
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string; plan?: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-absolute-black" />}>
      <SuccessPageInner searchParams={searchParams} />
    </Suspense>
  );
}

async function SuccessPageInner({ searchParams }: { searchParams: Promise<{ order?: string; plan?: string }> }) {
  const params = await searchParams;
  return <SuccessContent orderId={params.order ?? "NXS-000000"} plan={params.plan ?? "Growth"} />;
}

export default SuccessPage;
