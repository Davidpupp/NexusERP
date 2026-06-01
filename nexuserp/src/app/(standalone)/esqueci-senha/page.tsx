"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { requestPasswordReset } from "@/actions/account";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size="lg" href="/" /></div>
        <div className="bg-white rounded-2xl border border-border p-8 shadow-card">
          {sent ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-graphite mb-2">Verifique seu e-mail</h1>
              <p className="text-sm text-muted">Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.</p>
              <Link href="/login" className="inline-block mt-6 text-sm font-semibold text-graphite underline">Voltar ao login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-graphite mb-2">Esqueceu a senha?</h1>
              <p className="text-sm text-muted mb-6">Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-soft-gray border border-border text-sm text-graphite placeholder-silver focus:outline-none focus:border-banana focus:ring-2 focus:ring-banana/20"
                />
                <button type="submit" disabled={loading} className="w-full py-3 rounded-full font-semibold text-graphite bg-banana hover:bg-banana-dark disabled:opacity-60 transition-all">
                  {loading ? "Enviando..." : "Enviar link"}
                </button>
              </form>
              <Link href="/login" className="block text-center mt-4 text-sm text-muted hover:text-graphite">Voltar ao login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
