"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  ShoppingBag,
  Receipt,
  Users,
  Package,
  ShoppingCart,
  Cog,
  FolderKanban,
  BarChart3,
  Zap,
  Plug,
  Settings,
  Headphones,
  UserCircle,
  LogOut,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { cn, getInitials } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { canAccessModule, type ModuleKey, type PlanSlug, type UserRole } from "@/lib/authz";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { label: "Financeiro", href: "/app/financeiro", icon: DollarSign },
  { label: "Vendas", href: "/app/vendas", icon: ShoppingBag },
  { label: "Pedidos", href: "/app/pedidos", icon: Receipt },
  { label: "Clientes", href: "/app/clientes", icon: Users },
  { label: "Estoque", href: "/app/estoque", icon: Package },
  { label: "Compras", href: "/app/compras", icon: ShoppingCart },
  { label: "Produção", href: "/app/producao", icon: Cog },
  { label: "Projetos", href: "/app/projetos", icon: FolderKanban },
  { label: "Relatórios", href: "/app/relatorios", icon: BarChart3 },
  { label: "Automações", href: "/app/automacoes", icon: Zap },
  { label: "Integrações", href: "/app/integracoes", icon: Plug },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Configurações", href: "/app/configuracoes", icon: Settings },
  { label: "Suporte", href: "/app/suporte", icon: Headphones },
  { label: "Portal Cliente", href: "/app/portal-cliente", icon: UserCircle },
];

export function AppSidebar({
  planSlug,
  role,
  userName,
  userEmail,
  primaryModules = [],
  onNavigate,
}: {
  readonly planSlug: PlanSlug;
  readonly role: UserRole;
  readonly userName: string;
  readonly userEmail: string;
  readonly primaryModules?: string[];
  readonly onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isPrimary = (href: string) => primaryModules.includes(href.replace("/app/", ""));

  // Módulos recomendados pelo segmento vêm primeiro (Dashboard sempre no topo).
  const orderedNav = [...NAV_ITEMS].sort((a, b) => {
    if (a.href === "/app/dashboard") return -1;
    if (b.href === "/app/dashboard") return 1;
    return Number(isPrimary(b.href)) - Number(isPrimary(a.href));
  });

  const renderItem = (item: NavItem) => {
    const key = item.href.replace("/app/", "") as ModuleKey;
    const access = canAccessModule(planSlug, role, key);
    if (!access.ok && access.reason === "role") return null;

    const Icon = item.icon;
    const active = isActive(item.href);
    const locked = !access.ok && access.reason === "plan";
    const href = locked ? `/app/upgrade?m=${key}` : item.href;

    return (
      <Link
        key={item.href}
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
          active && !locked
            ? "bg-nexus-yellow/15 text-ice-white"
            : "text-d-on-surface-variant hover:bg-d-surface-container hover:text-ice-white",
          locked && "opacity-60"
        )}
      >
        {active && !locked && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-nexus-yellow rounded-r" />
        )}
        <Icon
          size={18}
          className={cn(
            "flex-shrink-0",
            active && !locked ? "text-nexus-yellow" : "text-d-on-surface-variant group-hover:text-ice-white"
          )}
        />
        <span className="flex-1">{item.label}</span>
        {!locked && isPrimary(item.href) && !active && (
          <span className="w-1.5 h-1.5 rounded-full bg-nexus-yellow" title="Recomendado p/ seu negócio" />
        )}
        {locked && <Lock size={13} className="text-d-on-surface-variant" />}
      </Link>
    );
  };

  return (
    <aside className="w-[220px] min-h-screen bg-graphite-surface border-r border-d-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-d-border">
        <Logo size="sm" href="/app/dashboard" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {orderedNav.map(renderItem)}

        {/* Separator */}
        <div className="my-3 border-t border-d-border" />

        {BOTTOM_ITEMS.map(renderItem)}
      </nav>

      {/* User bottom */}
      <div className="p-3 border-t border-d-border">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-d-surface-container transition-colors">
          <div className="w-8 h-8 rounded-full bg-nexus-yellow flex items-center justify-center text-absolute-black text-xs font-bold flex-shrink-0">
            {getInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ice-white truncate">{userName}</p>
            <p className="text-xs text-d-on-surface-variant truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1 text-d-on-surface-variant hover:text-danger transition-colors"
            title="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
