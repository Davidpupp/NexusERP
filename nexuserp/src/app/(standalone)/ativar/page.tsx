"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { activateAccount } from "@/actions/account";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-d-surface-container border border-d-border text-sm text-ice-white placeholder-d-on-surface-variant focus:outline-none focus:border-nexus-yellow focus:ring-2 focus:ring-nexus-yellow/20 focus:bg-graphite-surface transition-all";

function ActivateForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const plan = params.get("plan") ?? "";
  const isInvite = params.get("invite") === "1";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    const res = await activateAccount(token, password);
    if (!res.success) { setLoading(false); setError(res.error); return; }
    // Auto-login com a senha recém-criada e segue para a configuração.
    const login = await signIn("credentials", { email: res.data.email, password, redirect: false });
    if (login?.error) {
      setLoading(false);
      router.push("/login");
      return;
    }
    // Convidado entra direto no app (empresa já configurada); novo titular
    // pós-pagamento segue para o onboarding.
    router.push(isInvite ? "/app/dashboard" : "/onboarding");
  };

  return (
    <div className="theme-dark min-h-screen bg-absolute-black text-ice-white flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-72 opacity-50"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(34,197,94,0.12), transparent 70%)" }}
      />
      <header className="relative border-b border-d-border/70 py-4 px-6">
        <div className="max-w-2xl mx-auto"><Logo size="md" href="/" variant="dark" /></div>
      </header>

      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full card-dark p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold text-ice-white font-sora mb-1">
            {isInvite ? "Você foi convidado!" : "Pagamento confirmado!"}
          </h1>
          <p className="text-d-on-surface-variant mb-6">
            {isInvite
              ? "Crie sua senha para acessar a NexusERP da sua empresa."
              : `${plan ? `Plano ${plan} ativado. ` : ""}Crie sua senha para acessar.`}
          </p>

          {!token ? (
            <>
              <p className="text-sm text-danger">Link de ativação inválido.</p>
              <Link href="/login" className="inline-block mt-4 text-sm font-semibold text-ice-white underline">Ir para o login</Link>
            </>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4 text-left">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crie uma senha (mín. 8)" className={inputClass} />
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirme a senha" className={inputClass} />
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim disabled:opacity-60 transition-all hover:shadow-glow flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Ativando…" : "Ativar e acessar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AtivarPage() {
  return (
    <Suspense>
      <ActivateForm />
    </Suspense>
  );
}
