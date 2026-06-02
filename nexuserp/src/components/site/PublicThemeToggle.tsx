"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_EVENT = "public-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getSnapshot() {
  return document.getElementById("public-root")?.classList.contains("public-dark") ?? false;
}

function getServerSnapshot() {
  return false;
}

/**
 * Alterna o tema do site público (claro/escuro). A escolha é aplicada na hora
 * no wrapper #public-root e persistida em cookie — o layout (server component)
 * lê o cookie e já renderiza com a classe certa, então não há flash ao recarregar.
 * O estado é lido da classe do #public-root via useSyncExternalStore (sem efeito).
 */
export function PublicThemeToggle({ className }: { readonly className?: string }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const root = document.getElementById("public-root");
    if (!root) return;
    const next = !root.classList.contains("public-dark");
    root.classList.toggle("public-dark", next);
    document.cookie = `nexus-pub-theme=${next ? "dark" : "light"};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new Event(THEME_EVENT));
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
