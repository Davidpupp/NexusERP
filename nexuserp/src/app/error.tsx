"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to your monitoring (Sentry, etc.) in production.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-warm-white px-6 text-center">
      <h1 className="text-2xl font-semibold text-graphite">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-muted">
        Ocorreu um erro inesperado. Tente novamente em alguns instantes.
      </p>
      {error.digest && <p className="mt-2 text-xs text-silver">Ref: {error.digest}</p>}
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-banana px-6 py-3 font-semibold text-graphite transition-colors hover:bg-banana-dark"
      >
        <RotateCcw size={18} />
        Tentar novamente
      </button>
    </main>
  );
}
