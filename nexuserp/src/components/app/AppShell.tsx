"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppHeader } from "@/components/app/AppHeader";
import type { NotifItem } from "@/components/app/NotificationBell";
import type { PlanSlug, UserRole } from "@/lib/authz";

interface SidebarProps {
  planSlug: PlanSlug;
  role: UserRole;
  userName: string;
  userEmail: string;
  primaryModules: string[];
}

/**
 * Casca do app (client) que gerencia o drawer mobile. No desktop a sidebar é
 * fixa; no celular ela vira um drawer sobreposto, aberto pelo hambúrguer do header.
 */
export function AppShell({
  sidebar,
  userName,
  notifications,
  children,
}: {
  readonly sidebar: SidebarProps;
  readonly userName: string;
  readonly notifications: NotifItem[];
  readonly children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);

  return (
    <div
      className="flex h-screen bg-d-surface-low overflow-hidden"
      style={{ backgroundImage: "radial-gradient(48rem 32rem at 100% 0%, rgba(255,212,0,0.05), transparent 60%)" }}
    >
      {/* Sidebar desktop */}
      <div className="hidden md:flex">
        <AppSidebar {...sidebar} />
      </div>

      {/* Drawer mobile */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full">
            <AppSidebar {...sidebar} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader userName={userName} notifications={notifications} onMenu={() => setDrawer(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
