"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { verifyEmail } from "@/actions/account";

function Verifier() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) { setState("error"); return; }
      const res = await verifyEmail(token);
      if (active) setState(res.success ? "ok" : "error");
    })();
    return () => { active = false; };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8"><Logo size="lg" href="/" /></div>
        <div className="bg-white rounded-2xl border border-border p-8 shadow-card">
          {state === "loading" && <p className="text-sm text-muted">Verificando…</p>}
          {state === "ok" && (
            <>
              <h1 className="text-xl font-bold text-graphite mb-2">E-mail confirmado!</h1>
              <p className="text-sm text-muted mb-6">Sua conta está ativa.</p>
              <Link href="/login" className="inline-block px-6 py-3 rounded-full font-semibold text-graphite bg-banana hover:bg-banana-dark transition-all">Entrar</Link>
            </>
          )}
          {state === "error" && (
            <>
              <h1 className="text-xl font-bold text-graphite mb-2">Link inválido</h1>
              <p className="text-sm text-muted">O link de verificação é inválido ou expirou.</p>
              <Link href="/login" className="inline-block mt-6 text-sm font-semibold text-graphite underline">Voltar ao login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense>
      <Verifier />
    </Suspense>
  );
}
