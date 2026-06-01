"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "nexuserp-consent";

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (!localStorage.getItem(KEY)) setShow(true);
      } catch {
        /* localStorage indisponível */
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-2xl bg-white border border-border rounded-2xl shadow-card p-4 flex flex-col sm:flex-row items-center gap-4">
      <p className="text-sm text-muted flex-1">
        Usamos cookies essenciais e, com seu consentimento, cookies para melhorar sua experiência. Saiba mais na nossa{" "}
        <Link href="/privacidade" className="text-graphite font-medium underline">Política de Privacidade</Link>.
      </p>
      <button
        onClick={accept}
        className="px-5 py-2.5 rounded-full text-sm font-semibold text-graphite bg-banana hover:bg-banana-dark transition-all whitespace-nowrap"
      >
        Aceitar
      </button>
    </div>
  );
}
