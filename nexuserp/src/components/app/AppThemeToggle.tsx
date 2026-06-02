"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { saveThemePreference } from "@/actions/theme";

const THEME_EVENT = "app-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getSnapshot() {
  return document.getElementById("app-root")?.classList.contains("theme-dark") ?? true;
}

function getServerSnapshot() {
  return true;
}

/**
 * Alterna o tema do app ERP (claro/escuro). Aplica na hora no #app-root, grava
 * cookie (SSR sem flash no reload) e persiste a preferência na conta. O estado é
 * lido diretamente da classe do #app-root via useSyncExternalStore (sem efeito).
 */
export function AppThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const root = document.getElementById("app-root");
    if (!root) return;
    const nextDark = !root.classList.contains("theme-dark");
    root.classList.toggle("theme-dark", nextDark);
    root.classList.toggle("theme-light", !nextDark);
    document.cookie = `nexus-app-theme=${nextDark ? "dark" : "light"};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new Event(THEME_EVENT));
    void saveThemePreference(nextDark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      className="p-2 text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container rounded-full transition-all"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
