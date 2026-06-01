"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Alterna o tema do site público (claro/escuro). A escolha é aplicada na hora
 * no wrapper #public-root e persistida em cookie — o layout (server component)
 * lê o cookie e já renderiza com a classe certa, então não há flash ao recarregar.
 */
export function PublicThemeToggle({ className }: { readonly className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.getElementById("public-root")?.classList.contains("public-dark") ?? false);
  }, []);

  const toggle = () => {
    const root = document.getElementById("public-root");
    if (!root) return;
    const next = !root.classList.contains("public-dark");
    root.classList.toggle("public-dark", next);
    document.cookie = `nexus-pub-theme=${next ? "dark" : "light"};path=/;max-age=31536000;samesite=lax`;
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      className={className}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
