"use client";

import { Search, Plus, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { NotificationBell, type NotifItem } from "@/components/app/NotificationBell";
import { AppThemeToggle } from "@/components/app/AppThemeToggle";

const PAGE_TITLES: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/financeiro": "Financeiro",
  "/app/vendas": "Vendas",
  "/app/pedidos": "Pedidos de Venda",
  "/app/clientes": "Clientes",
  "/app/estoque": "Estoque",
  "/app/compras": "Compras",
  "/app/producao": "Produção",
  "/app/projetos": "Projetos",
  "/app/relatorios": "Relatórios",
  "/app/automacoes": "Automações",
  "/app/integracoes": "Integrações",
  "/app/configuracoes": "Configurações",
  "/app/suporte": "Suporte",
  "/app/portal-cliente": "Portal do Cliente",
};

export function AppHeader({
  userName,
  notifications = [],
  onMenu,
}: {
  readonly userName: string;
  readonly notifications?: NotifItem[];
  readonly onMenu?: () => void;
}) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "nexusERP";

  return (
    <header className="h-16 bg-graphite-surface border-b border-d-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Title + hambúrguer mobile */}
      <div className="flex items-center gap-2 min-w-0">
        {onMenu && (
          <button onClick={onMenu} className="md:hidden p-2 -ml-2 text-d-on-surface-variant hover:text-ice-white" aria-label="Abrir menu">
            <Menu size={20} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-ice-white truncate">{title}</h1>
          <p className="text-xs text-d-on-surface-variant hidden sm:block">
          {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={15} className="absolute left-3 text-d-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 rounded-full bg-d-surface-container text-sm text-ice-white placeholder-d-on-surface-variant w-56 focus:outline-none focus:ring-2 focus:ring-nexus-yellow/30 focus:bg-d-surface-high transition-all"
          />
        </div>

        {/* New button */}
        <button className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-absolute-black bg-nexus-yellow hover:bg-nexus-yellow-dim transition-all">
          <Plus size={15} />
          Novo
        </button>

        {/* Theme toggle */}
        <AppThemeToggle />

        {/* Notifications */}
        <NotificationBell notifications={notifications} />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-nexus-yellow flex items-center justify-center text-absolute-black text-xs font-bold cursor-pointer" title={userName}>
          {getInitials(userName)}
        </div>
      </div>
    </header>
  );
}
