import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

const LABELS: Record<string, string> = {
  compras: "Compras",
  producao: "Produção",
  projetos: "Projetos",
  automacoes: "Automações",
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const label = m ? (LABELS[m] ?? m) : "este módulo";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl bg-nexus-yellow/10 flex items-center justify-center mb-6">
        <Lock size={36} className="text-nexus-yellow" />
      </div>
      <h2 className="text-xl font-bold text-ice-white mb-2">Módulo não incluído no seu plano</h2>
      <p className="text-d-on-surface-variant text-sm max-w-sm mb-6">
        O módulo <strong className="text-ice-white">{label}</strong> está disponível a partir do plano
        Growth. Faça upgrade para desbloquear.
      </p>
      <Link
        href="/planos"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim transition-all"
      >
        Ver planos <ArrowRight size={18} />
      </Link>
    </div>
  );
}
