"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { saveThemePreference } from "@/actions/theme";

/**
 * Alterna o tema do app ERP (claro/escuro). Aplica na hora no #app-root, grava
 * cookie (SSR sem flash no reload) e persiste a preferência na conta.
 */
export function AppThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.getElementById("app-root")?.classList.contains("theme-dark") ?? true);
  }, []);

  const toggle = () => {
    const root = document.getElementById("app-root");
    if (!root) return;
    const nextDark = !root.classList.contains("theme-dark");
    root.classList.toggle("theme-dark", nextDark);
    root.classList.toggle("theme-light", !nextDark);
    document.cookie = `nexus-app-theme=${nextDark ? "dark" : "light"};path=/;max-age=31536000;samesite=lax`;
    setDark(nextDark);
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
