"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/notifications";

export interface NotifItem {
  id: string;
  title: string;
  message: string | null;
  severity: string;
  read: boolean;
  date: string;
}

const DOT: Record<string, string> = {
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-danger",
  critical: "bg-danger",
};

export function NotificationBell({ notifications }: { readonly notifications: NotifItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const onItem = async (id: string, read: boolean) => {
    if (read) return;
    await markNotificationRead(id);
    router.refresh();
  };
  const allRead = async () => {
    await markAllNotificationsRead();
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-d-on-surface-variant hover:text-ice-white hover:bg-d-surface-container rounded-full transition-all"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-nexus-yellow text-absolute-black text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50 rounded-xl bg-graphite-surface border border-d-border shadow-glow scrollbar-thin">
            <div className="flex items-center justify-between px-4 py-3 border-b border-d-border sticky top-0 bg-graphite-surface">
              <span className="text-sm font-semibold text-ice-white">Notificações</span>
              {unread > 0 && (
                <button onClick={allRead} className="text-xs text-nexus-yellow hover:underline">Marcar todas</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-sm text-d-on-surface-variant text-center">Sem notificações.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onItem(n.id, n.read)}
                  className={`w-full text-left px-4 py-3 border-b border-d-border/60 hover:bg-d-surface-container transition-colors ${!n.read ? "bg-d-surface-container/40" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${DOT[n.severity] ?? "bg-info"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ice-white">{n.title}</p>
                      {n.message && <p className="text-xs text-d-on-surface-variant leading-snug">{n.message}</p>}
                      <p className="text-[11px] text-d-on-surface-variant mt-0.5">{n.date}</p>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-nexus-yellow mt-1.5 flex-shrink-0" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
