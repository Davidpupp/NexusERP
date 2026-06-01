import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-warm-white px-6 text-center">
      <p className="font-sora text-7xl font-bold text-banana">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-graphite">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-muted">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-banana px-6 py-3 font-semibold text-graphite transition-colors hover:bg-banana-dark"
      >
        <Home size={18} />
        Voltar ao início
      </Link>
    </main>
  );
}
