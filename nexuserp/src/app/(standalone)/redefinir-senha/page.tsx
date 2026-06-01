"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { resetPassword } from "@/actions/account";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);
    if (res.success) {
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } else setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size="lg" href="/" /></div>
        <div className="bg-white rounded-2xl border border-border p-8 shadow-card">
          {done ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-graphite mb-2">Senha alterada!</h1>
              <p className="text-sm text-muted">Redirecionando para o login…</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-graphite mb-2">Criar nova senha</h1>
              <p className="text-sm text-muted mb-6">Mínimo 8 caracteres.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha"
                  className="w-full px-4 py-3 rounded-lg bg-soft-gray border border-border text-sm text-graphite placeholder-silver focus:outline-none focus:border-banana focus:ring-2 focus:ring-banana/20" />
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmar senha"
                  className="w-full px-4 py-3 rounded-lg bg-soft-gray border border-border text-sm text-graphite placeholder-silver focus:outline-none focus:border-banana focus:ring-2 focus:ring-banana/20" />
                {error && <p className="text-xs text-danger">{error}</p>}
                <button type="submit" disabled={loading || !token} className="w-full py-3 rounded-full font-semibold text-graphite bg-banana hover:bg-banana-dark disabled:opacity-60 transition-all">
                  {loading ? "Salvando..." : "Salvar nova senha"}
                </button>
              </form>
              {!token && <p className="text-xs text-danger mt-3 text-center">Link inválido.</p>}
              <Link href="/login" className="block text-center mt-4 text-sm text-muted hover:text-graphite">Voltar ao login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
